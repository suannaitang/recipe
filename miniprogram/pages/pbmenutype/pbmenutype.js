// pages/pbmenutype/pbmenutype.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addVal:"",// 添加的分类名称
    types:[],//所有的分类
    updVal:"",//修改的内容
   
  },
  onLoad(){
    this._getTypes();
  },
  // 分类添加
  async _typeAdd(){
    let addVal = this.data.addVal;
    let types = this.data.types;
    let ind = types.findIndex((item)=>{
        return item.typeName == addVal;
    })

    //  -1  没有 
    if(ind != -1){
      wx.showToast({
        title: '当前类别已经存在',
        icon:"none"
      })
      return;
    }


    // 执行添加
    let res = await api._add(global.tables.typeTable,{
      typeName:addVal
    })
    // console.log(res)
    if(res._id){
      wx.showToast({
        title: '添加成功',
      })
      this.setData({
        addVal:""
      })
      this._getTypes()
    }else{
      wx.showToast({
        title: '添加失败',
        icon:"none"
      })
    }
  },
  // 获取所有的菜谱的分类信息
  async _getTypes(){
    let  res =  await api._findAll(global.tables.typeTable)
    // console.log(res)
    this.setData({
      types:res.data
    })
  },
  // 删除
  async _delType(e){
    let {id,index}  = e.currentTarget.dataset;
    // console.log(id)
    let res = await  api._delById(global.tables.typeTable,id);
    // console.log(res)
    if(res.stats.removed ==1){
      wx.showToast({
        title: '删除成功',
      })
      // 
      // this._getTypes()
      // 根据索引，在types将此元素删除
      this.data.types.splice(index,1)
      this.setData({
        types:this.data.types
      })
    }
  },
  // 加载修改页面
  _editPage(e){
    let {index}  = e.currentTarget.dataset;
    this.setData({
      updVal:this.data.types[index].typeName,
      _id:this.data.types[index]._id
    })
  },
  // 执行修改
  async _doUpdate(){
    let typeName = this.data.updVal;
    let _id = this.data._id;
    let res =  await api._updateById(global.tables.typeTable,_id,{
      typeName
    })

    // console.log(res)
    if(res.stats.updated == 1){
      this._getTypes()
    }
  }

 
})