# RescueNet - Multi-Database Disaster Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5+-blue.svg)](https://neo4j.com/)

A comprehensive disaster management system leveraging **polyglot persistence** with 4 database technologies to efficiently handle diverse data requirements during emergencies.

![RescueNet Architecture](https://img.shields.io/badge/Architecture-Polyglot_Persistence-orange)

## 🌟 Overview

RescueNet is an advanced, full-stack web application designed to revolutionize emergency response operations through intelligent data management and real-time coordination. The system uses the **right database for the right data** approach, integrating MySQL, MongoDB, PostgreSQL, and Neo4j.

### Key Features

- 🗄️ **4 Database Technologies** - Polyglot persistence architecture
- 🚨 **Real-Time Disaster Reporting** - Interactive map-based reporting
- 📦 **Resource Management** - Inventory tracking with automated alerts
- 👥 **Team Coordination** - Graph-based collaboration networks
- 🏠 **Shelter Management** - Capacity tracking and optimization
- 🚗 **Vehicle Fleet Management** - Asset tracking
- 📊 **Advanced Analytics** - Real-time statistics and insights
- 🔐 **Secure Authentication** - JWT-based role-based access control

## 🏗️ Architecture

### Polyglot Persistence Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                       │
│        Tailwind CSS • Leaflet Maps • Axios             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            Backend (Node.js + Express)                  │
│         RESTful API • JWT Auth • 40+ Endpoints         │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    MySQL     │  │   MongoDB    │  │ PostgreSQL   │  │    Neo4j     │
│ Operational  │  │  Flexible    │  │ Analytical   │  │    Graph     │
│    Data      │  │  Documents   │  │   + PL/SQL   │  │ Relationships│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Database Responsibilities

| Database | Purpose | Use Cases |
|----------|---------|-----------|
| **MySQL** | Structured operational data with ACID compliance | Users, Zones, Shelters, Resources, Teams, Citizen Requests, Vehicles |
| **MongoDB** | Semi-structured flexible documents | Disaster Reports, Resource Requests |
| **PostgreSQL** | Complex analytics and stored procedures | PL/SQL Procedures, Advanced Queries, Transactions |
| **Neo4j** | Graph relationships and network analysis | Team Collaboration, Resource Flow, Route Optimization |

## 📊 Project Statistics

- **4 Database Technologies** integrated seamlessly
- **40+ RESTful API Endpoints**
- **11 MySQL Tables** with normalized schema
- **2 MongoDB Collections** with flexible schemas
- **5 Neo4j Node Types** with relationship mapping
- **14 PL/SQL Procedures/Functions** in PostgreSQL
- **25+ React Components**
- **Clean Data** - No duplicates with INSERT IGNORE
- **Bidirectional Sync** - UI ↔ Database

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MySQL 8.0+
- MongoDB 6+
- PostgreSQL 14+
- Neo4j 5+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/archabiju/rescuenet-disaster-management.git
cd rescuenet-disaster-management
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create `.env` file in the backend directory:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/disaster_management

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=disaster_management
MYSQL_USER=root
MYSQL_PASSWORD=root

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=rescuenet
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=rescuenet123

# Server
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

5. **Initialize MySQL database**
```bash
# Open MySQL Workbench or MySQL CLI
# Run the schema file:
mysql -u root -p disaster_management < sql-queries/complete-schema.sql
```

6. **Start the application**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📚 Documentation

- [System Architecture](SYSTEM_ARCHITECTURE.md) - Complete architecture with diagrams
- [Database Status](DATABASE_STATUS.md) - Current database configuration
- [How It Works](HOW_IT_WORKS.md) - Detailed functionality guide
- [Demo Queries](DEMO_QUERIES.md) - Example database queries

## 🎯 Features

### User Features
- 🚨 Report disasters with location
- 📦 Request emergency resources
- 🆘 Submit citizen requests
- 📊 View personal activity
- 🔔 Real-time notifications
- 📞 Emergency contacts directory

### Admin Features
- 📥 Unified inbox for all submissions
- 🎯 Team assignment and coordination
- 📦 Resource allocation with inventory management
- 🏢 Shelter capacity management
- 🚗 Vehicle fleet tracking
- 📈 Real-time analytics dashboard
- 👥 User management

## 🗄️ Database Details

### MySQL (Operational Data)
**11 Tables**:
- `users` - User accounts (7 users)
- `disaster_zones` - Declared zones (4 zones)
- `shelters` - Emergency shelters (4 shelters)
- `resource_centers` - Distribution centers
- `resources` - Resource types
- `inventories` - Stock management
- `rescue_teams` - Team information
- `team_members` - Team composition
- `vehicles` - Fleet tracking (4 vehicles)
- `citizen_requests` - Help requests (7 requests)
- `team_assignments` - Deployments

**Features**:
- ✅ No duplicate data (INSERT IGNORE)
- ✅ Foreign key constraints
- ✅ Indexed for performance
- ✅ Bidirectional sync with UI

### MongoDB (Flexible Documents)
**Collections**:
- `disaster_reports` - User-submitted reports (9 reports)
- `resource_requests` - Resource needs (4 requests)

**Features**:
- Flexible schema for evolving data
- Fast document-based queries
- JSON-native integration

### PostgreSQL (Analytics)
**Features**:
- **PL/SQL Stored Procedures**:
  - `assign_team_to_request()` - Team assignment
  - `allocate_resources()` - Resource allocation
  - `resolve_request()` - Request resolution
- **Functions**:
  - `get_zone_statistics()` - Zone analytics
  - `get_available_capacity()` - Capacity calculations
  - `get_team_workload()` - Workload analysis

### Neo4j (Graph Relationships)
**Node Types**:
- Teams
- Zones
- Resources
- Members
- Requests

**Use Cases**:
- Team collaboration networks
- Resource flow tracking
- Shortest path analysis
- Relationship visualization

## 🔧 API Endpoints

### MySQL Routes (`/api/mysql/*` or `/api/requests`)
```
GET    /api/requests              - Get all citizen requests
POST   /api/requests              - Create new request
PUT    /api/requests/:id          - Update request
DELETE /api/requests/:id          - Delete request
GET    /api/mysql/users           - Get users
GET    /api/mysql/zones           - Get disaster zones
POST   /api/mysql/query           - Execute custom SQL
```

### MongoDB Routes (`/api/*`)
```
GET    /api/disaster-reports      - Get all reports
POST   /api/disaster-reports      - Submit report
GET    /api/resource-requests     - Get resource requests
POST   /api/resource-requests     - Request resources
```

### PostgreSQL Routes (`/api/pg/*`)
```
POST   /api/pg/execute-procedure  - Run stored procedure
GET    /api/pg/analytics          - Complex analytics
```

### Neo4j Routes (`/api/graph/*`)
```
GET    /api/graph/shortest-path   - Find optimal route
GET    /api/graph/relationships   - Team connections
```

### Utility Routes
```
GET    /api/health                - Database health check
POST   /api/auth/login            - User authentication
POST   /api/auth/register         - User registration
```

## 👤 Default Credentials

### Admin Account
- Email: **admin@rescuenet.com**
- Password: **admin123**

### Responder Account
- Email: **responder@rescuenet.com**
- Password: **responder123**

### Citizen Account
- Email: **citizen@rescuenet.com**
- Password: **citizen123**

## 🛠️ Technology Stack

### Frontend
- React 18.2
- Tailwind CSS / Custom CSS
- Leaflet Maps
- Axios 1.6
- React Router 6
- Lucide React Icons

### Backend
- Node.js 16+
- Express.js 4.18
- JWT Authentication
- Bcrypt for password hashing
- Nodemon for development

### Databases
- MySQL 8.0 (primary operational database)
- MongoDB 6+ (flexible documents)
- PostgreSQL 14+ (analytics + PL/SQL)
- Neo4j 5+ (graph relationships)

### Development Tools
- MySQL Workbench
- MongoDB Compass
- pgAdmin
- Neo4j Browser
- VS Code

## 🎓 Academic Significance

This project demonstrates:
- ✅ **Polyglot Persistence** - Multiple databases in one application
- ✅ **Database Selection Criteria** - Right tool for the right job
- ✅ **PL/SQL Programming** - Stored procedures and functions
- ✅ **NoSQL Flexibility** - Schema-less document storage
- ✅ **Graph Database Concepts** - Relationship queries
- ✅ **Full-Stack Development** - Complete MERN-like stack
- ✅ **RESTful API Design** - Clean architecture
- ✅ **Real-World Application** - Practical disaster management

## 🌍 Social Impact

RescueNet addresses critical disaster management needs:
- **Faster Emergency Response** - Real-time reporting
- **Better Resource Allocation** - Optimized inventory
- **Improved Team Coordination** - Network-based collaboration
- **Enhanced Decision Making** - Real-time analytics
- **Increased Accessibility** - Web-based interface

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Admin, Responder, Citizen)
- Bcrypt password hashing
- CORS enabled
- Input validation
- SQL injection prevention

## 🚦 Current Status

✅ **All Systems Operational**
- Backend Server: Running on port 5000
- Frontend Server: Running on port 3000
- MySQL: 7 users, 4 zones, 7 citizen requests
- MongoDB: 9 reports, 4 resource requests
- All databases connected and synced

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Archa Biju**
- GitHub: [@archabiju](https://github.com/archabiju)
- Project: M.Tech - Database Management Systems
- University: [Your University Name]

## 🙏 Acknowledgments

- MySQL Community for robust relational database
- PostgreSQL for advanced SQL features
- MongoDB team for flexible NoSQL solutions
- Neo4j for powerful graph database
- React team for amazing frontend framework

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Made with ❤️ for better disaster management**

**Last Updated**: February 10, 2026
**Version**: 2.0.0
