const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- PRODUCTS ---------------- */

// GET all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single product by id
app.get("/api/products/:id", (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  });
});

/* ---------------- CART ---------------- */

// GET cart with product details
app.get("/api/cart", (req, res) => {
  const sql = `
    SELECT cart.id, cart.productId, cart.qty,
           products.name, products.price, products.image
    FROM cart
    JOIN products ON products.id = cart.productId
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ADD item to cart
app.post("/api/cart", (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId required" });

  db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      db.run(
        "UPDATE cart SET qty = qty + 1 WHERE productId = ?",
        [productId],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: "Quantity updated" });
        }
      );
    } else {
      db.run(
        "INSERT INTO cart (productId, qty) VALUES (?, 1)",
        [productId],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: "Added to cart" });
        }
      );
    }
  });
});

// UPDATE quantity
app.put("/api/cart/:productId", (req, res) => {
  const { qty } = req.body;
  const { productId } = req.params;

  if (qty <= 0) {
    db.run("DELETE FROM cart WHERE productId = ?", [productId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Removed item" });
    });
  } else {
    db.run(
      "UPDATE cart SET qty = ? WHERE productId = ?",
      [qty, productId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Quantity updated" });
      }
    );
  }
});

// REMOVE item
app.delete("/api/cart/:productId", (req, res) => {
  const { productId } = req.params;
  db.run("DELETE FROM cart WHERE productId = ?", [productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Removed item" });
  });
});

// CLEAR cart (checkout)
app.delete("/api/cart", (req, res) => {
  db.run("DELETE FROM cart", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Cart cleared" });
  });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`Fynko server running on http://localhost:${PORT}`);
});
