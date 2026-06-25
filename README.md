# 🚀 ResellHub Server

The robust backend API powering the **ResellHub Marketplace**. Built with Express.js, MongoDB, Better Auth, JWT, and Stripe, this server manages multi-role authentication, secure payment processing, real-time analytics, and a product approval pipeline.

---

## ✨ Features

* **Secure Authentication:** Dual-layered protection via JWT and Better Auth.
* **Role-Based Access Control (RBAC):** Distinct permissions and routes for **Buyers**, **Sellers**, and **Admins**.
* **Product Pipeline:** Product submission, status tracking (`pending`), and an **Admin Approval System**.
* **Wishlist & Order Management:** Full CRUD operations for tracking desired items and managing active customer orders.
* **Stripe Integration:** Secure e-commerce checkout and payment processing pipeline.
* **Data Analytics:** Dedicated analytical endpoints tailored for both Sellers (sales insights) and Admins (platform growth metrics).
* **Database Security:** Structured data models hosted on MongoDB with safe environment routing.

---

## 🛠️ Technologies Used

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **Authentication:** Better Auth & JSON Web Tokens (JWT)
* **Payments:** Stripe API
* **Utilities:** CORS, Dotenv, Nodemon (Development)

---

## 📁 Project Structure

```text
resellhub-server/
│
├── middleware/
│   ├── verifyToken.js
│   └── verifyAdmin.js
│
├── .env.example
├── server.js
├── package.json
└── README.md