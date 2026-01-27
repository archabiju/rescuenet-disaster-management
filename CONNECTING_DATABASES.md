# Connecting Your SQL Databases to RescueNet

## Your Current Situation

![SQLite Database in VS Code](file:///C:/Users/ARCHA%20BIJU/.gemini/antigravity/brain/3f8fbcd5-48c5-48ff-b6fd-986b7e483e86/uploaded_media_1769267971467.png)

You have **two SQL databases**:

### 1. SQLite Database (in VS Code)
- **File**: `disaster_management.db` or `Disaster_DB`
- **Location**: `C:\Users\ARCHA BIJU\Desktop\S2 MTECH\DBMS`
- **Type**: File-based database (single `.db` file)
- **Tables**: users, disaster_zones, shelters, rescue_teams, etc.
- **Status**: ✅ Already created with data

### 2. PostgreSQL Database (for your project)
- **Name**: `rescuenet`
- **Type**: Server-based database
- **Tables**: Same structure as SQLite
- **Status**: ⚠️ Needs to be created and populated

---

## Why Two Databases?

**SQLite** (your current one):
- ✅ Good for learning SQL
- ✅ Easy to use in VS Code
- ❌ Not suitable for web applications
- ❌ Can't handle multiple users

**PostgreSQL** (for your project):
- ✅ Production-ready for web apps
- ✅ Supports PL/SQL (stored procedures)
- ✅ Handles multiple concurrent users
- ✅ Better for your review/demonstration

---

## How to Connect PostgreSQL to Your Project

### Step 1: Create PostgreSQL Database

Open **pgAdmin** (installed with PostgreSQL):

1. Launch pgAdmin from Start Menu
2. Enter your master password
3. Expand "Servers" → "PostgreSQL"
4. Right-click "Databases" → "Create" → "Database"
5. Name: `rescuenet`
6. Click "Save"

### Step 2: Copy Your SQLite Schema to PostgreSQL

You have two options:

#### Option A: Use Your Existing SQL Files (Easiest)

1. In pgAdmin, select `rescuenet` database
2. Click "Query Tool" (top toolbar)
3. Copy the contents of these files and run them **in order**:

**File 1**: `backend/database/postgresql/schema.sql`
```sql
-- This creates all tables
-- Copy entire file and click Execute (F5)
```

**File 2**: `backend/database/postgresql/stored_procedures.sql`
```sql
-- This creates PL/SQL functions
-- Copy entire file and click Execute (F5)
```

**File 3**: `backend/database/postgresql/triggers.sql`
```sql
-- This creates triggers
-- Copy entire file and click Execute (F5)
```

**File 4**: `backend/database/postgresql/seed.sql`
```sql
-- This inserts sample data
-- Copy entire file and click Execute (F5)
```

#### Option B: Migrate from SQLite to PostgreSQL

If you want to keep your existing SQLite data:

1. Open your SQLite database in VS Code
2. Export data as SQL INSERT statements
3. Modify for PostgreSQL syntax
4. Import into PostgreSQL

### Step 3: Verify Connection

Your project is **already configured** to connect! Check your `.env` file:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=rescuenet
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Step 4: Test the Connection

With your backend running (`npm run dev`), open in browser:

```
http://localhost:5000/api/health
```

You should see:
```json
{
  "databases": {
    "postgresql": { "status": "connected" }
  }
}
```

---

## How Your Project Uses PostgreSQL

### Backend Connection (Already Set Up!)

**File**: `backend/config/postgres.js`

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,    // localhost
  port: process.env.POSTGRES_PORT,    // 5432
  database: process.env.POSTGRES_DB,  // rescuenet
  user: process.env.POSTGRES_USER,    // postgres
  password: process.env.POSTGRES_PASSWORD
});
```

### API Routes (Already Created!)

Your backend automatically connects when you call:

```javascript
// Get users from PostgreSQL
GET http://localhost:5000/api/pg/users

// Get zones from PostgreSQL
GET http://localhost:5000/api/pg/zones

// Call PL/SQL function
GET http://localhost:5000/api/pg/zone-capacity/1
```

---

## Quick Setup Checklist

- [ ] **1. Open pgAdmin**
- [ ] **2. Create database** named `rescuenet`
- [ ] **3. Open Query Tool** for rescuenet
- [ ] **4. Run schema.sql** (creates tables)
- [ ] **5. Run stored_procedures.sql** (creates PL/SQL)
- [ ] **6. Run triggers.sql** (creates triggers)
- [ ] **7. Run seed.sql** (inserts data)
- [ ] **8. Test**: Open `http://localhost:5000/api/health`
- [ ] **9. Test**: Open `http://localhost:5000/api/pg/users`

---

## Troubleshooting

### "Connection refused" error
- Make sure PostgreSQL service is running
- Check Windows Services → PostgreSQL should be "Running"

### "Database does not exist"
- Create the `rescuenet` database in pgAdmin first

### "Password authentication failed"
- Update `.env` with your actual PostgreSQL password
- Default is usually `postgres` or what you set during installation

---

## What About Your SQLite Database?

You can **keep it** for:
- Learning SQL queries
- Testing queries before running in PostgreSQL
- Backup reference

But your **web application** will use PostgreSQL because:
- It supports PL/SQL (stored procedures & triggers)
- Better for multi-user web apps
- Industry standard for production

---

## Summary

```
┌─────────────────────────────────────────────┐
│  Your SQLite DB (in VS Code)                │
│  - For learning & testing SQL               │
│  - File: disaster_management.db             │
└─────────────────────────────────────────────┘
                    ↓ (copy schema)
┌─────────────────────────────────────────────┐
│  PostgreSQL Database (rescuenet)            │
│  - For your web application                 │
│  - Connected via backend/config/postgres.js │
└─────────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────────┐
│  Your Backend (Node.js)                     │
│  - Automatically connects to PostgreSQL     │
│  - Routes: /api/pg/*                        │
└─────────────────────────────────────────────┘
```

**Next Step**: Create the `rescuenet` database in pgAdmin and run the SQL files!
