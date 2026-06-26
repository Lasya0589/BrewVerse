const products = [
  { id: 1, name: "Espresso", category: "Classic", price: 110, desc: "Strong concentrated coffee shot.", image: "./assets/coffee/espresso.jpg" },
  { id: 2, name: "Americano", category: "Classic", price: 130, desc: "Espresso diluted with hot water.", image: "./assets/coffee/americano.jpg" },
  { id: 3, name: "Cappuccino", category: "Milk", price: 170, desc: "Espresso with steamed milk foam.", image: "./assets/coffee/cappuccino.jpg" },
  { id: 4, name: "Latte", category: "Milk", price: 180, desc: "Creamy milk-forward espresso drink.", image: "./assets/coffee/latte.jpg" },
  { id: 5, name: "Flat White", category: "Milk", price: 190, desc: "Velvety microfoam and bold espresso.", image: "./assets/coffee/flat-white.jpg" },
  { id: 6, name: "Mocha", category: "Signature", price: 210, desc: "Chocolate-flavored coffee delight.", image: "./assets/coffee/mocha.jpg" },
  { id: 7, name: "Macchiato", category: "Signature", price: 220, desc: "Espresso marked with milk foam.", image: "./assets/coffee/macchiato.jpg" },
  { id: 8, name: "Cold Brew", category: "Cold", price: 160, desc: "Slow-steeped coffee served chilled.", image: "./assets/coffee/cold-brew.jpg" },
  { id: 9, name: "Iced Coffee", category: "Cold", price: 170, desc: "Cold coffee with ice and milk.", image: "./assets/coffee/iced-coffee.jpg" },
  { id: 10, name: "Turkish", category: "Traditional", price: 200, desc: "Rich unfiltered traditional brew.", image: "./assets/coffee/turkish.jpg" },
  { id: 11, name: "Irish", category: "Special", price: 240, desc: "Coffee inspired by Irish style.", image: "./assets/coffee/irish.jpg" },
  { id: 12, name: "Hot Milk", category: "Milk", price: 80, desc: "Steamed fresh milk served hot and comforting.", image: "./assets/coffee/hot-milk.jpg" },
];

const TAX_RATE = 0.08;
const STORAGE_KEY = "brewverse_cart_v2";
const SIZE_OPTIONS = [
  { code: "S", label: "Small", multiplier: 1 },
  { code: "M", label: "Medium", multiplier: 1.2 },
  { code: "L", label: "Large", multiplier: 1.4 },
];

const state = {
  category: "All",
  search: "",
  cart: loadCart(),
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const chipsEl = document.querySelector("#category-chips");
const searchEl = document.querySelector("#search-input");
const productsEl = document.querySelector("#products-grid");
const featuredEl = document.querySelector("#featured-grid");
const cartItemsEl = document.querySelector("#cart-items");
const cartPageItemsEl = document.querySelector("#cart-page-items");
const overlayEl = document.querySelector("#overlay");
const cartDrawerEl = document.querySelector("#cart-drawer");
const openCartBtn = document.querySelector("#open-cart-btn");
const closeCartBtn = document.querySelector("#close-cart-btn");
const clearCartBtn = document.querySelector("#clear-cart-btn");
const checkoutBtn = document.querySelector("#checkout-btn");
const cartPageClearBtn = document.querySelector("#cart-page-clear");
const cartPageCheckoutBtn = document.querySelector("#cart-page-checkout");
const toastEl = document.querySelector("#toast");
const orderModal = document.querySelector("#order-modal");
const orderSummaryList = document.querySelector("#order-summary-list");
const orderSummaryTotal = document.querySelector("#order-summary-total");
const closeOrderModalBtn = document.querySelector("#close-order-modal");
const contactSendBtn = document.querySelector("#contact-send-btn");

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        Number.isInteger(item.id) &&
        Number.isInteger(item.qty) &&
        item.qty > 0 &&
        ["S", "M", "L"].includes(item.size)
    );
  } catch (_error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
}

function sizeMultiplier(sizeCode) {
  return SIZE_OPTIONS.find((s) => s.code === sizeCode)?.multiplier || 1;
}

function sizeLabel(sizeCode) {
  return SIZE_OPTIONS.find((s) => s.code === sizeCode)?.label || sizeCode;
}

function unitPrice(productId, sizeCode) {
  const product = products.find((p) => p.id === productId);
  if (!product) return 0;
  return product.price * sizeMultiplier(sizeCode);
}

function getCategories() {
  return ["All", ...new Set(products.map((p) => p.category))];
}

function renderChips() {
  if (!chipsEl) return;
  chipsEl.innerHTML = getCategories()
    .map(
      (category) =>
        `<button class="chip ${state.category === category ? "active" : ""}" data-category="${category}">${category}</button>`
    )
    .join("");
}

function getFilteredProducts(list = products) {
  const query = state.search.trim().toLowerCase();
  return list.filter((product) => {
    const categoryOk = state.category === "All" || product.category === state.category;
    const queryOk = !query || `${product.name} ${product.desc} ${product.category}`.toLowerCase().includes(query);
    return categoryOk && queryOk;
  });
}

function productCardMarkup(product) {
  const zoomOutNames = new Set(["Hot Milk"]);
  const imageClass = zoomOutNames.has(product.name) ? "zoom-out-image" : "";
  return `
    <article class="product-card" data-product-id="${product.id}">
      <img class="${imageClass}" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='./assets/fallback.png'">
      <div class="product-content">
        <div class="product-head">
          <h3>${product.name}</h3>
          <span class="badge">${product.category}</span>
        </div>
        <p>${product.desc}</p>
        <div class="card-controls">
          <select class="size-select" data-role="size">
            ${SIZE_OPTIONS.map((s) => `<option value="${s.code}">${s.label} (${s.code})</option>`).join("")}
          </select>
          <div class="qty-picker">
            <button data-role="qty-minus" type="button">-</button>
            <input class="qty-input" data-role="qty-input" value="1" readonly>
            <button data-role="qty-plus" type="button">+</button>
          </div>
        </div>
        <div class="product-foot">
          <strong data-role="card-price">${money.format(unitPrice(product.id, "S"))}</strong>
          <button class="add-btn" data-role="add-to-cart" type="button">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function refreshCardPrice(card) {
  const productId = Number(card.dataset.productId);
  const sizeSelect = card.querySelector('[data-role="size"]');
  const priceEl = card.querySelector('[data-role="card-price"]');
  if (!Number.isInteger(productId) || !sizeSelect || !priceEl) return;
  priceEl.textContent = money.format(unitPrice(productId, sizeSelect.value));
}

function renderProducts() {
  if (!productsEl) return;
  const filtered = getFilteredProducts();
  if (filtered.length === 0) {
    productsEl.innerHTML = `<p class="empty-state">No coffees match this filter.</p>`;
    return;
  }
  productsEl.innerHTML = filtered.map(productCardMarkup).join("");
}

function renderFeatured() {
  if (!featuredEl) return;
  featuredEl.innerHTML = products.map(productCardMarkup).join("");
}

function cartItemTotal(item) {
  return unitPrice(item.id, item.size) * item.qty;
}

function getTotals() {
  const items = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + cartItemTotal(item), 0);
  const tax = subtotal * TAX_RATE;
  return { items, subtotal, tax, total: subtotal + tax };
}

function updateBadgeCounts() {
  const count = String(getTotals().items);
  document.querySelectorAll(".cart-count-badge").forEach((el) => {
    el.textContent = count;
  });
}

function cartLineMarkup(item) {
  const product = products.find((p) => p.id === item.id);
  if (!product) return "";
  return `
    <li class="cart-item">
      <div class="cart-item-head">
        <div>
          <h4>${product.name}</h4>
          <small>${sizeLabel(item.size)} • ${money.format(unitPrice(item.id, item.size))} each</small>
        </div>
        <button class="remove-btn" data-role="remove" data-id="${item.id}" data-size="${item.size}" type="button">Remove</button>
      </div>
      <div class="item-controls">
        <div class="qty-row">
          <button data-role="dec" data-id="${item.id}" data-size="${item.size}" type="button">-</button>
          <span>${item.qty}</span>
          <button data-role="inc" data-id="${item.id}" data-size="${item.size}" type="button">+</button>
        </div>
        <strong>${money.format(cartItemTotal(item))}</strong>
      </div>
    </li>
  `;
}

function renderCartDrawer() {
  if (!cartItemsEl) return;
  cartItemsEl.innerHTML =
    state.cart.length === 0 ? `<li class="empty-state">Your cart is empty.</li>` : state.cart.map(cartLineMarkup).join("");
  const totals = getTotals();
  const ids = [
    ["#item-total", totals.items],
    ["#subtotal-total", money.format(totals.subtotal)],
    ["#tax-total", money.format(totals.tax)],
    ["#price-total", money.format(totals.total)],
  ];
  ids.forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = String(value);
  });
  updateBadgeCounts();
}

function renderCartPage() {
  if (!cartPageItemsEl) return;
  cartPageItemsEl.innerHTML =
    state.cart.length === 0 ? `<li class="empty-state">Your cart is empty. Add coffee from Menu.</li>` : state.cart.map(cartLineMarkup).join("");

  const totals = getTotals();
  const pairs = [
    ["#cart-page-item-total", totals.items],
    ["#cart-page-subtotal", money.format(totals.subtotal)],
    ["#cart-page-tax", money.format(totals.tax)],
    ["#cart-page-total", money.format(totals.total)],
  ];
  pairs.forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = String(value);
  });
}

function rerenderCartAreas() {
  renderCartDrawer();
  renderCartPage();
}

function addToCart(productId, sizeCode, qty) {
  const quantity = Math.max(1, Math.min(10, qty));
  const existing = state.cart.find((item) => item.id === productId && item.size === sizeCode);
  if (existing) existing.qty = Math.min(20, existing.qty + quantity);
  else state.cart.push({ id: productId, size: sizeCode, qty: quantity });
  saveCart();
  rerenderCartAreas();
  showToast("Added to cart");
}

function updateCartItem(productId, sizeCode, delta) {
  const target = state.cart.find((item) => item.id === productId && item.size === sizeCode);
  if (!target) return;
  target.qty += delta;
  if (target.qty <= 0) {
    state.cart = state.cart.filter((item) => !(item.id === productId && item.size === sizeCode));
  }
  saveCart();
  rerenderCartAreas();
}

function removeCartItem(productId, sizeCode) {
  state.cart = state.cart.filter((item) => !(item.id === productId && item.size === sizeCode));
  saveCart();
  rerenderCartAreas();
}

function clearCart() {
  state.cart = [];
  saveCart();
  rerenderCartAreas();
}

function openCartDrawer() {
  if (cartDrawerEl) cartDrawerEl.classList.add("open");
  if (overlayEl) overlayEl.classList.add("show");
}

function closeCartDrawer() {
  if (cartDrawerEl) cartDrawerEl.classList.remove("open");
  if (overlayEl) overlayEl.classList.remove("show");
}

let toastTimer = null;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function showOrderSummary(orderItems) {
  if (!orderModal || !orderSummaryList || !orderSummaryTotal) return;
  const totals = {
    subtotal: orderItems.reduce((sum, item) => sum + cartItemTotal(item), 0),
  };
  totals.tax = totals.subtotal * TAX_RATE;
  totals.total = totals.subtotal + totals.tax;
  orderSummaryList.innerHTML = orderItems
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return "";
      return `<li>${product.name} (${sizeLabel(item.size)}) × ${item.qty} — ${money.format(cartItemTotal(item))}</li>`;
    })
    .join("");
  orderSummaryTotal.textContent = money.format(totals.total);
  orderModal.classList.add("show");
}

function checkout() {
  if (state.cart.length === 0) {
    showToast("Your cart is empty");
    return;
  }
  const snapshot = state.cart.map((item) => ({ ...item }));
  clearCart();
  closeCartDrawer();
  showOrderSummary(snapshot);
}

function handleCardInteraction(event) {
  const card = event.target.closest(".product-card");
  if (!card) return;

  const qtyInput = card.querySelector('[data-role="qty-input"]');
  const sizeSelect = card.querySelector('[data-role="size"]');
  const productId = Number(card.dataset.productId);
  if (!Number.isInteger(productId)) return;

  if (event.target.matches('[data-role="qty-plus"]')) {
    qtyInput.value = String(Math.min(10, Number(qtyInput.value) + 1));
  }
  if (event.target.matches('[data-role="qty-minus"]')) {
    qtyInput.value = String(Math.max(1, Number(qtyInput.value) - 1));
  }
  if (event.target.matches('[data-role="add-to-cart"]')) {
    addToCart(productId, sizeSelect.value, Number(qtyInput.value));
  }
}

function handleCardSelectionChange(event) {
  if (!event.target.matches('[data-role="size"]')) return;
  const card = event.target.closest(".product-card");
  if (!card) return;
  refreshCardPrice(card);
}

function handleCartInteraction(event) {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const sizeCode = button.dataset.size;
  if (!Number.isInteger(id) || !sizeCode) return;
  const role = button.dataset.role;
  if (role === "inc") updateCartItem(id, sizeCode, 1);
  if (role === "dec") updateCartItem(id, sizeCode, -1);
  if (role === "remove") removeCartItem(id, sizeCode);
}

function bindEvents() {
  if (chipsEl) {
    chipsEl.addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      state.category = chip.dataset.category || "All";
      renderChips();
      renderProducts();
    });
  }

  if (searchEl) {
    searchEl.addEventListener("input", (event) => {
      state.search = event.target.value || "";
      renderProducts();
    });
  }

  if (productsEl) productsEl.addEventListener("click", handleCardInteraction);
  if (featuredEl) featuredEl.addEventListener("click", handleCardInteraction);
  if (productsEl) productsEl.addEventListener("change", handleCardSelectionChange);
  if (featuredEl) featuredEl.addEventListener("change", handleCardSelectionChange);
  if (cartItemsEl) cartItemsEl.addEventListener("click", handleCartInteraction);
  if (cartPageItemsEl) cartPageItemsEl.addEventListener("click", handleCartInteraction);
  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
  if (overlayEl) overlayEl.addEventListener("click", closeCartDrawer);
  if (clearCartBtn) clearCartBtn.addEventListener("click", () => { clearCart(); showToast("Cart cleared"); });
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);
  if (cartPageClearBtn) cartPageClearBtn.addEventListener("click", () => { clearCart(); showToast("Cart cleared"); });
  if (cartPageCheckoutBtn) cartPageCheckoutBtn.addEventListener("click", checkout);
  if (closeOrderModalBtn) closeOrderModalBtn.addEventListener("click", () => orderModal.classList.remove("show"));
  if (contactSendBtn) contactSendBtn.addEventListener("click", () => showToast("Thanks! We will contact you soon."));
}

function init() {
  renderChips();
  renderProducts();
  renderFeatured();
  rerenderCartAreas();
  bindEvents();
}

init();
