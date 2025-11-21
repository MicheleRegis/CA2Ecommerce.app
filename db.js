const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "ecommerce.db"));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER,
      qty INTEGER,
      FOREIGN KEY(productId) REFERENCES products(id)
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (row.count === 0) {
      const insert = db.prepare(
        "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)"
      );
      insert.run("Headphones", "Noise cancelling wireless headphones", 79.99, "https://via.placeholder.com/300");
      insert.run("Keyboard", "Mechanical RGB keyboard", 59.99, "https://via.placeholder.com/300");
      insert.run("Mouse", "Wireless ergonomic mouse", 29.99, "https://via.placeholder.com/300");
      insert.run("Monitor", "24-inch IPS monitor", 149.99, "https://via.placeholder.com/300");
      insert.finalize();
    }
  });
});

function getProducts(cb) {
  db.all("SELECT * FROM products", cb);
}
function getProductById(id, cb) {
  db.get("SELECT * FROM products WHERE id = ?", [id], cb);
}
function getCart(cb) {
  db.all(`
    SELECT c.productId, c.qty, p.name, p.price,
           (c.qty * p.price) AS subtotal
    FROM cart c JOIN products p ON p.id = c.productId
  `, cb);
}
function addToCart(productId, qty, cb) {
  db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, row) => {
    if (row) {
      db.run("UPDATE cart SET qty = qty + ? WHERE productId = ?", [qty, productId], cb);
    } else {
      db.run("INSERT INTO cart (productId, qty) VALUES (?, ?)", [productId, qty], cb);
    }
  });
}
function removeFromCart(productId, cb) {
  db.run("DELETE FROM cart WHERE productId = ?", [productId], cb);
}

// CA2 market rate simulation
function updateMarketRate() {
  db.all("SELECT * FROM products", (err, products) => {
    products.forEach(p => {
      const factor = 1 + (Math.random() * 0.10 - 0.05);
      const newPrice = +(p.price * factor).toFixed(2);
      db.run("UPDATE products SET price = ? WHERE id = ?", [newPrice, p.id]);
    });
  });
}

module.exports = {
  getProducts,
  getProductById,
  getCart,
  addToCart,
  removeFromCart,
  updateMarketRate
};

