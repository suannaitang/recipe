// pages/personal/personal.js
// let  db =wx.cloud.database();
import global from "../../utils/global"
import api from "../../utils/api"

// console.log(api)
Page({

  data: {
    isLogin: false, //未登录
    userInfo: {}, //用户信息
    activeIndex: "0", //选项卡，默认显示第一个
    recipes: [], //用来存储菜谱信息
    allTypes:[],//所有的分类
    followRecipes:[],//关注的菜谱
  },
  onShow() {
    // console.log(123)
    let _this = this;
    // 1.检测是否登录
    wx.checkSession({
      success: (res) => {
        // 获取用户信息
        let userInfo = wx.getStorageSync('userInfo') || {};
        //已经登录了
        _this.setData({
          isLogin: true,
          userInfo
        })

        // 获取activeIndex所对应的信息
        this._getActiveIndexMsg()

      },
      fail() {
        // 没有登录
        _this.setData({
          isLogin: false
        })
        // 不要直接登录
        wx.showToast({
          title: '请先去登录哦',
          icon: "none"
        })
      }
    })
  },
  // 执行登录
  _doLogin(e) {
    let _this = this;
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登录才能有意想不到的感受',
        icon: "none"
      })
      return;
    }
    // 执行登录操作
    wx.login({
      async success() {
        //登录成功
        // 用户信息： e.detail.userInfo
        // let userInfo = e.detail.userInfo;
        // 1.先去查询当前用户是否登录访问过
        // 用openid去查询， 去users表中查询
        wx.cloud.callFunction({
          name: "login",
          async success(respnse) {
            console.log(respnse)
            let _openid = r.result.openid;

            let res = await api._findAll(global.tables.userTable, {
              _openid
            });

            // console.log(res)
            if (res == null) {
              // 没有数据
              // 2.插入到用户管理数据库
              // db.collection(global.tables.userTable).add({})
              let result = await api._add(global.tables.userTable, {
                userInfo
              });
              if (!result._id) {
                // 登录失败
                _this.setData({
                  isLogin: false
                })

                return;
              }
            }
            //登录成功
            _this.setData({
              isLogin: true,
              userInfo
            })
            // 将用户信息存入缓存
            wx.setStorageSync('userInfo', userInfo)
            wx.setStorageSync('openid', _openid);
            // 获取activeIndex所对应的信息
            _this._getActiveIndexMsg()
            wx.showToast({
              title: '登录成功',
            })

          }
        })
      }
    })


  },
  // 进入分类管理页面
  _toTypesPage() {
    let _openid = wx.getStorageSync("openid");
    if (global.adminOpenid != _openid) {
      return;
    }
    wx.navigateTo({
      url: '../pbmenutype/pbmenutype',
    })
  },
  // 点击加，进入发布菜谱页面
  _recipePage() {
    wx.navigateTo({
      url: '../pbmenu/pbmenu',
    })
  },
  _changeAtiveIndex(e) {
    let activeIndex = e.currentTarget.dataset.index;
    this.setData({
      activeIndex // 更改了值
    }, function () {
      this._getActiveIndexMsg();
    })
  },

  _getActiveIndexMsg() {
    // 最新的activeIndex 的值
    let activeIndex = this.data.activeIndex;
    switch (activeIndex) {
      case "0":
        this._getRecipeList()
        break;
      case "1":
        this._getTypeList()
        break;
      case "2":
        this._getFollowList()
        break;
    }
  },

  // 获取菜谱列表
  async _getRecipeList() {
    // console.log("菜谱")
    // 一次性获取全部的菜谱信息，  time 时间排序
    let _openid = wx.getStorageSync('openid');
    let res = await api._findAll(global.tables.recipeTable, {
      _openid,
      status: 1
    }, {
      field: "time",
      sort: "desc"
    });

    // console.log(res)
    this.setData({
      recipes: res.data
    })

  },
  // 删除菜谱
  _delRecipe(e) {
    let {
      id,
      index
    } = e.currentTarget.dataset;
    let _this = this;
    wx.showModal({
      title: "删除提示",
      content: "您确定删除么？",
      async success(res) {
        if (res.confirm) {
          //同意删除
          // 执行删除
          let result = await api._updateById(global.tables.recipeTable, id, {
            status: 2
          })
          _this.data.recipes.splice(index, 1)
          _this.setData({
            recipes: _this.data.recipes
          })
        }
      }

    })
  },

  // 获取分类列表
  async _getTypeList() {
    // console.log("分类")
    // 1。获取自己全部的菜谱
    let  _openid = wx.getStorageSync('openid'); //获取用户的唯一标识
    let  where = {
      _openid,
      status:1
    }
    let orderBy = {
      field:"time",
      sort:"desc"
    }
    let  res =  await  api._findAll(global.tables.recipeTable,where,orderBy);
    
    // 2.获取分类id
    let typeIds = res.data.map((item)=>{
        return  item.typeId;
    })
    
    // 3.去重，给数组去重 new  Set(),获取到的是类数组，
    //  Array.from（） 把类数组转换为真正的数组
    typeIds = [...new Set(typeIds)]
    // console.log(Array.from(typeIds))
    // console.log(typeIds)
    // 5个类别
    // 4.获取类别信息
    let allTypes = [];
    typeIds.map((item)=>{
        // item   == 类别id
        let types = api._findById(global.tables.typeTable,item);
        allTypes.push(types)
    })

   
    allTypes = await  Promise.all( allTypes )
     
     this.setData({
       allTypes,
     })

  },
  // 获取关注列表
  async _getFollowList() {
    //  1.获取自己关注的菜谱信息
    let  _openid = wx.getStorageSync('openid'); //获取用户的唯一标识
    let  res =  await  api._findAll(global.tables.followTable,{_openid})
    console.log(res)
    let  allRecipes = [];
    res.data.map((item)=>{
        let recipes = api._findById(global.tables.recipeTable,item.recipeID)

        allRecipes.push(recipes)
    })
    allRecipes = await  Promise.all( allRecipes )
    console.log(allRecipes)
    this.setData({
      followRecipes:allRecipes
    })
    

  },
   // 跳转到详情页面
   _torecipeDetailPage(e){
    let {id,title}  =e.currentTarget.dataset;
   //  console.log(id,title)
   // 跳转页面
   wx.navigateTo({
     url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
   })
 },

  // 点击普通分类，进入菜谱列表页面
  _recipelistPage(e) {

    let {
      id = null, title, tag
    } = e.currentTarget.dataset;
    if (tag == "search" && title == "") {
      wx.showToast({
        title: '填写搜索内容',
        icon: "none"
      })
      return;
    }
    // 存入近期搜索searchs缓存
    if (tag == "search") {
      // 将搜索条件，存入缓存
      let searchs = wx.getStorageSync('searchs') || [];
      let ind = searchs.findIndex((item) => {
        return item == title;
      })
      // -1 代表没有 
      if (ind == -1) {
        //没有,在前面插入
        searchs.unshift(title)
      } else {
        // 已经存在了
        searchs.splice(ind, 1) //先从所在位置删除
        searchs.unshift(title) // 在数组最前面添加
      }

      // 将searchs存入到缓存中
      wx.setStorageSync('searchs', searchs)
    }

    // console.log(id,title,tag)
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })

  },
  


})