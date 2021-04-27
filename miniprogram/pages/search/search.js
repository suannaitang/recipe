// pages/search/search.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotSerach: [], //热门搜索列表
    searchs: [], //近期搜索列表
    isLogin: false, //是否登录
    searchVal: "", //搜索内容
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this._getHotSearch();
    this._getStorageSearchs();
  },

  // 获取热门搜索内容
  async _getHotSearch() {
    //  根据 views进行降序排序，获取6个菜谱内容
    let res = await api._find(global.tables.recipeTable, {
      status: 1
    }, 1, 6, {
      field: "views",
      sort: "desc"
    });

    // console.log(res)
    this.setData({
      hotSerach: res.data
    })
  },
  // 热门搜索进入菜谱详情页面
  _toDetailPage(e) {
    let {
      id,
      title
    } = e.currentTarget.dataset;
    // 将搜索的内容，存入到本地缓存中，做近期搜索
    //   searchs  [“”，“”，"面"，“肉”]
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

    // console.log(searchs)
    // 将searchs存入到缓存中
    wx.setStorageSync('searchs', searchs)
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
    })
  },

  // 获取近期搜索内容
  _getStorageSearchs() {
    let openid = wx.getStorageSync('openid') || null;
    if (openid == null) {
      this.setData({
        isLogin: false, //未登录
      })
      return;
    }

    // 先去获取缓存信息
    let searchs = wx.getStorageSync('searchs') || [];
    // console.log(openid)
    this.setData({
      searchs,
      isLogin: true
    })

  },
  // ，进入菜谱列表页面
  _recipelistPage(e) {

    let {
      id = null, title, tag, tip = null
    } = e.currentTarget.dataset;
    if (tag == "search" && title == "") {
      wx.showToast({
        title: '填写搜索内容',
        icon: "none"
      })
      return;
    }
    // 如果是搜索框进入的，需要操作缓存
    // 如果是直接点击近期搜索进入的，不需要操作缓存
    if (tip != null) {
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