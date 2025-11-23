const API = "/api";
let PRODUCTS = [];
let CART = [];
let WISHLIST = JSON.parse(localStorage.getItem("wishlist")) || [];

const page = document.body.dataset.page;

const qs = (sel) => document.querySelector(sel);
const money = (v) => `€${Number(v).toFixed(2)}`;
// Make brand always go home (works on any page)
document.addEventListener("DOMContentLoaded", () => {
  const brand = document.querySelector(".brand");
  if (brand && !brand.onclick) {
    brand.style.cursor = "pointer";
    brand.addEventListener("click", () => location.href="index.html");
  }
});


async function updateBadge() {
  const badge = qs("#cartBadge");
  if (!badge) return;

  const res = await fetch(`${API}/cart`);
  CART = await res.json();
  const totalQty = CART.reduce((s, i) => s + i.qty, 0);

  badge.textContent = totalQty;
  badge.classList.toggle("hidden", totalQty === 0);
}

/* TOAST */
function showToast(msg){
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 300);
  }, 2300);
}

/* FAVORITES */
function toggleFav(id){
  if (WISHLIST.includes(id)) {
    WISHLIST = WISHLIST.filter(f => f !== id);
    showToast("Removed from favorites ❤️");
  } else {
    WISHLIST.push(id);
    showToast("Added to favorites ❤️");
  }
  localStorage.setItem("wishlist", JSON.stringify(WISHLIST));
  renderProducts(PRODUCTS);
  renderFeatured(PRODUCTS.slice(0,3));
}

/* HOME */
async function loadProducts() {
  const listWrap = qs("#product-list");
  if (listWrap) {
    listWrap.innerHTML = "<div class='card skeleton' style='height:260px;'></div>".repeat(6);
  }

  const res = await fetch(`${API}/products`);
  PRODUCTS = await res.json();

  renderFeatured(PRODUCTS.slice(0,3));
  renderCategories();
  renderProducts(PRODUCTS);
  renderCarousel(PRODUCTS.slice(-4));
}

function productCard(p){
  const isFav = WISHLIST.includes(p.id);
  return `
    <article class="card">
      <button class="fav-btn" onclick="toggleFav(${p.id}); event.stopPropagation();">
        ${isFav ? "❤️" : "🤍"}
      </button>

      <div class="clickable" onclick="openProduct(${p.id})">
        <img src="${p.image}" alt="${p.name}">
      </div>

      <div class="card-body">
        <div class="card-top clickable" onclick="openProduct(${p.id})">
          <h3>${p.name}</h3>
          <span class="cat">${p.category}</span>
        </div>

        <p class="desc">${p.description}</p>
        <strong class="price">${money(p.price)}</strong>

        <div class="card-actions">
          <button class="btn outline" onclick="openProduct(${p.id})">View</button>
          <button class="btn" onclick="addToCart(${p.id})">Add</button>
        </div>
      </div>
    </article>
  `;
}

function renderFeatured(list){
  const wrap = qs("#featured-list");
  if (!wrap) return;
  wrap.innerHTML = list.map(productCard).join("");
}

function renderProducts(list) {
  const wrap = qs("#product-list");
  if (!wrap) return;
  wrap.innerHTML = list.map(productCard).join("");
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
      renderFeatured(PRODUCTS.slice(0,3));
      renderProducts(PRODUCTS);
      showToast("Prices updated ✅");
    });
  }
}

function openProduct(id){
  location.href = `product.html?id=${id}`;
  onclick="openProduct(${p.id})"

}

async function addToCart(id) {
  await fetch(`${API}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: id })
  });
  updateBadge();
  showToast("Added to cart ✔");
}

/* CAROUSEL */
function renderCarousel(list){
  const wrap = qs("#carousel");
  if (!wrap) return;
  wrap.innerHTML = list.map(p => `
    <div class="carousel-item" onclick="openProduct(${p.id})">
      <img src="${p.image}" style="width:100%;height:120px;object-fit:contain;background:#0c0e1a;border-radius:8px;">
      <h4 style="margin-top:10px">${p.name}</h4>
      <p class="muted">${money(p.price)}</p>
    </div>
  `).join("");
}

/* PRODUCT PAGE */
function loadProductPage(){
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get("id"));

  fetch(`/api/products/${id}`)
    .then(res => res.json())
    .then(p => {
      const wrap = document.getElementById("productDetail");
      wrap.classList.remove("skeleton");

      wrap.innerHTML = `
        <div class="product-left">
          <img src="${p.image}" alt="${p.name}" onclick="openZoom('${p.image}')">
        </div>

        <div class="product-right">
          <h2>${p.name}</h2>
          <p class="desc">${p.description}</p>
          <p class="price">€${p.price.toFixed(2)}</p>
          <button class="btn main" onclick="addToCart(${p.id})">
            Add to Cart
          </button>
        </div>
      `;
    });
}


/* CART */
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

/* CHECKOUT */
async function loadCheckoutSummary(){
  const res = await fetch(`${API}/cart`);
  CART = await res.json();

  const list = qs("#summaryList");
  const totalEl = qs("#summaryTotal");
  if (!list || !totalEl) return;

  if (CART.length === 0){
    list.innerHTML = "<p class='muted'>Your cart is empty.</p>";
    totalEl.textContent = money(0);
    return;
  }

  list.innerHTML = CART.map(i => `
    <div class="summary-item">
      <span>${i.name} x${i.qty}</span>
      <span>${money(i.price * i.qty)}</span>
    </div>
  `).join("");

  const total = CART.reduce((s,i)=> s + i.price*i.qty, 0);
  totalEl.textContent = money(total);
}

function attachCheckoutForm(){
  const form = qs("#checkoutForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = qs("#fullName").value.trim();
    const email = qs("#email").value.trim();
    const phone = qs("#phone").value.trim();

    if (!fullName || !email || !phone){
      showToast("Fill all fields before confirming ❗");
      return;
    }

    await fetch(`${API}/cart`, { method: "DELETE" });

    qs("#checkoutSuccess").classList.remove("hidden");
    showToast("Order confirmed ✅");

    setTimeout(() => location.href="index.html", 2200);
  });
}

/* INIT */
(async function init(){
  await updateBadge();

  if (page === "home") {
    await loadProducts();
    attachSearchAndPriceUpdate();
  }

  if (page === "cart") await loadCart();
  if (page === "checkout") {
    await loadCheckoutSummary();
    attachCheckoutForm();
  }
  if (page === "product") await loadProductPage();
})();

function openZoom(src){
  const box = document.getElementById("lightbox");
  const img = document.getElementById("zoomImg");
  if(!box || !img) return;
  img.src = src;
  box.classList.add("show");
}
function closeZoom(){
  const box = document.getElementById("lightbox");
  if(box) box.classList.remove("show");
}
