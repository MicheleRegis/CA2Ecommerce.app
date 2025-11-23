const API = "/api";
let PRODUCTS = [];
let CART = [];

const page = document.body.dataset.page;

// helpers
const qs = (sel) => document.querySelector(sel);
const money = (v) => `€${Number(v).toFixed(2)}`;

// load badge
async function updateBadge() {
  const badge = qs("#cartBadge");
  if (!badge) return;

  const res = await fetch(`${API}/cart`);
  CART = await res.json();
  const totalQty = CART.reduce((s, i) => s + i.qty, 0);

  badge.textContent = totalQty;
  badge.classList.toggle("hidden", totalQty === 0);
}

/* ---------------- HOME / PRODUCTS ---------------- */
async function loadProducts() {
  const res = await fetch(`${API}/products`);
  PRODUCTS = await res.json();

  renderCategories();
  renderProducts(PRODUCTS);
}

function renderProducts(list) {
  const wrap = qs("#product-list");
  if (!wrap) return;

  wrap.innerHTML = list.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <div class="card-top">
          <h3>${p.name}</h3>
          <span class="cat">${p.category}</span>
        </div>
        <p class="desc">${p.description}</p>
        <strong class="price">${money(p.price)}</strong>

        <div class="card-actions">
          <button class="btn outline" onclick="viewProduct(${p.id})">View</button>
          <button class="btn" onclick="addToCart(${p.id})">Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCategories() {
  const wrap = qs("#categoryWrap");
  if (!wrap) return;

  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  wrap.innerHTML = cats.map(c => `
    <button class="cat-btn ${c==="All"?"active":""}" data-cat="${c}">${c}</button>
  `).join("");

  wrap.addEventListener("click", (e) => {
    if (!e.target.dataset.cat) return;
    wrap.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    const cat = e.target.dataset.cat;
    if (cat === "All") renderProducts(PRODUCTS);
    else renderProducts(PRODUCTS.filter(p => p.category === cat));
  });
}

function attachSearchAndPriceUpdate() {
  const input = qs("#searchInput");
  const updateBtn = qs("#updatePricesBtn");

  if (input) {
    input.addEventListener("input", () => {
      const t = input.value.toLowerCase();
      renderProducts(PRODUCTS.filter(p => p.name.toLowerCase().includes(t)));
    });
  }

  if (updateBtn) {
    updateBtn.addEventListener("click", () => {
      PRODUCTS = PRODUCTS.map(p => ({
        ...p,
        price: +(p.price * (0.95 + Math.random() * 0.1)).toFixed(2)
      }));
      renderProducts(PRODUCTS);
    });
  }
}

function viewProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  alert(`${p.name}\n\n${p.description}\n\nPrice: ${money(p.price)}`);
}

async function addToCart(id) {
  await fetch(`${API}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: id })
  });
  updateBadge();
}

/* ---------------- CART ---------------- */
async function loadCart() {
  const wrap = qs("#cart-list");
  if (!wrap) return;

  const res = await fetch(`${API}/cart`);
  CART = await res.json();

  if (CART.length === 0) {
    wrap.innerHTML = `
      <div class="empty">
        <h3>Your cart is empty</h3>
        <button class="btn" onclick="location.href='index.html'">Browse products</button>
      </div>
    `;
    qs("#cartTotal").textContent = money(0);
    return;
  }

  wrap.innerHTML = CART.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}">
      <div class="cart-info">
        <h4>${i.name}</h4>
        <p>${money(i.price)} each</p>
      </div>

      <div class="qty">
        <button onclick="changeQty(${i.productId}, ${i.qty-1})">-</button>
        <span>${i.qty}</span>
        <button onclick="changeQty(${i.productId}, ${i.qty+1})">+</button>
      </div>

      <strong class="line-total">${money(i.price * i.qty)}</strong>

      <button class="trash" onclick="removeItem(${i.productId})">🗑️</button>
    </div>
  `).join("");

  const total = CART.reduce((s, i) => s + i.price * i.qty, 0);
  qs("#cartTotal").textContent = money(total);

  qs("#checkoutBtn").onclick = () => location.href = "checkout.html";
}

async function changeQty(productId, qty) {
  await fetch(`${API}/cart/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty })
  });
  loadCart();
  updateBadge();
}

async function removeItem(productId) {
  await fetch(`${API}/cart/${productId}`, { method: "DELETE" });
  loadCart();
  updateBadge();
}

/* ---------------- CHECKOUT ---------------- */
function attachCheckout() {
  const btn = qs("#confirmCheckoutBtn");
  const box = qs("#checkoutSuccess");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    await fetch(`${API}/cart`, { method: "DELETE" });
    box.classList.remove("hidden");

    setTimeout(() => {
      location.href = "index.html";
    }, 2500);
  });
}

/* ---------------- INIT ---------------- */
(async function init(){
  await updateBadge();

  if (page === "home") {
    await loadProducts();
    attachSearchAndPriceUpdate();
  }

  if (page === "cart") {
    await loadCart();
  }

  if (page === "checkout") {
    attachCheckout();
  }
})();
