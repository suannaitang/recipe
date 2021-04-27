// pages/pbmenu/pbmenu.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [], //当前所有可以选择的分类
    files: [], //数组对象，图片列表 [{url:"xxx"},{url:"xxx"}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getTypes();
  },
  // 获取所有分类
  async _getTypes() {
    let res = await api._findAll(global.tables.typeTable)
    // console.log(res)
    this.setData({
      types: res.data
    })
  },
  // 选择图片，获取临时图片路径
  _selectImage(e) {
    // console.log(e)
    // 临时图片路径  ["xxx","xxx","xxx"]
    //  [{url:"xxx"},{url:"xxx"}]
    let tempFilePaths = e.detail.tempFilePaths;
    let files = tempFilePaths.map((item) => {
      return {
        url: item
      }
    })
    // console.log(files)
    // 新的图片和老的图片进行拼接
    files = this.data.files.concat(files)
    this.setData({
      files
    })
  },
  // 删除图片操作
  _delImage(e) {
    // console.log(e)
    let index = e.detail.index;
    this.data.files.splice(index, 1);
    this.setData({
      files: this.data.files
    })
  },
  // 执行填加
  async _addRecipe(e) {
    let {
      recipeName,
      typeId,
      recipeMakes
    } = e.detail.value;

    // 判断添加得信息是否补全  
    if (recipeName == "" || typeId == "" || recipeMakes == "" || this.data.files.length <= 0) {
      wx.showToast({
        title: '请补全信息',
        icon: "none"
      })
      return;
    }
    // files
    // 获取文件上传的fileID，用来存储到数据库
    let filesID = await this._uploaderFiles(this.data.files);

    // 设置的额变量，都是固定的值
    let views = 0,
      follows = 0,
      status = 1,
      time = new Date().getTime();

    // 执行添加操作
    let res = await  api._add(global.tables.recipeTable,{
      recipeName,
      typeId,
      recipeMakes,
      views:0,
      follows:0,
      status:1,
      time:new Date().getTime(),
      filesID
    })

    // console.log(res)
    if(res._id){
      wx.showToast({
        title: '发布成功',
        // 1500
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1,
        })
      },1500)
    }
  },

  // 封装文件上传的方法
  async _uploaderFiles(files) {
    let filesID = [];
    // files =[{url:"xxx"},{url:"xxx"}]
    files.forEach((item, index) => {
      let extName = item.url.split(".").pop();
      let cloudPath = new Date().getTime() + "_" + index + "." + extName;
      // console.log(cloudPath)
      let promsie = wx.cloud.uploadFile({
        cloudPath: "web0622/" + cloudPath, // 上传至云端的路径
        filePath: item.url, // 小程序临时文件路径
      })
      filesID.push(promsie)
    })
    filesID = await Promise.all(filesID)
    filesID = filesID.map((item) => {
      return item.fileID
    })
    return filesID;
  }
})