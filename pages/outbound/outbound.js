const store = require('../../utils/store');
function emptyForm() { return { id: '', date: store.today(), inventoryId: '', name: '', spec: '', qty: '', price: '', total: '', remark: '' }; }
function emptyCostForm() { return { id: '', date: store.today(), amount: '', purpose: '', category: '', remark: '' }; }
Page({
  data: { form: emptyForm(), costForm: emptyCostForm(), costCategories: [], inventoryOptions: [], inventoryLabels: [], selectedLabel: '', records: [], costs: [], selected: {}, selectedCosts: {}, allSelected: false, allCostsSelected: false, startDate: '', endDate: '' },
  onLoad() { this.setData({ costCategories: getApp().globalData.costCategories }); },
  onShow() { this.loadOptions(); this.refresh(); },
  loadOptions() { const options = store.inventoryOptions(); this.setData({ inventoryOptions: options, inventoryLabels: options.map(item => item.label) }); },
  refresh() { const data = store.getData(); this.setData({ records: store.filterByDate(data.outbound || [], 'date', this.data.startDate, this.data.endDate), costs: store.filterByDate(data.costs || [], 'date', this.data.startDate, this.data.endDate) }); },
  onInput(e) { this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onDatePick(e) { this.setData({ 'form.date': e.detail.value }); },
  onInventoryPick(e) { const option = this.data.inventoryOptions[e.detail.value]; if (!option) return; this.setData({ selectedLabel: option.label, 'form.inventoryId': option.item.id, 'form.name': option.item.name, 'form.spec': option.item.spec, 'form.price': option.item.price }); },
  saveRecord() { const form = this.data.form; if (!form.date || !form.name || !form.spec) { wx.showToast({ title: '请完善出库信息', icon: 'none' }); return; } const qty = store.toNumber(form.qty); const price = store.toNumber(form.price); const total = form.total ? store.toNumber(form.total) : price * qty; store.upsert('outbound', Object.assign({}, form, { qty, price: store.money(price), total: store.money(total) })); if (form.inventoryId) this.reduceStock(form.inventoryId, qty); this.resetForm(); this.loadOptions(); this.refresh(); },
  reduceStock(id, qty) { const data = store.getData(); const item = (data.inventory || []).find(row => row.id === id); if (item) { item.stock = Math.max(0, store.toNumber(item.stock) - qty); store.saveData(data); } },
  resetForm() { this.setData({ form: emptyForm(), selectedLabel: '' }); },
  editRecord(e) { const item = (store.getData().outbound || []).find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ form: Object.assign({}, item), selectedLabel: '' }); },
  onStartPick(e) { this.setData({ startDate: e.detail.value }); this.refresh(); },
  onEndPick(e) { this.setData({ endDate: e.detail.value }); this.refresh(); },
  toggleOne(e) { const id = e.currentTarget.dataset.id; this.setData({ [`selected.${id}`]: !this.data.selected[id] }); },
  toggleAll() { const next = !this.data.allSelected; const selected = {}; if (next) this.data.records.forEach(item => { selected[item.id] = true; }); this.setData({ selected, allSelected: next }); },
  deleteSelected() { const ids = Object.keys(this.data.selected).filter(id => this.data.selected[id]); store.removeMany('outbound', ids); this.setData({ selected: {}, allSelected: false }); this.refresh(); },
  onCostInput(e) { this.setData({ [`costForm.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onCostDatePick(e) { this.setData({ 'costForm.date': e.detail.value }); },
  onCostCategoryPick(e) { this.setData({ 'costForm.category': this.data.costCategories[e.detail.value] }); },
  saveCost() { const form = this.data.costForm; if (!form.date || !form.amount || !form.category) { wx.showToast({ title: '请完善成本信息', icon: 'none' }); return; } store.upsert('costs', Object.assign({}, form, { amount: store.money(form.amount) })); this.resetCostForm(); this.refresh(); },
  resetCostForm() { this.setData({ costForm: emptyCostForm() }); },
  editCost(e) { const item = (store.getData().costs || []).find(row => row.id === e.currentTarget.dataset.id); if (item) this.setData({ costForm: Object.assign({}, item) }); },
  toggleCost(e) { const id = e.currentTarget.dataset.id; this.setData({ [`selectedCosts.${id}`]: !this.data.selectedCosts[id] }); },
  toggleAllCosts() { const next = !this.data.allCostsSelected; const selected = {}; if (next) this.data.costs.forEach(item => { selected[item.id] = true; }); this.setData({ selectedCosts: selected, allCostsSelected: next }); },
  deleteCostSelected() { const ids = Object.keys(this.data.selectedCosts).filter(id => this.data.selectedCosts[id]); store.removeMany('costs', ids); this.setData({ selectedCosts: {}, allCostsSelected: false }); this.refresh(); }
});
