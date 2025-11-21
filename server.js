const express = require("express");
const cors = require("cors");
const {
  getProducts,
  getProductById,
  getCart,
  addToCart,
  removeFromCart,
  updateMarketRate
} = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve a pasta public

app.get("/api/products", (req, res) => {
  updateMarketRate();
  getProducts((err, rows) => res.json(rows));
});

app.get("/api/products/:id", (req, res) => {
  getProductById(req.params.id, (err, row) => {
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  });
});

app.get("/api/cart", (req, res) => {
  getCart((err, rows) => res.json(rows));
});

app.post("/api/cart/add", (req, res) => {
  const { productId, qty } = req.body;
  addToCart(productId, qty || 1, () => {
    getCart((err, rows) => res.json(rows));
  });
});

app.post("/api/cart/remove", (req, res) => {
  removeFromCart(req.body.productId, () => {
    getCart((err, rows) => res.json(rows));
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

