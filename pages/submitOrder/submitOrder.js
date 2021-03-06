/**
 * Created by Liujx on 2017-10-20 16:50:51
 */
const orderDetailUrl = require('../../config').orderDetailUrl;
const commitUrl = require('../../config').commitUrl;
const util = require('../../utils/util');
Page({
    data: {
        id: '',
        orderDetailList: [],
    },
    // 生命周期函数--监听页面显示
    onLoad: function(option) {
        this.setData({
            id: option.id
        })
        this.isCartInto(option.isCart)
        this.orderDetailRequest()
    },
    onShow: function() {
        
    },
    orderDetailRequest: function() {
        let self = this;
        wx.request({
            url: orderDetailUrl,
            method: 'POST',
            data: {
                id: self.data.id
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            success: data => {
                if (data.data.success) {
                    self.setData({
                        orderDetailList: [data.data.data]
                    })
                } else {
                    util.showMessage(self, data.data.msg)
                }
            }
        })
    },
    // 是否从购物车进入
    isCartInto: function(val) {
        if(val) {
            wx.setStorageSync('isCartInto', true)
        }
    },
    // 电子发票
    selectInvoice: function(e) {
        let self = this;
        let isInvoice = !e.currentTarget.dataset.isinvoice;
        self.data.orderDetailList[0].invoice = isInvoice;
        self.setData({
            orderDetailList: self.data.orderDetailList
        })
    },
    // 提交订单
    submitOrderFun: function() {
        let self = this;
        let data = self.data.orderDetailList[0];
        let id = data.id;
        let totalMoney = data.totalMoney;
        let invoice = data.invoice;
        let consigneeId = data.consignee ? data.consignee.id : '';
        if(!data.give && !data.consignee) {
            util.showMessage(self, '请选择收货地址！')
            return false
        }
        wx.request({
            url: commitUrl,
            method: 'POST',
            header: {
                'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId')
            },
            data: {
                id: id,
                totalMoney: totalMoney,
                invoice: invoice,
                express: {
                    consigneeId: consigneeId
                }
            },
            success: data => {
                if (data.data.success) {
                    wx.navigateTo({
                        url: 'payment/payment?id=' + id + '&money=' + totalMoney
                    })
                } else {
                    util.showMessage(self, data.data.msg)
                }
            }
        });
    },
    // 跳转图书
    tapBookFun: function(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '../bookDetails/bookDetails?id=' + id
        })
    },
    // 添加收货地址
    addAddressFun: function() {
        wx.navigateTo({
            url: '../user/addAddress/addAddress?order=true'
        })
    },
    // 选择地址
    selectAddress: function() {
        wx.navigateTo({
            url: '../user/myAddress/myAddress?order=true'
        })
    }
})