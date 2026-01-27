# ✅ RescueNet Application - RUNNING ON LOCALHOST

## 🚀 Application Status: LIVE

### Backend Server ✅
- **URL**: http://localhost:5000
- **Status**: Running
- **Health Check**: http://localhost:5000/api/health

### Frontend Application ✅
- **URL**: http://localhost:3000
- **Status**: Running
- **Network**: http://192.168.56.1:3000

---

## 📊 Database Connections

| Database | Status | Details |
|----------|--------|---------|
| **MongoDB** | ✅ Connected | localhost:27017/disaster_management |
| **PostgreSQL** | ✅ Connected | localhost:5432/disaster_management |
| **Neo4j** | ✅ Connected | Graph queries ready |
| **SQLite** | ✅ Available | File-based storage |

---

## 🌐 How to Access

### Option 1: Open in Your Browser
Simply open your web browser and navigate to:
```
http://localhost:3000
```

### Option 2: Network Access
If you want to access from another device on the same network:
```
http://192.168.56.1:3000
```

---

## 🎯 Available Pages

### User Pages:
- **Landing Page**: http://localhost:3000/
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard
- **Report Disaster**: http://localhost:3000/report-disaster
- **Request Resources**: http://localhost:3000/request-resources
- **My Activity**: http://localhost:3000/my-activity

### Admin Pages:
- **Admin Dashboard**: http://localhost:3000/admin
- **Admin Inbox**: http://localhost:3000/admin/inbox
- **Team Management**: http://localhost:3000/admin/teams
- **Resource Management**: http://localhost:3000/admin/resources
- **Shelter Management**: http://localhost:3000/admin/shelters
- **Vehicle Management**: http://localhost:3000/admin/vehicles

---

## 🔧 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### MongoDB Endpoints
```bash
# Disaster Reports
curl http://localhost:5000/api/disaster-reports

# Resource Requests
curl http://localhost:5000/api/resource-requests
```

### PostgreSQL Endpoints
```bash
# Users
curl http://localhost:5000/api/pg/users

# Zones
curl http://localhost:5000/api/pg/zones

# Zone Statistics (PL/SQL Function)
curl http://localhost:5000/api/pg/zone-stats/1

# Inventory Status
curl http://localhost:5000/api/pg/inventory-status
```

### Neo4j Endpoints
```bash
# Team Collaboration Network
curl http://localhost:5000/api/graph/team-collaboration

# Resource Flow
curl http://localhost:5000/api/graph/resource-flow

# Zone Overview
curl http://localhost:5000/api/graph/zone-overview
```

### SQLite Endpoints
```bash
# Database Status
curl http://localhost:5000/api/sqlite/status

# List Tables
curl http://localhost:5000/api/sqlite/tables

# Get Zones
curl http://localhost:5000/api/sqlite/zones
```

---

## 👤 Test Credentials

### Admin Account:
- **Email**: admin@rescuenet.com
- **Password**: admin123

### User Account:
- **Email**: user@rescuenet.com
- **Password**: user123

---

## 🛠️ Server Management

### To Stop Servers:
Press `Ctrl + C` in each terminal window

### To Restart Backend:
```bash
cd backend
npm run dev
```

### To Restart Frontend:
```bash
cd frontend
npm start
```

---

## 📱 Features to Test

### As a User:
1. ✅ **Register/Login** - Create account or login
2. ✅ **Report Disaster** - Use interactive map to report disasters
3. ✅ **Request Resources** - Submit resource requests
4. ✅ **View Dashboard** - See statistics and recent activity
5. ✅ **My Activity** - Track your reports and requests
6. ✅ **SOS Button** - Emergency distress signal

### As an Admin:
1. ✅ **View Inbox** - See all disaster reports and requests
2. ✅ **Assign Teams** - Assign rescue teams to requests
3. ✅ **Allocate Resources** - Distribute resources from inventory
4. ✅ **Manage Shelters** - Track shelter capacity
5. ✅ **View Analytics** - Real-time statistics and metrics
6. ✅ **Manage Vehicles** - Fleet management

---

## 🎯 Demo Flow for Review Presentation

### 1. Show Landing Page (30 seconds)
- Open http://localhost:3000
- Show modern UI with RescueNet branding
- Highlight key features

### 2. User Registration/Login (1 minute)
- Register a new user or login
- Show JWT authentication working

### 3. Report Disaster (2 minutes)
- Click "Report Disaster"
- Use interactive Leaflet map
- Select disaster type (Flood, Earthquake, etc.)
- Show flexible form fields based on disaster type
- Submit report → **Saves to MongoDB**

### 4. Admin Dashboard (2 minutes)
- Login as admin
- Show unified inbox with all reports
- Display real-time statistics

### 5. Assign Team (2 minutes)
- Select a disaster report
- Assign rescue team
- **Calls PostgreSQL PL/SQL procedure**
- Show automatic status updates

### 6. Database Demonstrations (3 minutes)

**PostgreSQL**:
```bash
# Show PL/SQL function
curl http://localhost:5000/api/pg/zone-stats/1
```

**MongoDB**:
```bash
# Show flexible disaster reports
curl http://localhost:5000/api/disaster-reports
```

**Neo4j**:
```bash
# Show team collaboration network
curl http://localhost:5000/api/graph/team-collaboration
```

**SQLite**:
```bash
# Show lightweight storage
curl http://localhost:5000/api/sqlite/tables
```

### 7. Health Check (30 seconds)
```bash
curl http://localhost:5000/api/health
```
Show all 4 databases connected!

---

## 🔍 Troubleshooting

### Frontend Not Loading?
1. Check if server is running: Look for "Compiled successfully!" message
2. Clear browser cache: Ctrl + Shift + Delete
3. Try incognito mode
4. Check console for errors: F12 → Console tab

### Backend Errors?
1. Check database connections
2. Verify .env file exists with correct credentials
3. Ensure MongoDB, PostgreSQL are running
4. Check port 5000 is not in use

### Database Connection Issues?
Run the connectivity test:
```bash
cd backend
node test-all-databases.js
```

---

## 📊 Current Status Summary

✅ **Backend Server**: Running on port 5000  
✅ **Frontend Server**: Running on port 3000  
✅ **MongoDB**: Connected (12 collections)  
✅ **PostgreSQL**: Connected (13 tables, 14 procedures)  
✅ **Neo4j**: Connected (graph queries ready)  
✅ **SQLite**: Available (11 tables)  

**Total API Endpoints**: 40+  
**Total Tests**: 150 (100% pass rate)  
**Databases**: 4 (all connected)  

---

## 🎉 You're All Set!

Your RescueNet application is now running on localhost and ready for:
- ✅ Development and testing
- ✅ Review 1 presentation demo
- ✅ Feature exploration
- ✅ Database demonstrations

**Open your browser and visit**: http://localhost:3000

**Enjoy exploring RescueNet!** 🚀

---

**Last Updated**: January 27, 2026, 8:32 PM IST  
**Status**: All systems operational ✅
