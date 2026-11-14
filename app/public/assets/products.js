(() => {
  const $ = (id) => document.getElementById(id);
  const api = window.api;
  const els = {
    search: $('search'), filter: $('category-filter'), rows: $('product-rows'), empty: $('empty-state'),
    count: $('result-count'), banner: $('error-banner'), bannerMsg: $('error-message'), toast: $('toast'),
    dialog: $('product-dialog'), form: $('product-form'), title: $('dialog-title'), formError: $('form-error'),
    confirm: $('confirm-dialog'), confirmText: $('confirm-text'),
  };
  let products = [];
  let editingId = null;
  let deletingId = null;
  let searchTimer = null;
  let toastTimer = null;
  let requestSeq = 0;

  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 4000);
  }

  function showError(message) {
    els.bannerMsg.textContent = message;
    els.banner.hidden = false;
  }

  function cell(text, testId) {
    const td = document.createElement('td');
    td.textContent = text;
    if (testId) td.dataset.testid = testId;
    return td;
  }

  function render() {
    els.rows.replaceChildren(...products.map((p) => {
      const tr = document.createElement('tr');
      tr.dataset.testid = 'product-row';
      tr.append(
        cell(p.name, 'product-name'),
        cell(p.category, 'product-category'),
        cell(money.format(p.price), 'product-price'),
        cell(p.stock === 0 ? 'Out of stock' : String(p.stock), 'product-stock'),
      );
      const actions = document.createElement('td');
      actions.className = 'row-actions';
      for (const [label, handler] of [['Edit', openEdit], ['Delete', openDelete]]) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.setAttribute('aria-label', `${label} ${p.name}`);
        btn.addEventListener('click', () => handler(p));
        actions.append(btn);
      }
      tr.append(actions);
      return tr;
    }));
    els.empty.hidden = products.length > 0;
    els.count.textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
  }

  async function load() {
    const seq = ++requestSeq;
    const params = new URLSearchParams({ q: els.search.value, category: els.filter.value });
    try {
      const data = await api(`/api/products?${params}`);
      if (seq !== requestSeq) return; // ignore stale responses
      products = data;
      els.banner.hidden = true;
      render();
    } catch (err) {
      if (seq === requestSeq && err.message !== 'Session expired') showError('Could not load products. Please try again.');
    }
  }

  // ---- form ----
  function setFieldErrors(fields = {}) {
    for (const name of ['name', 'category', 'price', 'stock']) {
      $(`error-${name}`).textContent = fields[name] || '';
      els.form.elements[name].setAttribute('aria-invalid', fields[name] ? 'true' : 'false');
    }
    const first = ['name', 'category', 'price', 'stock'].find((n) => fields[n]);
    if (first) els.form.elements[first].focus();
  }

  function readForm() {
    const f = els.form.elements;
    const priceText = f.price.value.trim();
    const stockText = f.stock.value.trim();
    return {
      name: f.name.value.trim(),
      category: f.category.value,
      price: priceText === '' ? NaN : Number(priceText),
      stock: /^\d+$/.test(stockText) ? Number(stockText) : NaN,
    };
  }

  function validate(p) {
    const fields = {};
    if (p.name.length < 3 || p.name.length > 60) fields.name = 'Name must be 3-60 characters';
    if (!p.category) fields.category = 'Select a valid category';
    if (!Number.isFinite(p.price) || p.price <= 0 || p.price > 100000) fields.price = 'Price must be greater than 0';
    if (!Number.isInteger(p.stock) || p.stock < 0) fields.stock = 'Stock must be a whole number of 0 or more';
    return fields;
  }

  function openForm(product) {
    editingId = product ? product.id : null;
    els.title.textContent = product ? 'Edit product' : 'Add product';
    els.form.reset();
    els.formError.hidden = true;
    setFieldErrors();
    if (product) {
      const f = els.form.elements;
      f.name.value = product.name;
      f.category.value = product.category;
      f.price.value = String(product.price);
      f.stock.value = String(product.stock);
    }
    els.dialog.showModal();
  }
  const openEdit = (p) => openForm(p);

  els.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    els.formError.hidden = true;
    const data = readForm();
    const fields = validate(data);
    setFieldErrors(fields);
    if (Object.keys(fields).length) return;

    const save = $('save-product');
    save.disabled = true;
    try {
      if (editingId) await api(`/api/products/${editingId}`, { method: 'PUT', body: JSON.stringify(data) });
      else await api('/api/products', { method: 'POST', body: JSON.stringify(data) });
      els.dialog.close();
      showToast(editingId ? 'Product updated' : 'Product created');
      await load();
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      else if (err.message !== 'Session expired') {
        els.formError.textContent = 'Could not save product. Check your connection and try again.';
        els.formError.hidden = false;
      }
    } finally {
      save.disabled = false;
    }
  });
  $('cancel-product').addEventListener('click', () => els.dialog.close());

  // ---- delete ----
  function openDelete(product) {
    deletingId = product.id;
    els.confirmText.textContent = `Delete "${product.name}"? This cannot be undone.`;
    els.confirm.showModal();
  }
  $('confirm-cancel').addEventListener('click', () => els.confirm.close());
  $('confirm-delete').addEventListener('click', async () => {
    els.confirm.close();
    try {
      await api(`/api/products/${deletingId}`, { method: 'DELETE' });
      showToast('Product deleted');
      await load();
    } catch (err) {
      if (err.message !== 'Session expired') showError('Could not delete product. Please try again.');
    }
  });

  // ---- toolbar ----
  els.search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(load, 250); });
  els.filter.addEventListener('change', load);
  $('add-product').addEventListener('click', () => openForm(null));
  $('retry').addEventListener('click', load);

  api('/api/categories').then((categories) => {
    for (const select of [els.filter, els.form.elements.category]) {
      for (const c of categories) select.append(new Option(c, c));
    }
  }).catch(() => {});
  load();
})();
