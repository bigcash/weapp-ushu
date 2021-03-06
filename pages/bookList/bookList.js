/**
 * Created by Liujx on 2017-10-22 22:38:21
 */
const detailUrl = require('../../config').detailUrl;
const addCartUrl = require('../../config').addCartUrl;
const readBookListUrl = require('../../config').readBookListUrl;
const commentListUrl = require('../../config').commentListUrl;
const commentGridUrl = require('../../config').commentGridUrl;
const cartTotalUrl = require('../../config').cartTotalUrl;
const addAttentionUrl = require('../../config').addAttentionUrl;
const cancelAttentionUrl = require('../../config').cancelAttentionUrl;
const collectUrl = require('../../config').collectUrl;
const cancelCollectUrl = require('../../config').cancelCollectUrl;
const shareSaveUrl = require('../../config').shareSaveUrl;
const util = require('../../utils/util');
const app = getApp();
Page({
    data: {
        loadmore: true,
        detailList: [],
        commentList: [],
        commentTotal: 0,
        readCount: 0,
        cartTotal: 0,
        isComment: true,
        isIndex: false,
        fromId: '',
        uuid: '',
    },
    // 首屏渲染
    onLoad: function(options) {
        let Suuid = util.uuid();
        let id = options.id || options.scene;
        this.detailRequest(id);
        this.commentRequest(id);
        this.cartTotalRequest();
        this.readBookListRequest(id);
        let fromId = options.uuid || '';
        let isIndex = options.isIndex || '';
        this.setData({
            fromId: fromId,
            isIndex: isIndex,
            uuid: Suuid
        })
    },
    // 请求详情
    detailRequest: function(val) {
        let self = this;
        wx.request({
            url: detailUrl,
            method: 'POST',
            data: {
                id: val
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if(data.data.success) {
                    wx.setNavigationBarTitle({
                        title: data.data.data.title
                    })
                    if(data.data.data.tags) {
                        data.data.data.tags = data.data.data.tags.split(',')
                    }
                    
                    self.setData({
                        loadmore: false,
                        detailList: [data.data.data],
                        readCount: data.data.data.readCount,
                        title: data.data.data.title,
                        imageUrl: data.data.data.thumbnail ? data.data.data.thumbnail.url : ''
                    })
                } else {
                    util.showMessage(self, data.data.msg)
                }
            }
        })
    },
    // 添加购物车
    addCartFun: function(e) {
        let self = this;
        let bookId = e.currentTarget.dataset.bookid;
        let bookListId = e.currentTarget.dataset.booklistid;
        wx.request({
            url: addCartUrl,
            method: 'POST',
            data: {
                bookId: bookId,
                bookListItemId: bookListId,
                fromShareId: self.data.fromId
            },
            header: {
                'X-Requested-With': 'XMLHttpRequest',
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if(data.data.success) {
                    self.data.cartTotal++
                    self.setData({
                        cartTotal: self.data.cartTotal
                    })
                    util.showMessage(self, data.data.msg)
                } else {
                    if(data.data.data == 401) {
                        app.loginFun()
                        return false;
                    }
                    util.showMessage(self, data.data.msg)
                }
            }
        })
    },
    // 浏览记录
    readBookListRequest: function(val) {
        let self = this;
        wx.request({
            url: readBookListUrl,
            method: 'POST',
            data: {
                id: val
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if(data.data.success) {
                    self.data.readCount++
                    self.setData({
                        readCount: self.data.readCount
                    })
                }
            }
        })
    },
    // 分享
    onShareAppMessage: function(res) {
        let self = this;
        let uuid = util.uuid();
        let title = self.data.title;
        let path = '/pages/bookList/bookList?id=' + self.data.detailList[0].id + '&uuid=' + uuid
        let imageUrl = self.data.imageUrl;
        let bookListId = self.data.detailList[0].id;
        return {
            title: title,
            path: path,
            imageUrl: imageUrl,
            success: function(res) {
                // 转发成功
                wx.request({
                    url: shareSaveUrl,
                    method: 'POST',
                    data: {
                        id: uuid,
                        bookListId: bookListId,
                        fromId: self.data.fromId
                    },
                    header: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'content-type': 'application/x-www-form-urlencoded',
                        'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
                    },
                    success: data => {
                        if(data.data.success) {
                        } else {
                            if(data.data.data == 401) {
                                app.loginFun()
                                return false;
                            }
                            util.showMessage(self, data.data.msg)
                        }
                    }
                })
            },
            fail: function(res) {
                // 转发失败
            }
        }
    },
    // 关注
    attentionFun: function(e) {
        let self = this;
        let creatorId = e.currentTarget.dataset.creatorid;
        if(e.currentTarget.dataset.followed) {
            self.attentionRequest(cancelAttentionUrl, creatorId, '取消关注成功！', false)
        } else {
            self.attentionRequest(addAttentionUrl, creatorId, '关注成功！', true)
        }
    },
    // 关注&&取消关注接口
    attentionRequest: function(url, creatorId, msg, isFollowed) {
        let self = this;
        wx.request({
            url: url,
            data: {
                targetId: creatorId
            },
            header: {
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if (data.data.success) {
                    util.showMessage(self, msg);
                    self.data.detailList[0].followed = isFollowed;
                    self.setData({
                        detailList: self.data.detailList
                    })
                } else {
                    if(data.data.data == 401) {
                        app.loginFun()
                        return false;
                    }
                    util.showMessage(self, data.data.msg);
                }
            }
        })
    },
    // 收藏
    collectFun: function(e) {
        let self = this;
        let id = e.currentTarget.dataset.id;
        let isCollect = e.currentTarget.dataset.iscollect;
        if(isCollect) {
            self.collectRequest(cancelCollectUrl, id, '取消收藏成功！')
        } else {
            self.collectRequest(collectUrl, id, '收藏成功！')
        }
    },
    // 收藏&&取消收藏
    collectRequest: function(url, id, msg) {
        let self = this;
        wx.request({
            url: url,
            data: {
                bookListId: id
            },
            header: {
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if (data.data.success) {
                    self.detailRequest(id);
                    util.showMessage(self, msg);
                } else {
                    if(data.data.data == 401) {
                        app.loginFun()
                        return false;
                    }
                    util.showMessage(self, data.data.msg);
                }
            }
        })
    },
    // 评论分页接口
    commentRequest: function(val) {
        let self = this;
        wx.request({
            url: commentGridUrl,
            data: {
                bookListId: val,
                page: 1,
                rows: 2
            },
            header: {
                'X-Requested-With': 'XMLHttpRequest',
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                self.setData({
                    commentList: data.data.rows,
                    commentTotal: data.data.total
                })
                if(data.data.rows.length == 0) {
                    self.setData({
                        isComment: false
                    })
                }
            }
        })
    },
    // 查看全部评论
    commentTotalFun: function(e) {
        let self = this;
        let bookListId = e.currentTarget.dataset.id;
        wx.request({
            url: commentListUrl,
            method: 'POST',
            data: {
                bookListId: bookListId
            },
            header: {
                'X-Requested-With': 'XMLHttpRequest',
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if(data.data.success) {
                    self.setData({
                        commentList: data.data,
                        isComment: false
                    })
                } else {
                    if(data.data.data == 401) {
                        app.loginFun()
                        return false;
                    }
                }
                
            }
        })
    },
    // 获取购物车总数量
    cartTotalRequest: function() {
        let self = this;
        wx.request({
            url: cartTotalUrl,
            method: 'POST',
            data: {},
            header: {
                'X-Requested-With': 'XMLHttpRequest',
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if(data.data.success) {
                    self.setData({
                        cartTotal: data.data.data || 0
                    })
                }
            }
        })
    },
    // 进入图书详情
    tapBookDetails: function(e) {
        let self = this
        let bookId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '../bookDetails/bookDetails?id=' + bookId + '&fromId=' + self.data.fromId
        })
    },
    // 跳转购物车
    navigateToCart: function() {
        wx.switchTab({
            url: '../cart/cart'
        })
    }
})