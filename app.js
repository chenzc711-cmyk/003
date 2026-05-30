App({
  globalData: {
    companyCode: 'sfds',
    supplierOptions: ['普通渠道商', '3W品牌渠道商', '台州伊文渠道商'],
    costCategories: ['代发成本', '采购成本', '人工成本', '其他成本'],
    cargoStates: ['完好可二次销售', '轻微破损', '待检测', '不可售']
  },

  onLaunch() {
    const data = wx.getStorageSync('sfdsData');
    if (!data) {
      wx.setStorageSync('sfdsData', {
        inventory: [],
        supplierBalances: [],
        inbound: [],
        returns: [],
        outbound: [],
        costs: []
      });
    }
  }
});
