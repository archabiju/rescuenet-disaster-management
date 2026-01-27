# Neo4j Installation Guide for Windows

## Step 1: Download Neo4j Desktop

1. Go to: https://neo4j.com/download/
2. Click **"Download Neo4j Desktop"**
3. Fill in the form (or use a temporary email)
4. Download the Windows installer (.exe)

## Step 2: Install Neo4j Desktop

1. Run the downloaded `.exe` installer
2. Follow the installation wizard
3. Accept the license agreement
4. Choose installation directory (default is fine)
5. Complete installation

## Step 3: Create a New Database

1. Launch **Neo4j Desktop**
2. Click **"New Project"** or use the default project
3. Click **"Add"** → **"Local DBMS"**
4. Set:
   - **Name**: `RescueNetGraph`
   - **Password**: `rescuenet123` (remember this!)
   - **Version**: Select latest (5.x recommended)
5. Click **"Create"**
6. Click **"Start"** to start the database

## Step 4: Get Connection Details

After starting the database, note these values:
- **URI**: `bolt://localhost:7687` (default)
- **Username**: `neo4j` (default)
- **Password**: The password you set above

## Step 5: Update Your .env File

Add these lines to your backend `.env` file:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=rescuenet123
```

## Step 6: Access Neo4j Browser (Optional)

1. In Neo4j Desktop, click **"Open"** next to your database
2. This opens Neo4j Browser - a web interface to run queries
3. You can visualize your graph data here!

## Verification

After setup, run this in Neo4j Browser to verify:
```cypher
RETURN "Neo4j is working!" AS message
```

---

**Troubleshooting:**
- If port 7687 is busy, change it in Neo4j settings
- Make sure Java is installed (Neo4j requires it)
- Check Windows Firewall isn't blocking the ports
