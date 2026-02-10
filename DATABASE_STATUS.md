# 🗄️ DATABASE STATUS & CONNECTIONS

## ✅ CONNECTED DATABASES

Your project is configured with **4 databases**:

| Database | Port | Status | Purpose |
|----------|------|--------|---------|
| **MySQL** | 3306 | ✅ Active | Primary data (users, zones, shelters, reports) |
| **MongoDB** | 27017 | ✅ Active | Authentication & sessions |
| **PostgreSQL** | 5432 | ⚠️ Optional | Transactional data & stored procedures |
| **Neo4j** | 7687 | ⚠️ Optional | Graph analytics & relationships |

---

## 🎯 PRIMARY DATABASE: MySQL

**Connection Details:**
- Host: localhost
- Port: 3306
- Database: `rescuenet`
- User: root
- Password: root

**What MySQL Stores:**
- Users table
- Disaster zones
- Shelters
- Citizen requests
- **Disaster reports (from UI form)**
- Resource requests

---

## 🔄 BIDIRECTIONAL DEMO

### UI → MySQL
1. Go to http://localhost:3000/report-disaster
2. Fill form & submit
3. Check MySQL: `SELECT * FROM disaster_reports ORDER BY created_at DESC;`

### MySQL → UI
1. Run SQL: `INSERT INTO disaster_reports (reporter_name, reporter_phone, disaster_type, description, severity_estimate) VALUES ('SQL User', '1234567890', 'flood', 'Test', 'medium');`
2. Go to http://localhost:3000/mysql-data
3. Click **Refresh** → New data appears!

---

## 📂 PROJECT STRUCTURE (CLEAN)

```
disaster-management/
├── backend/                 # Node.js API server
│   ├── config/             # Database configs (mysql, mongo, pg, neo4j)
│   ├── routes/             # API routes for each database
│   └── server.js           # Main server file
├── frontend/               # React UI
├── sql-queries/            # MySQL demo scripts
│   ├── complete-schema.sql # Full database schema
│   ├── demo-queries.sql    # Sample queries
│   ├── joins-demo.sql      # JOIN examples
│   ├── subqueries-demo.sql # Subquery examples
│   └── aggregations-demo.sql
├── README.md               # Project documentation
├── RUN_PROJECT.md          # How to run
└── DATABASE_STATUS.md      # This file
```

---

## 🧪 Test All Connections

Run in terminal:
```bash
cd backend
node test-all-databases.js
```

Or check health endpoint:
```
http://localhost:5000/api/health
```
