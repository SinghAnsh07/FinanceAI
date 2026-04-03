# Finance Dashboard Backend API

A production-quality RESTful backend for a Finance Dashboard built with **Node.js + Express + MongoDB + JWT**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### Installation

```bash
# 1. Navigate to project folder
cd finance-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# 4. Start the server (development)
npm run dev

# OR production
npm start
```

Server runs at: `http://localhost:5000`

---

## 🏗️ Folder Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Auth request handlers
│   │   ├── userController.js      # User management handlers
│   │   ├── recordController.js    # Financial record handlers
│   │   └── dashboardController.js # Analytics handlers
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   ├── roleGuard.js           # Role-based access control
│   │   ├── validate.js            # Joi validation
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── FinancialRecord.js     # Financial record schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── authService.js         # Auth business logic
│   │   ├── userService.js         # User business logic
│   │   ├── recordService.js       # Record business logic
│   │   └── dashboardService.js    # Analytics aggregations
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   └── recordValidator.js
│   ├── utils/
│   │   └── ApiError.js            # Custom error class
│   └── app.js                     # Express app setup
├── server.js                      # Entry point
├── .env                           # Environment variables (git-ignored)
├── .env.example                   # Template
└── package.json
```

---

## 📡 API Endpoints

### Health Check
```
GET  /api/health
```

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, receive JWT | Public |
| GET | `/api/auth/me` | Get current user | Required |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (`?page=1&limit=10`) |
| GET | `/api/users/:id` | Get single user |
| PUT | `/api/users/:id` | Update role/status |
| DELETE | `/api/users/:id` | Delete user |

### Financial Records
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/records` | All roles | List records (`?type=Income&category=Food&startDate=&endDate=&page=1`) |
| GET | `/api/records/:id` | All roles | Get single record |
| POST | `/api/records` | Admin | Create record |
| PUT | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft delete record |

### Dashboard Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/summary` | All roles | Total income, expenses, net balance |
| GET | `/api/dashboard/recent` | All roles | Recent records (`?limit=10`) |
| GET | `/api/dashboard/category-summary` | Analyst, Admin | Category-wise totals |
| GET | `/api/dashboard/trends` | Analyst, Admin | Monthly/weekly trends (`?period=monthly\|weekly`) |

---

## 🔐 Roles & Permissions

| Permission | Viewer | Analyst | Admin |
|-----------|--------|---------|-------|
| View dashboard summary | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| View analytics/trends | ❌ | ✅ | ✅ |
| Create/Update/Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 🔑 Authentication

All protected endpoints require a JWT token in the header:

```
Authorization: Bearer <your_token>
```

> **Note:** The first registered user is automatically assigned the **Admin** role. Subsequent users default to **Viewer**.

---

## 📦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/finance_dashboard` |
| `JWT_SECRET` | Secret key for JWT signing | *change this!* |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `NODE_ENV` | Environment | `development` |

---

## 📝 Assumptions

1. Roles are predefined (Viewer, Analyst, Admin) — no dynamic role creation
2. First registered user automatically becomes **Admin**
3. All authenticated users can **view** financial records; only Admins can **write**
4. Financial records use **soft delete** (`isDeleted: true`) for data integrity
5. Pagination defaults: 10 records per page
6. Passwords are hashed with bcrypt (cost factor: 12)
