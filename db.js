const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./ecommerce.db");

// cria tabelas e faz seed
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT
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

  // seed (só insere se vazio)
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      console.error("Error checking products table:", err.message);
      return;
    }

    if (row.count === 0) {
      const insert = db.prepare(
        "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)"
      );

      insert.run(
        "Wireless Headphones",
        "Premium wireless headphones with noise cancellation",
        79.99,
        "/image/headphone.png",
        "Electronics"
      );

      insert.run(
        "Smart Watch",
        "Fitness tracking smart watch with heart rate monitor",
        199.99,
        "/image/smartwatch.png",
        "Electronics"
      );

      insert.run(
        "Laptop Stand",
        "Ergonomic aluminum laptop stand",
        45.99,
        "/image/stand.png",
        "Accessories"
      );

      insert.run(
        "Mechanical Keyboard",
        "RGB mechanical gaming keyboard",
        129.99,
        "/image/teclado.png",
        "Electronics"
      );

      insert.run(
        "Wireless Mouse",
        "Ergonomic wireless mouse with precision tracking",
        39.99,
        "/image/mouse.png",
        "Electronics"
      );

      insert.run(
        "USB-C Hub",
        "Multi-port USB-C hub with 4K HDMI support",
        59.99,
        "/image/usb.png",
        "Accessories"
      );

      insert.finalize((finalizeErr) => {
        if (finalizeErr) {
          console.error("Error finalizing insert:", finalizeErr.message);
        } else {
          console.log("Seed products inserted.");
        }
      });
    }
  });
});

module.exports = db;
