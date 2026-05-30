const store = require('../../utils/store');

function emptyForm() {
  return { id: '', name: '', spec: '', price: '', stock: '', supplier: '', remark: '', warningQty: '' };
}

function emptyBalanceForm() {
  return { id: '', supplier: '', balance: '', remark: '' };
}

Page({
  data: {
    supplierOptions: [],
    form: emptyForm(),
    balanceForm: emptyBalanceForm(),
    inventory: [],
    balances: [],
    selectedInventory: {},
    selectedBalances: {},
    allInventorySelected: false,
    allBalancesSelected: false
  },

  onLoad() {
    this.setData({ supplierOptions: getApp().globalData.supplierOptions });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const data = store.getData();
    this.setData({ inventory: data.inventory || [], balances: data.supplierBalances || [] });
  },

  onInput(event) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  onSupplierPick(event) {
    this.setData({ 'form.supplier': this.data.supplierOptions[event.detail.value] });
  },

  saveInventory() {
    const form = this.data.form;
    if (!form.name || !form.spec || !form.supplier) {
      wx.showToast({ title: '请完善名称、规格和供应商', icon: 'none' });
      return;
    }
    store.upsert('inventory', {
      id: form.id,
      name: form.name,
      spec: form.spec,
      price: store.money(form.price),
      stock: store.toNumber(form.stock),
      supplier: form.supplier,
      remark: form.remark,
      warningQty: store.toNumber(form.warningQty)
    });
    this.resetForm();
    this.refresh();
  },

  resetForm() {
    this.setData({ form: emptyForm() });
  },

  editInventory(event) {
    const item = this.data.inventory.find(row => row.id === event.currentTarget.dataset.id);
    if (item) this.setData({ form: Object.assign({}, item) });
  },

  toggleInventory(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`selectedInventory.${id}`]: !this.data.selectedInventory[id] });
  },

  toggleAllInventory() {
    const next = !this.data.allInventorySelected;
    const selected = {};
    if (next) this.data.inventory.forEach(item => { selected[item.id] = true; });
    this.setData({ selectedInventory: selected, allInventorySelected: next });
  },

  deleteInventorySelected() {
    const ids = Object.keys(this.data.selectedInventory).filter(id => this.data.selectedInventory[id]);
    store.removeMany('inventory', ids);
    this.setData({ selectedInventory: {}, allInventorySelected: false });
    this.refresh();
  },

  onBalanceInput(event) {
    this.setData({ [`balanceForm.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  onBalanceSupplierPick(event) {
    this.setData({ 'balanceForm.supplier': this.data.supplierOptions[event.detail.value] });
  },

  saveBalance() {
    const form = this.data.balanceForm;
    if (!form.supplier) {
      wx.showToast({ title: '请选择供应商', icon: 'none' });
      return;
    }
    store.upsert('supplierBalances', {
      id: form.id,
      supplier: form.supplier,
      balance: store.money(form.balance),
      remark: form.remark
    });
    this.resetBalanceForm();
    this.refresh();
  },

  resetBalanceForm() {
    this.setData({ balanceForm: emptyBalanceForm() });
  },

  editBalance(event) {
    const item = this.data.balances.find(row => row.id === event.currentTarget.dataset.id);
    if (item) this.setData({ balanceForm: Object.assign({}, item) });
  },

  toggleBalance(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`selectedBalances.${id}`]: !this.data.selectedBalances[id] });
  },

  toggleAllBalances() {
    const next = !this.data.allBalancesSelected;
    const selected = {};
    if (next) this.data.balances.forEach(item => { selected[item.id] = true; });
    this.setData({ selectedBalances: selected, allBalancesSelected: next });
  },

  deleteBalanceSelected() {
    const ids = Object.keys(this.data.selectedBalances).filter(id => this.data.selectedBalances[id]);
    store.removeMany('supplierBalances', ids);
    this.setData({ selectedBalances: {}, allBalancesSelected: false });
    this.refresh();
  }
});
