# Finance Dashboard

A full-stack finance management application built with Node.js, Express, MongoDB, and React. It allows users to track income and expenses, view analytics, manage financial records, and control user access through a role-based permission system.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [CSV Import Format](#csv-import-format)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)

---

## Overview

Finance Dashboard is a web application that provides a centralized interface for managing personal or organizational finances. Users can log income and expenses under predefined categories, view monthly and weekly trends on charts, analyze spending by category, and export or import records via CSV files.

The system supports three user roles with different levels of access. Administrators have full control over records and user management. Analysts can view records and access analytics. Viewers have read-only access to records and the dashboard summary.

---

## Tech Stack

**Backend**

- Node.js with Express 5
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- Joi for request validation
- dotenv for environment configuration
- nodemon for development auto-reload

**Frontend**

- React 19 with Vite
- React Router v7 for client-side routing
- Axios for API communication
- Recharts for data visualization
- React Hook Form with Yup for form validation
- React Hot Toast for notifications
- Lucide React for icons
- CSS custom properties for theming

**Development**

- concurrently for running backend and frontend with a single command

---

## Project Structure

```
zorvyn assignment/
├── package.json                  # Root package with unified dev script
├── sample_import.csv             # Sample CSV for testing import feature
├── finance-backend/
│   ├── server.js                 # Entry point
│   ├── .env                      # Environment variables (not committed)
│   ├── .env.example              # Example environment file
│   └── src/
│       ├── app.js                # Express app setup and middleware
│       ├── config/
│       │   └── db.js             # MongoDB connection
│       ├── controllers/          # Request handlers
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   ├── recordController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── auth.js           # JWT verification
│       │   ├── errorHandler.js   # Global error handler
│       │   ├── roleGuard.js      # Role-based access control
│       │   └── validate.js       # Joi validation middleware
│       ├── models/
│       │   ├── FinancialRecord.js
│       │   └── User.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── recordRoutes.js
│       │   └── userRoutes.js
│       ├── services/             # Business logic
│       │   ├── authService.js
│       │   ├── dashboardService.js
│       │   ├── recordService.js
│       │   └── userService.js
│       ├── utils/
│       │   └── ApiError.js       # Custom error class
│       └── validators/
│           ├── authValidator.js
│           ├── recordValidator.js
│           └── userValidator.js
└── finance-frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx               # Router and route definitions
        ├── main.jsx              # React entry point
        ├── index.css             # Global styles and design tokens
        ├── components/
        │   ├── common/
        │   │   └── ProtectedRoute.jsx
        │   ├── layout/
        │   │   ├── DashboardLayout.jsx
        │   │   ├── Navbar.jsx
        │   │   └── Sidebar.jsx
        │   └── ui/
        │       ├── Cards.jsx
        │       ├── EmptyState.jsx
        │       ├── Modal.jsx
        │       ├── Pagination.jsx
        │       └── Skeleton.jsx
        ├── context/
        │   ├── AuthContext.jsx   # Auth state and session management
        │   └── ThemeContext.jsx
        ├── hooks/
        │   └── useDebounce.js
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Analytics.jsx
        │   ├── Records.jsx
        │   ├── Users.jsx
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── services/             # Axios API wrappers
        │   ├── api.js
        │   ├── authService.js
        │   ├── dashboardService.js
        │   ├── recordService.js
        │   └── userService.js
        └── utils/
            ├── exportCSV.js
            ├── importCSV.js      # CSV parser with row-level validation
            └── formatters.js
```

---

## Features

**Authentication**
- User registration and login with JWT-based sessions
- Passwords hashed with bcrypt (12 salt rounds)
- Session persisted via localStorage and restored on page load
- Protected routes redirect unauthenticated users to login

**Dashboard**
- Summary cards showing total income, total expenses, and net balance
- Monthly trends line chart (income vs expenses over time)
- Category breakdown pie chart with legend

**Analytics**
- Toggle between monthly and weekly views
- Area chart for income vs expenses
- Horizontal bar chart for spend by category
- Net balance over time line chart

**Financial Records**
- Paginated table of all records with sorting by date
- Filter by type (income/expense), category, date range, and keyword search
- Add, edit, and soft-delete records (Admin only)
- Export current records to CSV
- Import records from CSV with client-side validation, row preview, and progress tracking

**User Management (Admin only)**
- List all users with pagination
- Update a user's role or deactivate their account
- Delete users permanently

---

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js v18 or higher
- npm v9 or higher
- MongoDB (running locally on port 27017, or a MongoDB Atlas connection string)
- Git

To verify:

```bash
node --version
npm --version
mongod --version
```

On Windows, ensure the MongoDB service is running:

```powershell
Start-Service -Name MongoDB
```

---

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/SinghAnsh07/FinanceAI.git
cd FinanceAI
```

**2. Install root dependencies**

```bash
npm install
```

**3. Install backend dependencies**

```bash
cd finance-backend
npm install
cd ..
```

**4. Install frontend dependencies**

```bash
cd finance-frontend
npm install
cd ..
```

---

## Environment Variables

**Backend — create `finance-backend/.env`**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Use `finance-backend/.env.example` as a reference.

**Frontend — create `finance-frontend/.env`**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Running the Application

From the project root, run both backend and frontend with a single command:

```bash
npm run dev
```

This uses `concurrently` to start:
- Backend: `nodemon server.js` on port 5000
- Frontend: Vite dev server on port 5173

Open [http://localhost:5173](http://localhost:5173) in your browser.

**First-time setup:** Register an account. The first user to register is automatically assigned the Admin role. All subsequent registrations default to the Viewer role. Admins can upgrade other users to Analyst or Admin through the Users page.

---

## API Reference

All API routes are prefixed with `/api`.

**Authentication**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/register | Public | Create a new user account |
| POST | /auth/login | Public | Login and receive a JWT token |
| GET | /auth/me | Authenticated | Get the current user's profile |

**Financial Records**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /records | Authenticated | List records with optional filters |
| GET | /records/:id | Authenticated | Get a single record by ID |
| POST | /records | Admin | Create a new record |
| PUT | /records/:id | Admin | Update a record |
| DELETE | /records/:id | Admin | Soft-delete a record |

Query parameters for GET /records: `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `search`

**Dashboard**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /dashboard/summary | Authenticated | Total income, expenses, net balance |
| GET | /dashboard/recent | Authenticated | Most recent records |
| GET | /dashboard/trends | Analyst, Admin | Monthly or weekly trends |
| GET | /dashboard/category-summary | Analyst, Admin | Totals grouped by category |

**Users**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /users | Admin | List all users |
| GET | /users/:id | Admin | Get a user by ID |
| PUT | /users/:id | Admin | Update role or status |
| DELETE | /users/:id | Admin | Permanently delete a user |

**Health Check**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /health | Public | Verify the API is running |

All protected endpoints require the `Authorization: Bearer <token>` header.

---

## Role-Based Access Control

The system has three roles with different permissions:

| Permission | Viewer | Analyst | Admin |
|------------|--------|---------|-------|
| View records and dashboard | Yes | Yes | Yes |
| View analytics and trends | No | Yes | Yes |
| Create, update, delete records | No | No | Yes |
| Manage users | No | No | Yes |

The first registered user is assigned the Admin role automatically. Admins can change any user's role from the Users page. An Admin cannot change their own role or delete their own account.

---

## CSV Import Format

Records can be bulk-imported from a CSV file via the Import CSV button on the Records page (Admin only).

**Required columns:**

| Column | Type | Description |
|--------|------|-------------|
| title | string | Short description of the record |
| amount | number | Positive decimal value |
| type | string | Must be `income` or `expense` (lowercase) |
| category | string | Must be one of the valid categories listed below |
| date | string | Date in YYYY-MM-DD format |
| notes | string | Optional note or description |

**Valid categories:** Salary, Freelance, Investment, Food, Transport, Housing, Entertainment, Health, Education, Shopping, Other

**Example:**

```csv
title,amount,type,category,date,notes
Monthly Salary,5000,income,Salary,2024-04-01,April salary
Monthly Rent,1200,expense,Housing,2024-04-02,April rent
Grocery Shopping,145.50,expense,Food,2024-04-04,Weekly groceries
```

The import modal validates each row in the browser before uploading. Rows with errors are listed and skipped. Valid rows are imported individually with a progress bar. A template CSV can be downloaded directly from the import modal.

---

## Authentication Flow

1. User submits registration or login form
2. Backend validates the request with Joi
3. On registration, the password is hashed with bcrypt before saving
4. A JWT is generated and returned in the response
5. The frontend stores the token in localStorage
6. All API requests attach the token in the `Authorization: Bearer` header via an Axios interceptor
7. On page load, the frontend calls `GET /auth/me` to restore the user session
8. If the token is expired or invalid, the user is redirected to the login page

---

## Database Schema

**User**

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| email | String | Required, unique |
| password | String | Hashed with bcrypt |
| role | String | Viewer / Analyst / Admin |
| isActive | Boolean | Defaults to true |
| createdAt | Date | Auto-managed by Mongoose |

**FinancialRecord**

| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| userId | ObjectId | Reference to User |
| amount | Number | Required, must be positive |
| type | String | income or expense |
| category | String | Required |
| date | Date | Required |
| notes | String | Optional |
| isDeleted | Boolean | Soft delete flag, defaults to false |
| createdAt | Date | Auto-managed by Mongoose |
