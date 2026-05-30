Page({
  data: {
    code: ''
  },

  onLoad() {
    if (wx.getStorageSync('sfdsAuthed')) {
      wx.switchTab({ url: '/pages/dashboard/dashboard' });
    }
  },

  onCodeInput(event) {
    this.setData({ code: event.detail.value.trim() });
  },

  enterSystem() {
    const app = getApp();
    if (this.data.code === app.globalData.companyCode) {
      wx.setStorageSync('sfdsAuthed', true);
      wx.switchTab({ url: '/pages/dashboard/dashboard' });
      return;
    }
    wx.showToast({ title: '公司代码不正确', icon: 'none' });
  }
});
