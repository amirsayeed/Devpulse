# 🚼 DevPulse

> Internal Tech Issue & Feature Tracker — A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live Demo:** [https://devpulse-sandy.vercel.app](https://devpulse-sandy.vercel.app)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Deployment](#deployment)
- [Testing](#testing)
- [Git Commits](#git-commits)

---

## ✨ Features

### Core Functionality

- **User Registration & Login** — Secure authentication with JWT and bcrypt password hashing
- **Issue Management** — Create, read, update, delete issues with full CRUD operations
- **Issue Filtering & Sorting** — Filter by type (bug/feature_request) and status (open/in_progress/resolved)
- **Role-Based Access Control** — Two roles with distinct permissions:
  - **Contributor**: Create issues, update own open issues, view all issues
  - **Maintainer**: Full access — update any issue, delete issues, change status independently
- **Reporter Tracking** — Each issue tracks who reported it with full reporter details

---

## 🛠️ Tech Stack

| Technology            | Purpose               | Version  |
| --------------------- | --------------------- | -------- |
| **Node.js**           | Runtime               | 24.x LTS |
| **TypeScript**        | Type-safe JavaScript  | Latest   |
| **Express.js**        | Web framework         | Latest   |
| **PostgreSQL**        | Database              | NeonDB   |
| **bcrypt**            | Password hashing      | ^5.0.0   |
| **jsonwebtoken**      | JWT authentication    | ^9.0.0   |
| **pg**                | PostgreSQL driver     | ^8.0.0   |
| **cors**              | Cross-origin requests | Latest   |
| **http-status-codes** | HTTP status constants | Latest   |

---

## 📁 Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   └── database.ts           # PostgreSQL pool & table initialization
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── authController.ts # Signup & login logic
│   │   │   └── authRoutes.ts     # Auth endpoints
│   │   └── issues/
│   │       ├── issuesController.ts # CRUD & filtering logic
│   │       └── issuesRoutes.ts    # Issue endpoints
│   ├── middleware/
│   │   └── authMiddleware.ts      # JWT verification & role checks
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── utils/
│   │   └── responseFormatter.ts   # Response helper functions
│   ├── app.ts                     # Express setup & middleware
│   └── index.ts                   # Server entry point
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── vercel.json                    # Vercel deployment config
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 24.x or higher
- npm or yarn
- NeonDB PostgreSQL account

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Update with your actual values:

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@neon.tech:5432/devpulse
JWT_SECRET=your_generated_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,https://devpulse-sandy.vercel.app
```

### Step 4: Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### Step 5: Test API

```bash
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 🔐 Environment Variables

| Variable       | Description                  | Example                             |
| -------------- | ---------------------------- | ----------------------------------- |
| `PORT`         | Server port                  | `5000`                              |
| `NODE_ENV`     | Environment mode             | `development` or `production`       |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...`                  |
| `JWT_SECRET`   | Secret key for JWT signing   | Long random string (32+ chars)      |
| `JWT_EXPIRE`   | Token expiration time        | `7d`                                |
| `CORS_ORIGIN`  | Allowed frontend origins     | `http://localhost:3000,https://...` |

**Generate secure JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📡 API Endpoints

### Authentication

#### 1. User Registration

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor",
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

#### 2. User Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "contributor",
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T10:30:00Z"
    }
  }
}
```

---

### Issues

#### 3. Get All Issues

```
GET /api/issues?sort=newest&type=bug&status=open
```

**Query Parameters:**

- `sort` — `newest` (default) or `oldest`
- `type` — `bug` or `feature_request` (optional)
- `status` — `open`, `in_progress`, or `resolved` (optional)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issues retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Database connection timeout",
      "description": "Pool exhausts after 50+ concurrent queries",
      "type": "bug",
      "status": "open",
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T10:30:00Z",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      }
    }
  ]
}
```

#### 4. Get Single Issue

```
GET /api/issues/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue retrieved successfully",
  "data": {
    "id": 1,
    "title": "Database connection timeout",
    "description": "Pool exhausts after 50+ concurrent queries",
    "type": "bug",
    "status": "open",
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    }
  }
}
```

#### 5. Create Issue (Authenticated)

```
POST /api/issues
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Add dark mode support",
  "description": "Users are requesting dark mode for the dashboard UI",
  "type": "feature_request"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 2,
    "title": "Add dark mode support",
    "description": "Users are requesting dark mode for the dashboard UI",
    "type": "feature_request",
    "status": "open",
    "created_at": "2026-01-20T11:00:00Z",
    "updated_at": "2026-01-20T11:00:00Z",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    }
  }
}
```

#### 6. Update Issue (Authenticated)

```
PATCH /api/issues/:id
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in_progress"
}
```

**Permissions:**

- **Contributor:** Can only update their own open issues
- **Maintainer:** Can update any issue, any time

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 2,
    "title": "Updated title",
    "description": "Users are requesting dark mode for the dashboard UI",
    "type": "feature_request",
    "status": "in_progress",
    "created_at": "2026-01-20T11:00:00Z",
    "updated_at": "2026-01-20T11:15:00Z"
  }
}
```

#### 7. Delete Issue (Maintainer Only)

```
DELETE /api/issues/:id
Authorization: <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'contributor'
    CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**

- `id` — Auto-incrementing primary key
- `name` — User's full name (required)
- `email` — Unique login email (required)
- `password` — Bcrypt-hashed password (never returned in responses)
- `role` — Either 'contributor' or 'maintainer' (defaults to 'contributor')
- `created_at` — Account creation timestamp
- `updated_at` — Last update timestamp

### Issues Table

```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL CHECK (CHAR_LENGTH(description) >= 20),
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(50) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**

- `id` — Auto-incrementing primary key
- `title` — Issue title (required, max 150 chars)
- `description` — Detailed description (required, min 20 chars)
- `type` — Either 'bug' or 'feature_request'
- `status` — Current workflow state (open/in_progress/resolved)
- `reporter_id` — User ID who reported the issue
- `created_at` — Issue creation timestamp
- `updated_at` — Last modification timestamp

---

## 🔐 Authentication & Authorization

### JWT Flow

1. **Signup/Login** → User provides credentials
2. **Password Hashing** → Bcrypt hashes password (salt rounds: 10)
3. **JWT Creation** → Server signs token with payload: `{ id, name, role }`
4. **Token Return** → Client receives JWT token
5. **Protected Requests** → Client sends token in `Authorization: <TOKEN>` header
6. **Verification** → Server verifies JWT signature & expiry
7. **Access Control** → Role checks enforced before operations

### Role-Based Access Control

| Operation                   | Contributor | Maintainer |
| --------------------------- | ----------- | ---------- |
| Register/Login              | ✅          | ✅         |
| Create Issue                | ✅          | ✅         |
| View All Issues             | ✅          | ✅         |
| Update Own Open Issue       | ✅          | ✅         |
| Update Any Issue            | ❌          | ✅         |
| Delete Any Issue            | ❌          | ✅         |
| Change Status Independently | ❌          | ✅         |

### Security Features

- ✅ Passwords hashed with bcrypt (never stored plaintext)
- ✅ Passwords never returned in API responses
- ✅ JWT tokens expire after 7 days
- ✅ Parameterized SQL queries (prevent SQL injection)
- ✅ Role verification on protected endpoints
- ✅ CORS configured for specific origins only

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import GitHub repository
   - Select framework: "Other"

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Click "Settings" → "Environment Variables"
   - Add all variables from `.env.production`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment

**Live URL Format:**

```
https://devpulse-sandy.vercel.app/
```

### Database: NeonDB

1. Create account at [neon.tech](https://neon.tech)
2. Create PostgreSQL project
3. Copy connection string to `.env`
4. Tables auto-created on first server startup

---

## 🧪 Testing

### Test with Thunder Client or Postman

**1. Signup**

```
POST http://localhost:5000/api/auth/signup
```

**2. Login (get JWT token)**

```
POST http://localhost:5000/api/auth/login
```

**3. Create Issue (use token from step 2)**

```
POST http://localhost:5000/api/issues
Authorization: <YOUR_JWT_TOKEN>
```

**4. Get All Issues**

```
GET http://localhost:5000/api/issues
```

**5. Update Issue**

```
PATCH http://localhost:5000/api/issues/1
Authorization: <YOUR_JWT_TOKEN>
```

**6. Delete Issue (maintainer only)**

```
DELETE http://localhost:5000/api/issues/1
Authorization: <MAINTAINER_JWT_TOKEN>
```

---

## 📝 Git Commits

Progressive commits showing development:

```bash
1. Initial project setup with dependencies and configuration
2. Add database connection and table initialization
3. Setup Express server with CORS and basic routes
4. Implement GET all and GET single issue endpoints
5. Add CREATE issue endpoint with validation
6. Implement JWT authentication (signup and login)
7. Add auth middleware for JWT verification and token validation
8. Implement role-based access control for issue operations
9. Add update and delete issue endpoints with permissions
10. Configure deployment settings for Vercel
11. Add comprehensive README and API documentation
12. Final cleanup and production ready deployment
```

---

## 📚 Key Implementation Details

### No JOINs - Separate Queries

Per requirement, we avoid SQL JOINs. Reporter details are fetched in separate queries:

```typescript
// Get issues
const issues = await pool.query("SELECT * FROM issues");

// For each issue, fetch reporter
const reporters = await Promise.all(
  issues.map((issue) =>
    pool.query("SELECT id, name, role FROM users WHERE id = $1", [
      issue.reporter_id,
    ]),
  ),
);
```

### Parameterized Queries

All SQL queries use parameterized values to prevent SQL injection:

```typescript
// Safe - prevents SQL injection
await pool.query("SELECT * FROM users WHERE email = $1", [email]);

// Unsafe - never do this
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Password Hashing

Bcrypt with 10 salt rounds:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Response Format

All responses follow standard structure:

```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": {},
  "errors": "Optional error details"
}
```
