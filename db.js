const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./ecommerce.db");

// cria tabelas
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
    if (row.count === 0) {
      const insert = db.prepare(
        "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)"
      );

      insert.run(
        "Wireless Headphones",
        "Premium wireless headphones with noise cancellation",
        79.99,
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
        "Electronics"
      );
      insert.run(
        "Smart Watch",
        "Fitness tracking smart watch with heart rate monitor",
        199.99,
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
        "Electronics"
      );
      insert.run(
        "Laptop Stand",
        "Ergonomic aluminum laptop stand",
        45.99,
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop",
        "Accessories"
      );
      insert.run(
        "Mechanical Keyboard",
        "RGB mechanical gaming keyboard",
        129.99,
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop",
        "Electronics"
      );
      insert.run(
        "Wireless Mouse",
        "Ergonomic wireless mouse with precision tracking",
        39.99,
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
        "Electronics"
      );
      insert.run(
        "USB-C Hub",
        "Multi-port USB-C hub with 4K HDMI support",
        59.99,
        "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=400&fit=crop",
        "Accessories"
      );

      insert.finalize();
      console.log("Seed products inserted.");
    }
  });
});

module.exports = db;
