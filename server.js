const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===============================
   HELPERS
================================ */
function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}

function asyncWrap(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/* ===============================
   MARKET RATE (PREMIUM FIX)
================================ */

// guarda o último rate mostrado
let LAST_RATE = null;
let LAST_RATE_TIME = 0;

function marketRateMock() {
  // -3% até +3% (bem visível e realista)
  const changePct = Math.random() * 6 - 3; 
  const rate = 1 + changePct / 100;

  return +rate.toFixed(4);
}

// endpoint que MOSTRA e salva o rate
app.get("/api/market-rate", (req, res) => {
  const rate = marketRateMock();
  LAST_RATE = rate;
  LAST_RATE_TIME = Date.now();

  res.json({
    rate,
    updatedAt: new Date().toISOString()
  });
});

// endpoint que APLICA o MESMO rate mostrado
app.post("/api/products/update-prices", asyncWrap(async (req, res) => {
  // usa último rate se foi gerado há menos de 5 min
  const now = Date.now();
  const useLast = LAST_RATE && (now - LAST_RATE_TIME) < 5 * 60 * 1000;

  const rate = useLast ? LAST_RATE : marketRateMock();

  const products = await dbAll("SELECT * FROM products");

  for (const p of products) {
    const newPrice = +(p.price * rate).toFixed(2);
    await dbRun("UPDATE products SET price = ? WHERE id = ?", [newPrice, p.id]);
  }

  const updated = await dbAll("SELECT * FROM products");

  res.json({
    success: true,
    rate,
    products: updated
  });
}));


/* ===============================
   PRODUCTS
================================ */
app.get("/api/products", asyncWrap(async (req, res) => {
  const rows = await dbAll("SELECT * FROM products");
  res.json(rows);
}));

app.get("/api/products/:id", asyncWrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!isPositiveInt(id)) return res.status(400).json({ error: "Invalid product id" });

  const row = await dbGet("SELECT * FROM products WHERE id = ?", [id]);
  if (!row) return res.status(404).json({ error: "Product not found" });

  res.json(row);
}));

/* ===============================
   APPLY MARKET RATE TO ALL PRICES
================================ */
app.post("/api/products/update-prices", asyncWrap(async (req, res) => {
  const rate = marketRateMock();
  const products = await dbAll("SELECT * FROM products");

  for (const p of products) {
    const newPrice = +(p.price * rate).toFixed(2);
    await dbRun("UPDATE products SET price = ? WHERE id = ?", [newPrice, p.id]);
  }

  const updated = await dbAll("SELECT * FROM products");

  res.json({
    success: true,
    rate,
    products: updated
  });
}));

/* ===============================
   CART
================================ */
app.get("/api/cart", asyncWrap(async (req, res) => {
  const rows = await dbAll(`
    SELECT cart.productId, cart.qty, products.name, products.price, products.image
    FROM cart
    JOIN products ON cart.productId = products.id
  `);
  res.json(rows);
}));

app.post("/api/cart", asyncWrap(async (req, res) => {
  const productId = Number(req.body.productId);
  if (!isPositiveInt(productId)) return res.status(400).json({ error: "Invalid product id" });

  const product = await dbGet("SELECT * FROM products WHERE id = ?", [productId]);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const row = await dbGet("SELECT * FROM cart WHERE productId = ?", [productId]);

  if (row) {
    await dbRun("UPDATE cart SET qty = qty + 1 WHERE productId = ?", [productId]);
    return res.json({ ok: true });
  }

  await dbRun("INSERT INTO cart (productId, qty) VALUES (?, 1)", [productId]);
  res.status(201).json({ ok: true });
}));

app.put("/api/cart/:productId", asyncWrap(async (req, res) => {
  const productId = Number(req.params.productId);
  const qty = Number(req.body.qty);

  if (!isPositiveInt(productId) || !Number.isInteger(qty)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const product = await dbGet("SELECT * FROM products WHERE id = ?", [productId]);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (qty <= 0) {
    await dbRun("DELETE FROM cart WHERE productId = ?", [productId]);
    return res.json({ ok: true });
  }

  await dbRun("UPDATE cart SET qty = ? WHERE productId = ?", [qty, productId]);
  res.json({ ok: true });
}));

app.delete("/api/cart/:productId", asyncWrap(async (req, res) => {
  const productId = Number(req.params.productId);
  if (!isPositiveInt(productId)) return res.status(400).json({ error: "Invalid product id" });

  await dbRun("DELETE FROM cart WHERE productId = ?", [productId]);
  res.json({ ok: true });
}));

app.delete("/api/cart", asyncWrap(async (req, res) => {
  await dbRun("DELETE FROM cart");
  res.json({ ok: true });
}));

/* ===============================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
