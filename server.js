const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// servir pasta public
app.use(express.static(path.join(__dirname, "public"))); // :contentReference[oaicite:4]{index=4}

// helpers
function updateMarketRate(price) {
  const factor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
  return parseFloat((price * factor).toFixed(2));
}

/* ===== PRODUCTS ===== */

// listar todos com preço atualizado
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const updated = rows.map(p => ({
      ...p,
      price: updateMarketRate(p.price)
    }));

    res.json(updated);
  });
});

// detalhe
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Product not found" });

    row.price = updateMarketRate(row.price);
    res.json(row);
  });
});

/* ===== CART ===== */
app.get("/api/cart", (req, res) => {
  const sql = `
    SELECT c.productId, c.qty, p.name, p.price, p.image,
           (c.qty * p.price) AS subtotal
    FROM cart c
    JOIN products p ON p.id = c.productId
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/cart/add", (req, res) => {
  const { productId, qty } = req.body;

  db.get("SELECT qty FROM cart WHERE productId = ?", [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      db.run(
        "UPDATE cart SET qty = qty + ? WHERE productId = ?",
        [qty, productId],
        () => res.json({ ok: true })
      );
    } else {
      db.run(
        "INSERT INTO cart (productId, qty) VALUES (?, ?)",
        [productId, qty],
        () => res.json({ ok: true })
      );
    }
  });
});

app.post("/api/cart/remove", (req, res) => {
  const { productId } = req.body;

  db.run("DELETE FROM cart WHERE productId = ?", [productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

/* ===== CHECKOUT (demo) ===== */
app.post("/api/checkout", (req, res) => {
  // em app real: salvar order, limpar cart etc.
  db.run("DELETE FROM cart", [], () => {
    res.json({ ok: true, message: "Order placed! (demo)" });
  });
});

app.listen(PORT, () => {
  console.log(`Fynko server running on http://localhost:${PORT}`);
});
