const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// serve tudo da pasta public como site
app.use(express.static("public")); // express.static = padrão pra estáticos :contentReference[oaicite:0]{index=0}

/* ---------- PRODUCTS API ---------- */

// listar todos os produtos
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// pegar produto por id (page product)
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  });
});

/* ---------- CART API ---------- */

// pegar carrinho com join
app.get("/api/cart", (req, res) => {
  const sql = `
    SELECT cart.productId, cart.qty, products.name, products.price, products.image
    FROM cart
    JOIN products ON cart.productId = products.id
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// adicionar ao carrinho (qty++)
app.post("/api/cart", (req, res) => {
  const { productId } = req.body;

  db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      db.run(
        "UPDATE cart SET qty = qty + 1 WHERE productId = ?",
        [productId],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ ok: true });
        }
      );
    } else {
      db.run(
        "INSERT INTO cart (productId, qty) VALUES (?, 1)",
        [productId],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ ok: true });
        }
      );
    }
  });
});

// mudar quantidade
app.put("/api/cart/:productId", (req, res) => {
  const { qty } = req.body;
  const productId = req.params.productId;

  if (qty <= 0) {
    db.run("DELETE FROM cart WHERE productId = ?", [productId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: true });
    });
  } else {
    db.run(
      "UPDATE cart SET qty = ? WHERE productId = ?",
      [qty, productId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ok: true });
      }
    );
  }
});

// remover item
app.delete("/api/cart/:productId", (req, res) => {
  const productId = req.params.productId;
  db.run("DELETE FROM cart WHERE productId = ?", [productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// limpar carrinho (checkout)
app.delete("/api/cart", (req, res) => {
  db.run("DELETE FROM cart", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Fynko server running on http://localhost:${PORT}`);
});
