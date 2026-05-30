const store = require('../../utils/store');

function emptyForm() {
  return { id: '', date: store.today(), inventoryId: '', name: '', spec: '', price: '', qty: '', supplier: '', remark: '', total: '' };
}

Page({
  data: { form: emptyForm(), inventoryOptions: [], inventoryLabels: [], selectedLabel: '', records: [], selected: {}, allSelected: false, startDate: '', endDate: '' },
  onShow() { this.loadOptions(); this.refresh(); },
  loadOptions() { const options = store.inventoryOptions(); this.setData({ inventoryOptions: options, inventoryLabels: options.map(item => item.label) }); },
  refresh() { const data = store.getData(); this.setData({ records: store.filterByDate(data.inbound || [], 'date', this.data.startDate, this.data.endDate) }); },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onDatePick(e) { this.setData({ 'form.date': e.detail.value }); },
  onInventoryPick(e) { const option = this.data.inventoryOptions[e.detail.value]; if (!option) return; const item = option.item; this.setData({ selectedLabel: option.label, 'form.inventoryId': item.id, 'form.name': item.name, 'form.spec': item.spec, 'form.price': item.price, 'form.supplier': item.supplier }); },
  saveRecord() { const form = this.data.form; if (!form.date || !form.name || !form.spec) { wx.showToast({ title: '请完善入库信息', icon: 'none' }); return; } const qty = store.toNumber(form.qty); const price = store.toNumber(form.price); store.upsert('inbound', Object.assign({}, form, { price: store.money(price), qty, total: store.money(price * qty) })); if (form.inventoryId) this.addStock(form.inventoryId, qty); this.resetForm(); this.loadOptions(); this.refresh(); },
  addStock(id, qty) { const data = store.getData(); const item = (data.inventory || []).find(row => row.id === id); if (item) { item.stock = store.toNumber(item.stock) + qty; store.saveData(data); } },
  resetForm() { this.setData({ form: emptyForm(), selectedLabel: '' }); },
  editRecord(e) { const item = (store.getData().inbound || []).find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ form: Object.assign({}, item), selectedLabel: '' }); },
  onStartPick(e) { this.setData({ startDate: e.detail.value }); this.refresh(); },
  onEndPick(e) { this.setData({ endDate: e.detail.value }); this.refresh(); },
  toggleOne(e) { const id = e.currentTarget.dataset.id; this.setData({ [`selected.${id}`]: !this.data.selected[id] }); },
  toggleAll() { const next = !this.data.allSelected; const selected = {}; if (next) this.data.records.forEach(item => { selected[item.id] = true; }); this.setData({ selected, allSelected: next }); },
  deleteSelected() { const ids = Object.keys(this.data.selected).filter(id => this.data.selected[id]); store.removeMany('inbound', ids); this.setData({ selected: {}, allSelected: false }); this.refresh(); }
});
