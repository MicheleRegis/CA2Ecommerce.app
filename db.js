const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./ecommerce.db");

db.serialize(() => {
  // Enforce foreign keys
  db.run(`PRAGMA foreign_keys = ON`);

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
      productId INTEGER NOT NULL,
      qty INTEGER NOT NULL CHECK(qty >= 0),
      FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

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
        "Gaming Desk Setup",
        "Minimalist desk organizer for clean setups",
        99.99,
        "/image/desktop1.png",
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

      insert.run(
        "Laptop Stand",
        "Ergonomic aluminum laptop stand",
        45.99,
        "/image/stand.png",
        "Accessories"
      );

      insert.run(
        "Pro Cable Kit",
        "Premium braided USB-C + HDMI set",
        24.99,
        "/image/hdmi.png",
        "Accessories"
      );

      insert.run(
        "Studio Headphone Stand",
        "Compact headphone holder for your desk",
        19.99,
        "/image/standheadphone.png",
        "Accessories"
      );

      insert.run(
        "iPhone Charger Cable",
        "Fast charging Lightning cable for iPhone, durable braided design",
        19.99,
        "/image/cabocarregador.png",
        "Accessories"
      );

      insert.run(
        "Wired Earphones",
        "High-quality wired earphones with deep bass and noise isolation",
        24.99,
        "/image/fonedefio.png",
        "Electronics"
      );

      insert.run(
        "Phone Case",
        "Shockproof slim phone case with premium matte finish",
        14.99,
        "/image/capadecelular.png",
        "Accessories"
      );

      insert.finalize();
      console.log("Seed products inserted.");
    }
  });
});

module.exports = db;
