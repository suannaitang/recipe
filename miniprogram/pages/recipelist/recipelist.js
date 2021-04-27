import global from "../../utils/global"
import api from "../../utils/api"

// pages/recipelist/recipelist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipes: [], //菜谱数据
    page: 1, //当前默认的页码
    limit: 5, //每页显示的个数
    tips:false, // 当前选项内，每页任何数据的开关
    tip:false, //有数据，但是已经加载完毕了
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 动态的设置标题
    wx.setNavigationBarTitle({
      title: options.title
    })
    this.data.id = options.id; //存储类别id
    this.data.tag = options.tag;//存储查询标识，
    this.data.title = options.title;// （其实存的是搜索的条件）
    this._getRecipes() // 调用获取菜谱信息的方法
  },

  // 1.获取菜谱信息的
  async _getRecipes() {
    // let tag = this.data.tag;
    //  // // 这些事公共部分，
    //  let page = this.data.page;  // 获取页码
    //  let limit = this.data.limit; // 获取每页显示的数据
     let {tag,page,limit,title} = this.data;
    // 怎么区分 是普通分类进入的，还是热门进入的、推荐进入的、搜索进入的
    let where = {}, // 查询条件
      orderBy = {}; // 排序条件
      // 利用switch ，通过tag标识进行区分，什么方式进入当前页面的
    switch (tag) {
      case "ptfl":
        // 普通分类进入的
        let id = this.data.id;
        // console.log(id)
        where = {
          typeId: id,
          status: 1
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
      case "rmcp":
        // 热门菜谱进入的
        where = {
          status: 1
        }
        orderBy = {
          field: "views",
          sort: "desc"
        }
        break;
      case "tjcp":
        // 推荐菜谱进入的
        where = {
          status: 1
        }
        orderBy = {
          field: "follows",
          sort: "desc"
        }
        break;
      case "search":
        // 模糊搜索进入的
        where = {
          // 利用正则对象进行模糊匹配
          recipeName: api.db.RegExp({
            regexp: title,
            options: 'i', //不区分大小写
          })
        }
        orderBy={
          field: "time",
          sort: "desc"
        }

        break;
    }
    // console.log(where,orderBy)
    // 将 where 条件，orderBy条件传递到 查询语句中
    let res = await api._find(global.tables.recipeTable, where, page, limit, orderBy);
    
    // 判断当前res。data是否有值，有值继续向下执行，每有值，return；
    // if(1 == page  &&  res.data.length <=0)  真 || 假
    if(res.data.length <=0 && 1 == page){
        // 如果是第一页，并且数据为空，则直接返回
      this.setData({
        tips:true
      })
      return;
    }
    // 判断没有更多数据
    if(res.data.length < limit){
        this.setData({
          tip:true
        })
    }
    // 处理当前菜谱的用户信息
    let userAllPromise = []; //所有的用户信息
    res.data.map((item) => {
      // item._openid  用户的openid
      let userPromise = api._findAll(global.tables.userTable, {
        _openid: item._openid
      })
      userAllPromise.push(userPromise)
    })

    userAllPromise = await Promise.all(userAllPromise)
    // console.log(userAllPromise)
    res.data.map((item, index) => {
      item.userInfo = userAllPromise[index].data[0].userInfo
    })

    // console.log(res.data)
    // 菜谱列表的拼接，  老菜谱 在前面，新菜谱在后面
    res.data =   this.data.recipes.concat(res.data);
    // 设置
    this.setData({
      recipes: res.data
    })
  },

  // 上拉触底事件
  onReachBottom(){
    // console.log(123)
    // 下一页
    this.data.page++; // 当前页码++
    // 再一次调用获取菜谱信息的方法
    this._getRecipes()
  },
  // 跳转到详情页面
  _torecipeDetailPage(e){
    let {id,title}  =e.currentTarget.dataset;
   //  console.log(id,title)
   // 跳转页面
   wx.navigateTo({
     url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
   })
 }


})

