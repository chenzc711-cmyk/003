const STORAGE_KEY = 'sfdsData';

function getData() {
  return wx.getStorageSync(STORAGE_KEY) || {
    inventory: [],
    supplierBalances: [],
    inbound: [],
    returns: [],
    outbound: [],
    costs: []
  };
}

function saveData(data) {
  wx.setStorageSync(STORAGE_KEY, data);
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function today() {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function upsert(collection, item) {
  const data = getData();
  const list = data[collection] || [];
  const nextItem = Object.assign({}, item, { id: item.id || makeId(collection) });
  const index = list.findIndex(row => row.id === nextItem.id);
  if (index >= 0) {
    list.splice(index, 1, nextItem);
  } else {
    list.unshift(nextItem);
  }
  data[collection] = list;
  saveData(data);
  return nextItem;
}

function removeMany(collection, ids) {
  const data = getData();
  data[collection] = (data[collection] || []).filter(item => !ids.includes(item.id));
  saveData(data);
}

function filterByDate(list, field, startDate, endDate) {
  return (list || []).filter(item => {
    const value = item[field] || '';
    if (startDate && value < startDate) return false;
    if (endDate && value > endDate) return false;
    return true;
  });
}

function inventoryOptions() {
  const data = getData();
  return (data.inventory || []).map(item => ({
    label: `${item.name || '未命名'}｜${item.spec || '无规格'}｜¥${money(item.price)}`,
    value: item.id,
    item
  }));
}

module.exports = {
  getData,
  saveData,
  makeId,
  today,
  money,
  toNumber,
  upsert,
  removeMany,
  filterByDate,
  inventoryOptions
};
