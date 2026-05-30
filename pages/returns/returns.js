const store = require('../../utils/store');
function emptyForm() { return { id: '', date: store.today(), orderNo: '', expressCompany: '', expressNo: '', inventoryId: '', name: '', spec: '', qty: '', state: '', remark: '' }; }
Page({
  data: { form: emptyForm(), cargoStates: [], inventoryOptions: [], inventoryLabels: [], selectedLabel: '', records: [], selected: {}, allSelected: false, startDate: '', endDate: '' },
  onLoad() { this.setData({ cargoStates: getApp().globalData.cargoStates }); },
  onShow() { this.loadOptions(); this.refresh(); },
  loadOptions() { const options = store.inventoryOptions(); this.setData({ inventoryOptions: options, inventoryLabels: options.map(item => item.label) }); },
  refresh() { const data = store.getData(); this.setData({ records: store.filterByDate(data.returns || [], 'date', this.data.startDate, this.data.endDate) }); },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onDatePick(e) { this.setData({ 'form.date': e.detail.value }); },
  onStatePick(e) { this.setData({ 'form.state': this.data.cargoStates[e.detail.value] }); },
  onInventoryPick(e) { const option = this.data.inventoryOptions[e.detail.value]; if (!option) return; this.setData({ selectedLabel: option.label, 'form.inventoryId': option.item.id, 'form.name': option.item.name, 'form.spec': option.item.spec }); },
  saveRecord() { const form = this.data.form; if (!form.date || !form.orderNo || !form.name) { wx.showToast({ title: '请完善退货信息', icon: 'none' }); return; } const qty = store.toNumber(form.qty); store.upsert('returns', Object.assign({}, form, { qty })); if (form.inventoryId) this.addStock(form.inventoryId, qty); this.resetForm(); this.loadOptions(); this.refresh(); },
  addStock(id, qty) { const data = store.getData(); const item = (data.inventory || []).find(row => row.id === id); if (item) { item.stock = store.toNumber(item.stock) + qty; store.saveData(data); } },
  resetForm() { this.setData({ form: emptyForm(), selectedLabel: '' }); },
  editRecord(e) { const item = (store.getData().returns || []).find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ form: Object.assign({}, item), selectedLabel: '' }); },
  onStartPick(e) { this.setData({ startDate: e.detail.value }); this.refresh(); },
  onEndPick(e) { this.setData({ endDate: e.detail.value }); this.refresh(); },
  toggleOne(e) { const id = e.currentTarget.dataset.id; this.setData({ [`selected.${id}`]: !this.data.selected[id] }); },
  toggleAll() { const next = !this.data.allSelected; const selected = {}; if (next) this.data.records.forEach(item => { selected[item.id] = true; }); this.setData({ selected, allSelected: next }); },
  deleteSelected() { const ids = Object.keys(this.data.selected).filter(id => this.data.selected[id]); store.removeMany('returns', ids); this.setData({ selected: {}, allSelected: false }); this.refresh(); }
});
