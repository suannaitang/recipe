// pages/typelist/typelist.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:[],//所有的分类信息
    searchVal:"",//存的搜索条件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this._getAllTypes();
  },
  // 获取所有的分类信息
  async _getAllTypes(){

    let  res  =  await  api._findAll(global.tables.typeTable);
    // console.log(res)
    this.setData({
      types:res.data
    })

  },
  // 点击普通分类，进入菜谱列表页面
  _recipelistPage(e){

    let {id=null,title,tag} =  e.currentTarget.dataset;
    if(tag == "search" && title == ""){
      wx.showToast({
        title: '填写搜索内容',
        icon:"none"
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

  }
 
})