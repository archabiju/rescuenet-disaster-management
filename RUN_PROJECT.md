# 🚀 RescueNet - Complete Project Guide
## Smart Disaster Response & Resource Allocation Management System

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Running the Project](#running-the-project)
5. [Accessing the Application](#accessing-the-application)
6. [MySQL Workbench + VS Code Setup](#mysql-workbench--vs-code-setup)
7. [Demo Flow for Reviewer](#demo-flow-for-reviewer)

---

## 🎯 Project Overview

RescueNet is a multi-database disaster management system that uses:
- **MySQL** - Structured data (users, zones, shelters, teams, requests)
- **MongoDB** - Document data (disaster reports, flexible schemas)
- **PostgreSQL** - Transactional data (PL/SQL procedures)
- **Neo4j** - Graph data (relationships, rescue routes)

### Database Schema (11 Tables in MySQL)

| Table | Description |
|-------|-------------|
| `users` | System users (admin, responder, citizen) |
| `disaster_zones` | Declared disaster areas |
| `shelters` | Shelter locations and capacity |
| `resource_centers` | Warehouses / supply centers |
| `resources` | Resource types (water, medkit, blankets) |
| `inventories` | Quantity of resources at centers |
| `rescue_teams` | Teams available for dispatch |
| `team_members` | Members of each team |
| `vehicles` | Vehicles assigned to teams |
| `citizen_requests` | Emergency requests from citizens |
| `team_assignments` | Team-to-request assignments |

---

## ✅ Prerequisites

Before running the project, ensure you have:

- [ ] **Node.js** (v16 or higher) - https://nodejs.org
- [ ] **MySQL Server 8.0** - https://dev.mysql.com/downloads/installer/
- [ ] **MySQL Workbench** - Installed with MySQL
- [ ] **MongoDB** - https://www.mongodb.com/try/download/community
- [ ] **MongoDB Compass** (optional) - For viewing MongoDB data
- [ ] **PostgreSQL** (optional) - https://www.postgresql.org/download/

---

## 🗄️ Database Setup

### Step 1: Start MySQL Server

1. Open **Windows Services** (press Windows key → type "Services")
2. Find **MySQL80**
3. Right-click → **Start**
4. Status should show "Running"

### Step 2: Create Database and Tables

**Option A: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to `localhost` (username: `root`, password: `root`)
3. Open file: `sql-queries/complete-schema.sql`
4. Click **⚡ Execute (Ctrl+Shift+Enter)**
5. All 11 tables will be created with sample data

**Option B: Using VS Code**
1. Install MySQL extension (by Jun Han)
2. Connect to `localhost:3306`, user: `root`, password: `root`
3. Open `sql-queries/complete-schema.sql`
4. Press `Ctrl+Shift+E` to execute

### Step 3: Verify Database

Run this query to check all tables:
```sql
USE rescuenet;
SHOW TABLES;
```

Expected output: 11 tables

---

## 🖥️ Running the Project

### Terminal 1: Start Backend

```bash
cd "c:\Users\ARCHA BIJU\Desktop\S2 MTECH\DBMS\disaster management\backend"
npm install
npm run dev
```

Expected output:
```
✅ MongoDB connected
✅ PostgreSQL ready
✅ MySQL ready for SQL queries
Server running on port 5000
```

### Terminal 2: Start Frontend

```bash
cd "c:\Users\ARCHA BIJU\Desktop\S2 MTECH\DBMS\disaster management\frontend"
npm install
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 🌐 Accessing the Application

### URLs

| Page | URL |
|------|-----|
| Landing Page | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| MySQL Data Viewer | http://localhost:3000/mysql-data |
| Graph Analytics | http://localhost:3000/graph-analytics |

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rescuenet.com | admin123 |
| Responder | responder@rescuenet.com | responder123 |
| Citizen | citizen@rescuenet.com | citizen123 |

---

## 💾 MySQL Workbench + VS Code Setup

### Connect MySQL Workbench

1. Open MySQL Workbench
2. Click **+** next to "MySQL Connections"
3. Connection Settings:
   - Connection Name: `RescueNet`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `root` (Store in Vault)
   - Default Schema: `rescuenet`
4. Click **Test Connection** → Should succeed
5. Click **OK**

### Connect VS Code

1. Install extension: **MySQL** by Jun Han
2. Click MySQL icon in sidebar
3. Click **+** to add connection
4. Enter: `localhost`, `3306`, `root`, `root`
5. Select database: `rescuenet`

### Run Queries

1. Open any `.sql` file from `sql-queries/` folder
2. Highlight a query
3. Press `Ctrl+Shift+E`
4. Results appear in OUTPUT panel

---

## 🎬 Demo Flow for Reviewer

### Part 1: Database Setup (5 minutes)

1. **Show MySQL Workbench** → Connected to `rescuenet`
2. **Show all 11 tables** → `SHOW TABLES;`
3. **Show sample data** → `SELECT * FROM users;`
4. **Show relationships** → Run JOIN query

### Part 2: SQL Queries in VS Code (5 minutes)

Open `sql-queries/reviewer-demo-script.sql`:

```sql
-- Show table structure
SHOW TABLES;

-- Basic SELECT
SELECT * FROM users;
SELECT * FROM disaster_zones WHERE severity = 'Critical';

-- JOIN Query
SELECT 
    rt.team_name,
    u.full_name AS leader,
    rc.name AS home_center
FROM rescue_teams rt
JOIN users u ON rt.lead_user_id = u.user_id
JOIN resource_centers rc ON rt.home_center_id = rc.center_id;

-- Aggregation
SELECT severity, COUNT(*) AS count 
FROM disaster_zones 
GROUP BY severity;

-- Subquery
SELECT zone_name,
    (SELECT COUNT(*) FROM shelters WHERE zone_id = dz.zone_id) AS shelter_count
FROM disaster_zones dz;
```

### Part 3: Frontend Application (5 minutes)

1. **Start frontend** → `npm start`
2. **Login** as admin
3. **Navigate to**:
   - `/dashboard` - Overview statistics
   - `/zones` - Disaster zones management
   - `/mysql-data` - Real-time MySQL data viewer
   - `/graph-analytics` - Neo4j relationships

### Part 4: Data Flow Demo (3 minutes)

1. **Add data** in MySQL Workbench:
   ```sql
   INSERT INTO users (full_name, email, role) 
   VALUES ('Demo User', 'demo@test.com', 'citizen');
   ```

2. **Refresh** `/mysql-data` page in browser
3. **See new user** appear immediately!
4. **Show the connection**: MySQL ↔ Backend ↔ Frontend

---

## 📁 Project Structure

```
disaster management/
├── backend/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   ├── postgres.js    # PostgreSQL connection
│   │   ├── mysql.js       # MySQL connection
│   │   └── neo4j.js       # Neo4j connection
│   ├── routes/
│   │   ├── mysql/         # MySQL API routes
│   │   ├── postgres/      # PostgreSQL routes
│   │   └── graph/         # Neo4j routes
│   ├── server.js          # Main server file
│   └── .env               # Database credentials
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── MySQLDataPage.jsx  # MySQL data viewer
│       │   ├── Dashboard.jsx      # Main dashboard
│       │   └── ...
│       └── App.js
│
├── sql-queries/
│   ├── complete-schema.sql      # All 11 tables
│   ├── demo-queries.sql         # Demo queries
│   ├── joins-demo.sql           # JOIN examples
│   ├── aggregations-demo.sql    # COUNT, SUM, GROUP BY
│   ├── subqueries-demo.sql      # Nested queries
│   └── reviewer-demo-script.sql # Presentation script
│
├── README.md
├── RUN_PROJECT.md (this file)
└── ER_DIAGRAM_DOCUMENTATION.md
```

---

## 🔧 Troubleshooting

### MySQL Connection Failed
```
Solution: Check if MySQL80 service is running in Windows Services
```

### Port 5000 Already in Use
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```

### Frontend Not Loading
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules
npm install
npm start
```

---

## ✨ Key Features to Demonstrate

1. **Multi-Database Architecture** - MySQL + MongoDB + PostgreSQL + Neo4j
2. **SQL Queries** - JOINs, Aggregations, Subqueries
3. **Real-time Data** - MySQL ↔ Backend ↔ Frontend
4. **ER Diagram** - 11 tables with relationships
5. **VS Code Integration** - Run SQL directly in editor
6. **MySQL Workbench** - Professional database management

---

## 📞 Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Start MySQL (if stopped)
net start MySQL80

# Test MySQL connection
mysql -u root -proot -e "USE rescuenet; SHOW TABLES;"
```

---

**🎉 Your RescueNet project is ready for demonstration!**
