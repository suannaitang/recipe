import global from "../../utils/global"
import api from "../../utils/api"

Page({
  data: {
    hotRecipes: [], //热门菜谱
    types: [], //首页分类展示
    searchVal: "", //搜索的条件
  },
  onShow() {
    this._getHotRecipes();
    this._getTypes();
  },

  // 获取首页热门菜谱
  async _getHotRecipes() {
    //   views  做desc排序
    //   where  = {status:1}
    let res = await api._find(global.tables.recipeTable, {
      status: 1
    }, 1, 4, {
      field: "views",
      sort: "desc"
    })

    // console.log(res)
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

    this.setData({
      hotRecipes: res.data
    })
  },
  // 获取首页分类信息
  async _getTypes() {
    // 2 条
    let res = await api._find(global.tables.typeTable, {}, 1, 2);

    // console.log(res)
    this.setData({
      types: res.data
    })
  },

  // 点击菜谱分类，跳转到分类列表页面
  _typelistPage() {
    wx.navigateTo({
      url: '../typelist/typelist',
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
  // 跳转到详情页面
  _torecipeDetailPage(e) {
    let {
      id,
      title
    } = e.currentTarget.dataset;
    //  console.log(id,title)
    // 跳转页面
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
    })
  }
})