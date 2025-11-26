# CA2 – Fynko E-Commerce Full Stack

## 1. Project Overview
Fynko is a full-stack e-commerce demo focused on curated tech accessories.  
The goal is to show CRUD operations, dynamic content and a responsive UI.

## 2. Tech Stack Justification
**Node.js + Express** were chosen to provide a lightweight HTTP server and REST API, ideal for rapid prototyping and academic full-stack demos. Express enables routing, middleware, and static file hosting with minimal boilerplate. 

**SQLite** was selected as an embedded relational database. It requires no separate server, is simple to ship with the project, and supports SQL queries and persistence suitable for small/medium academic systems.

**HTML/CSS/Vanilla JS** were used for the front-end to demonstrate DOM manipulation, API integration, and UI control without frameworks, matching the CA2 requirement.

## 3. Architecture
The system follows a simple MVC-style separation:
- **db.js**: database schema + seed
- **server.js**: API routes and static hosting
- **public/**: UI pages, styles, and client logic (app.js)

Client pages fetch products and cart via `/api/*` endpoints.

## 4. Dynamic Content
Products are loaded dynamically from SQLite using fetch.  
Market-rate price updates are simulated on the client via a random multiplier.

## 5. Conclusion
The project demonstrates a functional full-stack store with dynamic UI, database persistence, and a polished user journey.

## References
Express.js (2025) *Express Documentation*. Available at: https://expressjs.com/ (Accessed: Nov 2025).

SQLite.org (2025) *About SQLite*. Available at: https://sqlite.org/about.html (Accessed: Nov 2025).

GitHub (2025) *Adding locally hosted code to GitHub*. Available at: (https://github.com/MicheleRegis/CA2Ecommerce.app.git) (Accessed: Nov 2025). 

