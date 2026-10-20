
Live :   https://e-com-store-v3du.vercel.app/

# VERVE ATELIER — Full-Stack E-Commerce Platform
> A production-style e-commerce product management application featuring an editorial customer-facing storefront and a secure administrative dashboard. Built with React.js, Vite, Node.js, Express.js, and MongoDB (Mongoose).

---

## 1. Project Architecture & Overview

VERVE ATELIER is designed with clean architectural boundaries between the React frontend client and Express REST API backend:

```
e-com/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Shared, Storefront & Admin Components
│   │   │   ├── admin/          # AdminHeader, AdminSidebar, ProductModal, CategoryModal
│   │   │   ├── common/         # Navbar, Footer, Badge, Modal, ConfirmDialog, Pagination
│   │   │   └── storefront/     # ProductCard, CartDrawer
│   │   ├── context/            # AuthContext, CartContext (with localStorage persistence)
│   │   ├── hooks/              # useDebounce and custom React hooks
│   │   ├── layouts/            # StorefrontLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Products Table, Categories Table, Login
│   │   │   └── storefront/     # HomePage, ProductsPage, ProductDetailPage, CartPage
│   │   ├── routes/             # AppRoutes, ProtectedRoute
│   │   ├── services/           # Central Axios client and domain API services
│   │   ├── styles/             # index.css (custom bespoke editorial design system)
│   │   ├── utils/              # formatters (currency, dates, discount percentages)
│   │   ├── App.jsx             # Root App provider tree
│   │   └── main.jsx            # React 19 entry point
│   ├── index.html              # HTML shell with Google Fonts & responsive viewport
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── server/                     # Backend REST API (Node.js + Express + Mongoose)
│   ├── config/                 # MongoDB connection manager (Atlas & in-memory dev fallback)
│   ├── controllers/            # Business logic (products, categories, auth, dashboard)
│   ├── middleware/             # JWT authentication, role authorization, validation, error handler
│   ├── models/                 # Mongoose schemas (Product, Category, User)
│   ├── routes/                 # REST route definitions
│   ├── scripts/                # Database seed script (realistic categories and products)
│   ├── tests/                  # Automated integration tests (node:test + supertest)
│   ├── utils/                  # slugify and helper utilities
│   ├── app.js                  # Express application setup, security headers, CORS
│   ├── server.js               # HTTP server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── package.json                # Root orchestration scripts
├── .gitignore
└── README.md
```

---

## 2. Key Features

### Customer-Facing Storefront
- **Refined Editorial Aesthetics:** Scandinavian minimalist identity tailored for architectural furnishings, lighting, and ceramics.
- **Dynamic Homepage:** Hero section with responsive photography, popular category cards, featured curator objects, and studio philosophy.
- **Catalog Browsing & Search:** Server-side search by name, brand, SKU, and description with frontend debouncing.
- **Combined Filtering:** Multi-parameter query combinations supported simultaneously:
  - Text search: `?search=chair`
  - Category filter: `?category=furniture-living`
  - Price range: `?minPrice=100&maxPrice=800`
  - Stock status: `?stockStatus=in_stock` / `?stockStatus=low_stock`
  - Sorting: `?sort=price_asc`, `price_desc`, `newest`, `oldest`, `name_asc`
  - Pagination: `?page=1&limit=12`
- **Product Details Page:** Multi-image gallery, breadcrumbs, specifications, stock availability, stock-aware quantity selector, and category-related products.
- **Shopping Cart:** Persistent cart state stored in `localStorage`, stock-aware quantity limits, slide-over bag drawer, full bag review page, and subtotal/tax/shipping calculations.

### Secure Admin Dashboard
- **Protected Routing:** Enforces `role === 'admin'` on every privileged route and API endpoint.
- **Real Database Analytics:** Live aggregation calculations for:
  - Total products, active products, and draft products
  - Low stock alerts (inventory threshold $\le 5$)
  - Out of stock alerts (inventory $= 0$)
  - Total categories and category distribution breakdown
  - Total inventory valuation ($ \sum \text{price} \times \text{stock} $)
  - Recently cataloged products
- **Product CRUD:**
  - **Create:** Modal form with name, SKU, price, original price, stock, category selection, and image URL preview.
  - **Read:** Responsive data table with badges, stock indicators, and sorting.
  - **Update:** Pre-filled edit form with instant database updates.
  - **Delete:** Two-step confirmation dialog with permanent MongoDB removal.
- **Category Management & Safe Deletion:**
  - Create and edit categories with slug auto-generation.
  - **Safe Deletion Protection:** The server detects whether products are currently assigned to a category. If products exist, the deletion is aborted with a clear diagnostic message requiring reassignment first.

---

## 3. Technology Stack

- **Frontend:** React 19, Vite 8, React Router DOM 7, Axios, Lucide React Icons, Custom Bespoke CSS Design System.
- **Backend:** Node.js, Express.js, MongoDB / Mongoose 8, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `express-validator`, `helmet`, `cors`, `cookie-parser`, `morgan`.
- **Database:** MongoDB (Supports MongoDB Atlas, local MongoDB daemons, and automatic in-memory MongoDB for instant zero-config development).
- **Testing:** Native Node test runner (`node:test`, `node:assert`) with `supertest`.

---

## 4. Environment Variables

### Backend Configuration (`server/.env`)
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String:
# Leave blank to automatically spin up a development in-memory MongoDB database,
# or paste your MongoDB Atlas URI:
# e.g., mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority
MONGODB_URI=

# Authentication Secret
JWT_SECRET=super_secret_jwt_development_key_9384729183748291
JWT_EXPIRES_IN=7d

# Frontend CORS Origin
CLIENT_URL=http://localhost:5173

# Low Stock Alert Threshold
LOW_STOCK_THRESHOLD=5
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

### Installation

Clone the repository and install dependencies in both the client and server:

```bash
# In project root:
npm run install:all
```

Alternatively:
```bash
cd server && npm install
cd ../client && npm install
```

### Database Seeding
To populate the database with categories, ~20 realistic sample products, and default user accounts:

```bash
cd server
npm run seed
```

#### Pre-Configured Seed Accounts:
| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@verveatelier.com` | `Admin@123456` |
| **Customer** | `customer@verveatelier.com` | `Customer@123456` |

*(Note: The Admin Login page also includes a "Fill Demo Admin Credentials" quick button for 1-click convenience)*

---

## 6. Running the Application

Open two terminal windows:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
*The Express API will start on `http://localhost:5000`.*
*(If `MONGODB_URI` is empty, it will automatically spin up an in-memory MongoDB instance and auto-seed if the catalog is empty).*

### Terminal 2: Frontend Client
```bash
cd client
npm run dev
```
*Vite will launch the React application at `http://localhost:5173`.*

---

## 7. REST API Endpoints

### Authentication
- `POST /api/auth/register` — Public user registration (creates customer account)
- `POST /api/auth/login` — Authenticate and receive JWT cookie + bearer token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/logout` — Invalidate session and clear auth cookie

### Products
- `GET /api/products` — Retrieve paginated products with combined search, category, price, stock, and sort filters
- `GET /api/products/:id` — Retrieve single product by ID or slug with category-related products
- `POST /api/products` — Create new product *(Admin only)*
- `PUT /api/products/:id` — Update existing product *(Admin only)*
- `DELETE /api/products/:id` — Permanently delete product *(Admin only)*

### Categories
- `GET /api/categories` — List all categories with associated product count
- `GET /api/categories/:id` — Retrieve single category details
- `POST /api/categories` — Create category *(Admin only)*
- `PUT /api/categories/:id` — Update category *(Admin only)*
- `DELETE /api/categories/:id` — Delete category safely; blocked if active products exist *(Admin only)*

### Dashboard Analytics
- `GET /api/dashboard/stats` — Aggregate metrics: total products, low stock, out of stock, valuation, category breakdown *(Admin only)*

### System Health
- `GET /api/health` — System status and server uptime

---

## 8. Automated Testing

The backend includes an end-to-end integration test suite using `node:test` and `supertest`:

```bash
cd server
npm test
```

### Verified Test Coverage (20 Suites & Checks):
- API health check
- Authentication & JWT token validation
- Role authorization (rejection of non-admin privileges)
- Product listing with pagination
- Search filtering by name and SKU
- Category slug filtering
- Price range boundaries ($gte, $lte)
- Stock status filtering (in stock, low stock)
- Price ascending / descending sort verification
- Single product retrieval & related products population
- Non-existent resource 404 handling
- Product creation, validation, and duplicate SKU rejection
- Product updating and deletion
- Category listing with live product counts
- **Safe category deletion protection** (preventing deletion of categories with assigned products)
- Creation and safe deletion of unused categories
- Live MongoDB dashboard aggregation statistics
