const {
  default: api
} = require("../../utils/api");
const {
  default: global
} = require("../../utils/global");

let _ = api.db.command;

// pages/recipeDetail/recipeDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {}, // 菜谱内容
    isFollows: false, //是否关注  false  未关注  true  关注
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.data.id = options.id;
    this._getRecipeDetail();
  },

  // 获取菜谱详情信息
  async _getRecipeDetail() {

    let id = this.data.id; // 菜谱id
    let res = await api._findById(global.tables.recipeTable, id);
    // item._openid  用户的openid
    let user = await api._findAll(global.tables.userTable, {
      _openid: res.data._openid
    })
    res.data.userInfo = user.data[0].userInfo;
    // 数据库views +1 
    api._updateById(global.tables.recipeTable, id, {
      // views: res.data.views +1
      views: _.inc(1) //自增  可正可负
    })
    res.data.views++; //将获取到的views 先进行加+

    // 判断当前是否登录
    let openid = wx.getStorageSync('openid') || null;
    if (openid == null) {
      // 判断是否登录，没登录，不管是否关注当前菜谱，都不显示关注效果
      this.setData({
        isFollows: false
      })
    } else {
      // 判断是否关注  m-follows  openid   id
      let result = await api._findAll(global.tables.followTable, {
        _openid: openid,
        recipeID: id
      })

      // console.log(result,"查询是否关注")
      if (result == null ||  result.data.length <=0) {
        this.setData({
          isFollows: false
        })
      } else {
        this.setData({
          isFollows: true
        })
      }
    }

    this.setData({
      info: res.data
    })

  },
  // 执行关注/未关注·
  async _doFollow() {
    let openid = wx.getStorageSync('openid') || null;
    let _this = this;
    if (openid == null) {
      wx.showToast({
        title: '请先去登录',
        icon: "none"
      })
      return;
    };
    // 关注表：  ——id   ——openid   recipeID
    if (this.data.isFollows) {
      //取消关注

      wx.showModal({
        title: "提示",
        content: "您确定取消关注么?",
        async success(res) {
          if (res.confirm) {
            //  执行取消关注
            // 1.关注表 删除
            let where = {
              _openid: openid,
              recipeID: _this.data.id
            }

            let results = await api._delByWhere(global.tables.followTable, where);

            if (results.stats.removed == 1) {
              // 2.把已关注变成关注
              // 3.收藏人数 -1
              _this.data.info.follows--;
              _this.setData({
                isFollows: false,
                info: _this.data.info
              })
              // 4.菜谱表中的follows字段-1
              // 更新recipe菜谱的follow字段
              api._updateById(global.tables.recipeTable, _this.data.id, {
                // views: res.data.views +1
                follows: _.inc(-1) //自增  可正可负
              })
            }

          }
        }
      })

    } else {
      // 执行关注
      let res = await api._add(global.tables.followTable, {
        recipeID: this.data.id
      })

      if (res._id) {
        // 关注成功了
        this.data.info.follows++; //重新渲染页面
        this.setData({
          isFollows: true,
          info: this.data.info
        })
        wx.showToast({
          title: '关注成功',
        })
        // 更新recipe菜谱的follow字段
        api._updateById(global.tables.recipeTable, this.data.id, {
          // views: res.data.views +1
          follows: _.inc(1) //自增  可正可负
        })

      }
    }
  }

})