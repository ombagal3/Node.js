# Secure Multi-User Management System

Documentation - https://docs.google.com/document/d/1-rAjKLs3fAqhnGxN0VoriuAQHasw_SaF/edit?usp=sharing&ouid=116030435088773590933&rtpof=true&sd=true

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-green.svg)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

An enterprise-grade, secure, multi-user management web application built with **React.js, Node.js, Express.js, and MongoDB**. Features dual role-based panels (Admin Dashboard & User Dashboard), JSON Web Token (JWT) authentication with HttpOnly refresh tokens, Nodemailer Email OTP password resets, strict server-side resource ownership authorization, and server-side search, filtering, and pagination.

---

## 🚀 Key Features

### 1. Robust Authentication & Session Security
- **Dual-Token JWT Security**: Short-lived access tokens (`15m`) and secure `HttpOnly` refresh token cookies (`7d`) with automatic silent renewal interceptors.
- **bcrypt Password Hashing**: Passwords hashed using bcrypt (12 salt rounds); password and OTP hashes are never exposed in API responses or logs.
- **Account Lifecycle Protection**: Immediate rejection of deactivated accounts (`isActive: false`) across active JWT sessions.
- **Self-Registration Constraint**: Public registration exclusively assigns the `user` role to prevent privilege escalation.
- **Rate Limiting & Helmet Headers**: Automated protection against brute-force attacks on auth and OTP endpoints.

### 2. Cryptographic Email OTP Password Reset Flow
- **Nodemailer Integration**: Automated transmission of 6-digit cryptographic verification codes using responsive HTML email templates.
- **Secure Hash Storage**: Only hashed OTPs are persisted in MongoDB with a 5-minute TTL index.
- **Anti-Enumeration Protection**: Identical response envelopes for registered and non-registered emails.
- **Abuse Prevention**: 60-second resend cooldown timer and maximum 5 verification attempt thresholds.

### 3. Administrator Dashboard
- **Telemetry & Live Metrics**: Real-time counters for Total Users, Active Users, Inactive Users, Total Records, and Published Records.
- **User Directory Management**: Complete CRUD operations, role assignment, account activation toggle, search by name/email, date range filtering, and server pagination.
- **Last Active Admin Safeguard**: Server-side safeguards strictly prevent accidental deletion or deactivation of the last active administrator.
- **Global Records Repository**: Admin creation, modification, unpublish/publish toggle, user assignments, and visibility scope controls (`All active users` vs. `Assigned users only`).

### 4. User Workspace & Dashboard
- **Distinct Navigation & Layout**: Tailored user experience with restricted access to administrative functions.
- **Available Corporate Records**: Browse published organizational documentation matching visibility and assignment rules.
- **Personal Records CRUD**: Complete management of private records with strict server-enforced ownership checks (HTTP 403 Forbidden for unauthorized access).
- **Personal Profile Management**: Self-service profile updates and secure password changes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v7, Tailwind CSS, Axios, React Hook Form, React Context API, Lucide React, React Hot Toast |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, Nodemailer, express-validator, Helmet, express-rate-limit, cookie-parser, CORS, Morgan |
| **Testing** | Jest, Supertest, mongodb-memory-server (Zero external dependencies needed for test suite) |

---

## 📂 Project Architecture

```
project-root/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # DataTable, Pagination, SearchBar, FilterPanel, StatCard, etc.
│   │   │   ├── forms/          # UserForm, RecordForm
│   │   │   └── layout/         # Sidebar, Navbar
│   │   ├── layouts/            # AdminLayout.jsx, UserLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, VerifyOtp, ResetPassword
│   │   │   ├── admin/          # Dashboard, Users List, User Create, User Details, Records
│   │   │   └── user/           # Dashboard, Available Records, My Records, Profile
│   │   ├── context/            # AuthContext.jsx
│   │   ├── routes/             # ProtectedRoute, RoleBasedRoute, AppRoutes.jsx
│   │   ├── services/           # api.js, authService, userService, recordService, dashboardService
│   │   └── utils/              # formatters.js
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/             # db.js, mail.js
│   │   ├── controllers/        # auth, user, admin, record, dashboard
│   │   ├── middleware/         # authenticate, authorize, validate, errorHandler, notFound
│   │   ├── models/             # User.js, Record.js, PasswordReset.js
│   │   ├── routes/             # authRoutes, userRoutes, adminRoutes, recordRoutes, dashboardRoutes
│   │   ├── services/           # tokenService, otpService, emailService
│   │   ├── validators/         # authValidator, userValidator, recordValidator
│   │   ├── scripts/            # seedAdmin.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                  # auth.test.js, admin.test.js, records.test.js, otp.test.js
│   └── package.json
│
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/secure_management_system
JWT_ACCESS_SECRET=a_very_secure_jwt_access_secret_key_for_multi_user_app_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=a_very_secure_jwt_refresh_secret_key_for_multi_user_app_2026
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Secure Multi-User System" <no-reply@secureauth.com>
ADMIN_NAME="System Administrator"
ADMIN_EMAIL=admin@securemanagement.com
ADMIN_PASSWORD=Admin@SecurePass2026!
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Quick Start & Installation

### 1. Install All Dependencies
From the root workspace:
```bash
npm run install:all
```
*(Or install individually with `npm install` in root, `cd server && npm install`, and `cd client && npm install`)*

### 2. Seed Database
Seeds an initial Administrator account, a demo standard user, and sample corporate records:
```bash
npm run seed
```

**Default Demo Credentials:**
- **Admin**: `admin@securemanagement.com` / `Admin@SecurePass2026!`
- **User**: `user@example.com` / `User@123456`

### 3. Launch Development Server
Runs backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 🧪 Automated Testing

The backend includes a comprehensive, isolated test suite using **Jest, Supertest, and mongodb-memory-server**:
```bash
npm test
```

### Verified Test Cases:
- ✅ **Authentication**: Registration, duplicate email prevention, password hashing, valid/invalid logins.
- ✅ **JWT & Session**: Expired, missing, and malformed tokens rejected; deactivated user access rejected.
- ✅ **Role-Based Access Control**: Regular user receives HTTP 403 on admin routes.
- ✅ **Admin Safeguards**: Rejection of last active administrator deactivation or deletion.
- ✅ **Ownership Protection**: Prevention of users viewing, updating, or deleting other users' private records.
- ✅ **Visibility Rules**: Users only receive published records matching their visibility scope.
- ✅ **Email OTP & Password Reset**: Anti-enumeration response, OTP attempt counting, 5-minute expiry, and full password reset.

---

## 🔌 API Endpoint Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user (`user` role) | Public |
| `POST` | `/api/auth/login` | Login user & issue JWT | Public |
| `POST` | `/api/auth/logout` | Revoke session & clear cookie | Authenticated |
| `GET` | `/api/auth/me` | Fetch current authenticated user | Authenticated |
| `POST` | `/api/auth/refresh` | Renew access token via refresh token | Public |
| `POST` | `/api/auth/forgot-password` | Request 6-digit email OTP | Public |
| `POST` | `/api/auth/verify-otp` | Verify OTP & receive reset token | Public |
| `POST` | `/api/auth/reset-password` | Reset password using reset token | Public |

### User Profile (`/api/users`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Retrieve profile metadata | Authenticated |
| `PATCH` | `/api/users/me` | Update name or password | Authenticated |

### Admin User Management (`/api/admin/users`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List users with search, filter, sort, & pagination | Admin Only |
| `POST` | `/api/admin/users` | Create user with specified role | Admin Only |
| `GET` | `/api/admin/users/:id` | View user details & stats | Admin Only |
| `PATCH` | `/api/admin/users/:id` | Edit user attributes | Admin Only |
| `PATCH` | `/api/admin/users/:id/status`| Toggle active/inactive status (Safeguarded) | Admin Only |
| `DELETE`| `/api/admin/users/:id` | Delete user & reassign records (Safeguarded) | Admin Only |

### Admin Record Management (`/api/admin/records`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/records` | List all records (search/filter/pagination) | Admin Only |
| `POST` | `/api/admin/records` | Create system record | Admin Only |
| `GET` | `/api/admin/records/:id`| Retrieve single record details | Admin Only |
| `PATCH`| `/api/admin/records/:id`| Update record attributes | Admin Only |
| `DELETE`| `/api/admin/records/:id`| Permanently delete record | Admin Only |

### User Record Management (`/api/records`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/records/available`| Available published corporate records | Authenticated |
| `GET` | `/api/records/my` | View personal records (search/filter/pagination) | Authenticated |
| `POST` | `/api/records/my` | Create personal private record | Authenticated |
| `GET` | `/api/records/my/:id` | Retrieve personal record (Owner only) | Authenticated |
| `PATCH`| `/api/records/my/:id` | Update personal record (Owner only) | Authenticated |
| `DELETE`| `/api/records/my/:id` | Delete personal record (Owner only) | Authenticated |

### Dashboards (`/api/dashboard`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard/stats` | Aggregated platform statistics & recent activity | Admin Only |
| `GET` | `/api/user/dashboard/stats` | User assignment & availability counts | Authenticated |
