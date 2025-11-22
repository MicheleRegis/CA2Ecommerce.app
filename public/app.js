function $(id){ return document.getElementById(id); }
function getParams(){ return new URLSearchParams(window.location.search); }

let allProducts = [];
let selectedCategory = "All";
let searchTerm = "";

// HOME
async function loadProductsList(){
  const res = await fetch("/api/products");
  allProducts = await res.json();

  renderCategories();
  renderProducts();
  updateCartBadge();
}

function renderProducts(){
  const list = $("product-list");
  if (!list) return;

  const filtered = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || (p.category || "").toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  list.innerHTML = "";
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="p-16">
        <div style="display:flex; justify-content:space-between; align-items:start; gap:8px;">
          <h3>${p.name}</h3>
          ${p.category ? `<span style="font-size:11px;background:#ede9fe;color:#5b21b6;padding:2px 6px;border-radius:999px">${p.category}</span>` : ""}
        </div>
        <p>${p.description || ""}</p>
        <p class="price">€${p.price.toFixed(2)}</p>
        <div style="display:flex; gap:8px; margin-top:10px;">
          <a class="btn" style="flex:1; text-align:center;" href="products.html?id=${p.id}">View</a>
          <button class="btn" style="flex:1;" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("button.btn").forEach(btn=>{
    btn.onclick = ()=> addItem(btn.dataset.id, 1);
  });
}

function renderCategories(){
  const wrap = $("categoryWrap");
  if (!wrap) return;

  const cats = ["All", ...new Set(allProducts.map(p => p.category).filter(Boolean))];

  wrap.innerHTML = "";
  cats.forEach(c=>{
    const b = document.createElement("button");
    b.className = "cat" + (c===selectedCategory ? " active":"");
    b.textContent = c;
    b.onclick = ()=>{
      selectedCategory = c;
      renderCategories();
      renderProducts();
    };
    wrap.appendChild(b);
  });

  const searchInput = $("searchInput");
  if (searchInput) {
    searchInput.oninput = (e)=>{
      searchTerm = e.target.value;
      renderProducts();
    };
  }

  const updateBtn = $("updatePricesBtn");
  if (updateBtn) {
    updateBtn.onclick = async ()=>{
      await loadProductsList();
      alert("Prices updated!");
    };
  }
}

// DETALHE
async function loadProductDetail(){
  const wrap = $("product");
  if (!wrap) return;

  const id = getParams().get("id");
  const res = await fetch(`/api/products/${id}`);
  const p = await res.json();

  wrap.innerHTML = `
    <div class="product">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <h2>${p.name}</h2>
        <p>${p.description || ""}</p>
        <p class="price">€${p.price.toFixed(2)}</p>
        <button class="btn" id="addBtn">Add to cart</button>
      </div>
    </div>
  `;
  $("addBtn").onclick = () => addItem(p.id, 1);
}

// CARRINHO
async function loadCart(){
  const wrap = $("cart-items");
  if (!wrap) return;

  const res = await fetch("/api/cart");
  const items = await res.json();

  wrap.innerHTML = "";
  let total = 0;

  items.forEach(i => {
    total += i.subtotal;

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${i.name} (x${i.qty})</span>
      <span>€${i.subtotal.toFixed(2)}</span>
      <button class="btn" style="background:#ef4444" data-id="${i.productId}">Remove</button>
    `;
    wrap.appendChild(row);
  });

  if ($("total")) $("total").textContent = `Total: €${total.toFixed(2)}`;

  wrap.querySelectorAll("button.btn").forEach(btn=>{
    btn.onclick = ()=> removeItem(btn.dataset.id);
  });

  updateCartBadge(items);
}

async function updateCartBadge(items){
  const badge = $("cartBadge");
  if (!badge) return;

  if (!items) {
    const r = await fetch("/api/cart");
    items = await r.json();
  }
  const count = items.reduce((s,i)=> s+i.qty, 0);
  badge.textContent = count;
  badge.classList.toggle("hidden", count===0);
}

// API CALLS
async function addItem(id, qty){
  await fetch("/api/cart/add", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ productId:id, qty })
  });
  updateCartBadge();
  alert("Added!");
}

async function removeItem(id){
  await fetch("/api/cart/remove", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ productId:id })
  });
  loadCart();
  updateCartBadge();
}

// CHECKOUT
const form = $("checkout-form");
if (form) {
  form.onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/checkout", { method:"POST" });
    const data = await res.json();
    $("checkout-message").textContent = data.message;
    setTimeout(()=> location.href="index.html", 2000);
  };
}

// INIT
loadProductsList();
loadProductDetail();
loadCart();
