function $(id){ return document.getElementById(id); }
function getParams(){ return new URLSearchParams(window.location.search); }

// HOME
async function loadProductsList(){
  const res = await fetch("/api/products");
  const products = await res.json();

  const list = $("product-list");
  if (!list) return;

  list.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>€${p.price.toFixed(2)}</p>
      <a class="btn" href="products.html?id=${p.id}">View</a>
      <button class="btn add" data-id="${p.id}">Add to cart</button>
    `;
    list.appendChild(card);
  });

  document.querySelectorAll(".add").forEach(btn => {
    btn.onclick = () => addItem(btn.dataset.id, 1);
  });
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
        <p>${p.description}</p>
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
      <button class="btn danger" data-id="${i.productId}">Remove</button>
    `;
    wrap.appendChild(row);
  });

  $("total").textContent = `Total: €${total.toFixed(2)}`;

  document.querySelectorAll(".danger").forEach(btn => {
    btn.onclick = () => removeItem(btn.dataset.id);
  });
}

// API CALLS
async function addItem(id, qty){
  await fetch("/api/cart/add", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ productId:id, qty })
  });
  alert("Added!");
}

async function removeItem(id){
  await fetch("/api/cart/remove", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ productId:id })
  });
  loadCart();
}

loadProductsList();
loadProductDetail();
loadCart();

