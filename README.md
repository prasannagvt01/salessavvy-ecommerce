# SalesSavvy - Full Stack Java E-Commerce Web Application

A production-grade, enterprise-style full-stack e-commerce web platform built with **Spring Boot 3**, **Java 21**, **Spring Security (JWT)**, **Hibernate ORM / Spring Data JPA**, **MySQL 8.0**, **React.js**, **Tailwind CSS**, and **Razorpay Payment Gateway**.

---

## 🌟 Architecture & Tech Stack

### Backend
- **Language & Runtime:** Java 21 (LTS)
- **Framework:** Spring Boot 3.2.0
- **Security:** Spring Security 6 with stateless JWT authentication & BCrypt hashing
- **Persistence:** Spring Data JPA with Hibernate ORM
- **Database:** MySQL 8.0
- **Payment Processing:** Razorpay SDK (Orders & Webhook/Signature Verification)
- **Mailing:** Spring Boot Starter Mail with SMTP
- **Build & Dependency Tool:** Apache Maven (via Maven Wrapper `mvnw`)
- **Testing:** JUnit 5 & Mockito

### Frontend
- **Library:** React 18 (Vite)
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons, Heroicons
- **Routing:** React Router DOM v6
- **State Management:** Zustand
- **Networking:** Axios with JWT request interceptors
- **Notifications:** React Hot Toast
- **Analytics & Charts:** Recharts

---

## 📁 Project Structure

```
Project/
├── backend/                             # Spring Boot Maven Project
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/                      # Security, Razorpay, Mail, JPA, Seeder configs
│   │   ├── controller/                  # REST APIs (Auth, Product, Category, Cart, Order, Payment, Admin)
│   │   ├── dto/                         # Request and Response transfer objects
│   │   ├── exception/                   # Global exception handling (@ControllerAdvice)
│   │   ├── model/                       # JPA Entities (User, Product, Category, Cart, Order, Payment, etc.)
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   ├── security/                    # JWT Provider, Custom UserDetailsService, Auth Filter
│   │   ├── service/                     # Business logic and services
│   │   └── EcommerceApplication.java    # Main Entry Point
│   ├── src/main/resources/
│   │   └── application.yml              # Database, JWT, Razorpay, CORS configuration
│   ├── pom.xml                          # Maven dependencies
│   ├── .env                             # Environment variables
│   ├── mvnw & mvnw.cmd                  # Maven wrappers
├── frontend/                            # React 18 + Vite Application
│   ├── src/
│   │   ├── components/                  # Navbar, Footer, ProductCard, Modals, ProtectedRoute
│   │   ├── pages/                       # Home, Products, ProductDetails, Cart, Checkout, Wishlist, Orders
│   │   ├── pages/admin/                 # Admin Dashboard, Products, Orders, Categories, Analytics
│   │   ├── services/                    # Axios API integration
│   │   ├── store/                       # Zustand authentication & cart global state
│   │   └── App.jsx & main.jsx           # App setup and route definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
└── sales_savvy_postman_collection.json  # Postman collection for API testing
```

---

## 🗄️ Database Setup & Connection

- **RDBMS:** MySQL 8.0 Server
- **Host:** `localhost` / `127.0.0.1`
- **Port:** `3306`
- **Database Name:** `ecommerce`
- **Database User:** `xxxx`
- **Database Password:** `xxxx`
- **Mail Username:** `xxxx@gmail.com`
- **Mail Password:** `xxxx`

The database tables, constraints, foreign keys, and indexes are automatically generated and synchronized via Hibernate (`ddl-auto: update`).

### Seeded Credentials
| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | Full Admin Dashboard & Store Management |
| **Customer** | `user@example.com` | `user123` | Storefront, Wishlist, Cart & Orders |

---

## 🚀 Running the Application Locally

### 1. Spring Boot Backend
From the project root:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
> Server runs at: **`http://localhost:8080`**

### 2. React Frontend
From the project root:
```powershell
cd frontend
npm run dev
```
> UI runs at: **`http://127.0.0.1:5173`**

---

## 💳 Razorpay Payment Integration

1. The frontend initiates checkout and calls `/api/payments/razorpay/order/{orderId}`.
2. The Spring Boot backend creates an authentic Razorpay Order via `RazorpayClient`.
3. The React checkout interface opens the secure Razorpay Checkout modal in test mode (`rzp_test_xxxx`).
4. Upon customer payment, the frontend sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payments/razorpay/verify`.
5. The backend validates the HMAC-SHA256 signature using the secret key before marking order as PAID.

---

## 🧪 Testing

### Backend Unit Tests
Execute JUnit 5 and Mockito test suites:
```powershell
cd backend
.\mvnw.cmd test
```

### Postman API Testing
Import `sales_savvy_postman_collection.json` into Postman to test:
- Registration & Login
- Product Catalog & Category Filtering
- Cart Operations
- Razorpay Payment Verification
- Admin Dashboard Analytics
