const store = require('../../utils/store');

function sameMonth(date) {
  const now = new Date();
  const month = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
  return (date || '').startsWith(month);
}

Page({
  data: {
    metrics: [],
    warnings: []
  },

  onShow() {
    const data = store.getData();
    const today = store.today();
    const inventory = data.inventory || [];
    const inbound = data.inbound || [];
    const outbound = data.outbound || [];
    const costs = data.costs || [];
    const balances = data.supplierBalances || [];

    const stockQty = inventory.reduce((sum, item) => sum + store.toNumber(item.stock), 0);
    const stockAmount = inventory.reduce((sum, item) => sum + store.toNumber(item.stock) * store.toNumber(item.price), 0);
    const warningItems = inventory.filter(item => store.toNumber(item.stock) <= store.toNumber(item.warningQty));
    const supplierBalance = balances.reduce((sum, item) => sum + store.toNumber(item.balance), 0);

    const todayOutbound = outbound.filter(item => item.date === today);
    const todayInbound = inbound.filter(item => item.date === today);
    const monthOutbound = outbound.filter(item => sameMonth(item.date));
    const monthInbound = inbound.filter(item => sameMonth(item.date));
    const deliveryCost = costs.filter(item => item.category === '代发成本').reduce((sum, item) => sum + store.toNumber(item.amount), 0);

    const sumQty = list => list.reduce((sum, item) => sum + store.toNumber(item.qty), 0);
    const sumAmount = list => list.reduce((sum, item) => sum + store.toNumber(item.total || store.toNumber(item.price) * store.toNumber(item.qty)), 0);

    this.setData({
      metrics: [
        { label: '代发总成本', value: `¥${store.money(deliveryCost)}` },
        { label: '库存数量', value: `${stockQty} 件` },
        { label: '库存总金额', value: `¥${store.money(stockAmount)}` },
        { label: '库存预警', value: `${warningItems.length} 项` },
        { label: '供应商货款余额', value: `¥${store.money(supplierBalance)}` },
        { label: '今日出库数量', value: `${sumQty(todayOutbound)} 件` },
        { label: '今日出库金额', value: `¥${store.money(sumAmount(todayOutbound))}` },
        { label: '今日入库数量', value: `${sumQty(todayInbound)} 件` },
        { label: '今日入库金额', value: `¥${store.money(sumAmount(todayInbound))}` },
        { label: '本月累计入库', value: `${sumQty(monthInbound)} 件 / ¥${store.money(sumAmount(monthInbound))}` },
        { label: '本月累计出库', value: `${sumQty(monthOutbound)} 件 / ¥${store.money(sumAmount(monthOutbound))}` },
        { label: '本月出入库差额', value: `¥${store.money(sumAmount(monthInbound) - sumAmount(monthOutbound))}` }
      ],
      warnings: warningItems
    });
  }
});
