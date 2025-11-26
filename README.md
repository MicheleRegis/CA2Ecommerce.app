
<h1 align="center">🛒 Fynko – Dynamic E-Commerce Web Application</h1>

<p align="center">
  <strong>Full-Stack Web Application • Responsive • Database-Driven • Market-Rate Engine</strong>
</p>

<p align="center">
  Desenvolvido por <strong>Michele Gonçalo Regis</strong><br/>
  CCT College Dublin • Web Development CA2 • 2025
</p>

---

# 📌 About the Project

**Fynko** is a fully functional, full-stack e-commerce platform developed as part of the CA2 assessment for the Web Development module at CCT College Dublin.

It is built from scratch using:

- **HTML5** — semantic and accessible structure  
- **CSS3** — modern, responsive UI  
- **JavaScript** — interactive, dynamic front-end  
- **Node.js + Express** — REST API server  
- **SQLite3** — lightweight relational database  
- **Market Rate Engine** — dynamic price updates between -3% and +3%  

The main goal was to design and implement a **professional-grade** e-commerce system meeting both technical requirements and UX/UI principles.

---

# 🚀 Features

## 🛍 Product & Shopping Experience  
- Browse full product catalogue  
- Product detail pages  
- Live search (client-side filtering)  
- Category filters  
- Add to Cart / Remove / Update quantity  
- Wishlist (LocalStorage)
- Persistent cart stored server-side  

## 📈 Dynamic Pricing (Market Rate Engine)
- Live "Market Rate Today" banner  
- REST API generates random variation between **-3% and +3%**  
- Prices update *inside the database*, not only on the front-end  
- “Apply Today’s Rate” button updates all prices dynamically  
- Fully realistic behaviour used in modern e-commerce systems  

## 💾 Back-End Architecture  
- Express REST API  
- SQLite relational database  
- Full CRUD operations  
- Input validation & error handling  
- Structured endpoints for scalability  

## 📱 Responsive UI  
- Mobile-first design  
- CSS Grid & Flexbox  
- Fluid layout  
- Components optimized for desktop, tablet, and mobile  

## 🔒 Accessibility  
- Semantic HTML  
- ARIA labels  
- Alt text for images  
- High-contrast colour palette  
- Keyboard navigation support  

---

# 🧱 Technology Stack
# Fynko E-Commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-%5E4.18.0-blue)](https://expressjs.com/)

A full-stack e-commerce web application featuring dynamic pricing, cart management, and a responsive user interface. Developed as part of the Web Development module at CCT College Dublin.

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Market Rate Engine](#market-rate-engine)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## ✨ Features

- **Product Catalog**: Browse and search through a comprehensive product inventory
- **Dynamic Pricing**: Market Rate Engine simulates real-world price fluctuations (±3%)
- **Shopping Cart**: Persistent cart functionality with add, update, and remove operations
- **Wishlist**: Client-side wishlist management using LocalStorage
- **Responsive Design**: Mobile-first approach ensuring optimal experience across all devices
- **Category Filtering**: Intuitive product filtering by categories
- **Live Search**: Real-time product search functionality
- **Accessibility**: WCAG-compliant design with semantic HTML and ARIA labels

## 🏗️ System Architecture

Fynko follows a three-tier client-server architecture:

### Client Layer (Presentation)
- **HTML5**: Semantic structure
- **CSS3**: Responsive styling with Grid and Flexbox
- **JavaScript**: Dynamic interactions and API communication

### Application Layer (Server)
- **Node.js**: Runtime environment
- **Express.js**: RESTful API framework
- Centralized business logic
- Request/response handling

### Data Layer (Persistence)
- **SQLite3**: Lightweight relational database
- Product catalog storage
- Cart state management
- Price history tracking

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (Grid, Flexbox)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- SQLite3

### Development Tools
- Chrome DevTools (testing)
- Postman (API testing)
- Git/GitHub (version control)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Git

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/MicheleRegis/CA2Ecommerce.app.git
cd CA2Ecommerce.app
```

2. **Install dependencies**
```bash
npm install
```

3. **Initialize the database**
```bash
npm run init-db
```

4. **Start the development server**
```bash
npm start
```

5. **Access the application**
Open your browser and navigate to:
```
http://localhost:3000
```

## 💻 Usage

### Starting the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### Basic Operations

1. **Browse Products**: Navigate through the product catalog on the homepage
2. **Search**: Use the search bar to find specific products
3. **Filter**: Select categories to narrow down product listings
4. **Add to Cart**: Click "Add to Cart" on any product
5. **Manage Cart**: View cart, update quantities, or remove items
6. **Wishlist**: Save favorite products for later (stored locally)
7. **Apply Market Rate**: Click "Apply Today's Rate" to see dynamic pricing

## 🔌 API Endpoints

### Products
```http
GET /api/products
```
Returns the complete product catalog

```http
GET /api/products/:id
```
Returns details of a specific product

### Shopping Cart
```http
POST /api/cart/add
```
Adds an item to the shopping cart

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

```http
PATCH /api/cart/update
```
Updates product quantities in the cart

**Request Body:**
```json
{
  "cartItemId": 1,
  "quantity": 3
}
```

```http
DELETE /api/cart/remove/:id
```
Removes an item from the cart

### Market Rate Engine
```http
POST /api/market/apply-rate
```
Applies daily market fluctuation to all products (±3%)

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  imageUrl TEXT,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  rating REAL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Cart Table
```sql
CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  subtotal REAL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

## 📈 Market Rate Engine

The Market Rate Engine simulates real-world market dynamics by:

1. Generating a random fluctuation between -3% and +3%
2. Applying this rate to all products in the database
3. Updating prices persistently
4. Synchronizing changes across all user sessions

**Example:**
```javascript
// Original price: €100.00
// Applied rate: +2.5%
// New price: €102.50
```

## 🧪 Testing

### API Testing
Test endpoints using Postman or curl:
```bash
curl http://localhost:3000/api/products
```

### UI Testing
Manual testing covers:
- Product search and filtering
- Cart operations (add, update, remove)
- Wishlist persistence
- Edge cases (duplicate items, empty cart)

### Responsiveness Testing
Tested breakpoints:
- Mobile: 320px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px+

### Input Validation
Server-side validation ensures:
- Valid product IDs
- Proper quantity formats
- Error handling for malformed requests

## 🔮 Future Enhancements

- **User Authentication**: Implement secure login/registration system
- **Payment Gateway**: Integrate Stripe or PayPal
- **Admin Dashboard**: Inventory management and analytics
- **Order History**: Track past purchases
- **Product Reviews**: User-generated ratings and reviews
- **Email Notifications**: Order confirmations and updates
- **Advanced Search**: Filters by price range, ratings, availability
- **Multi-language Support**: Internationalization (i18n)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project was created for academic purposes as part of the **H.Dip. in Computing, CCT College Dublin**.

## 👨‍💻 Author

**Michele Gonçalo Regis**

- GitHub: [@MicheleRegis](https://github.com/MicheleRegis)
- Project: https://github.com/MicheleRegis/CA2Ecommerce.app.git

---

⭐ **If this project helped you understand algorithms and data structures, consider giving it a star!** ⭐

Made with ☕ and 💻 by Michele Goncalo Régis




