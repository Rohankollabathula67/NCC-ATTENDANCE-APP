# MongoDB Installation Guide for Windows

## Problem
You have **MongoDB Compass** (the GUI) installed, but not **MongoDB Server** (the database engine).

## Solution: Install MongoDB Community Server

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: 8.0.4 (or latest)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\8.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\8.0\log`
4. **IMPORTANT**: Check "Install MongoDB Compass" (if not already installed)
5. Click **Install**

### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

You should see version information.

### Step 4: Start MongoDB Service
```powershell
# Start MongoDB service
net start MongoDB

# Or if that doesn't work:
sc start MongoDB
```

### Step 5: Verify MongoDB is Running
```powershell
# Check service status
sc query MongoDB
```

You should see `STATE: 4 RUNNING`

### Step 6: Test Connection
In your project:
```bash
cd backend
npm run test:db
```

You should see:
```
✅ Connection successful!
🏢 Host: localhost
📊 Database: ncc-attendance
```

## Alternative: Manual Start (if service doesn't work)

If MongoDB service won't start, you can run it manually:

1. Open PowerShell as Administrator
2. Create data directory:
```powershell
mkdir C:\data\db
```

3. Start MongoDB manually:
```powershell
mongod --dbpath C:\data\db
```

Keep this terminal open while using the app.

## Troubleshooting

### "Service name is invalid"
- MongoDB Server is not installed, only Compass
- Follow installation steps above

### "Access Denied"
- Run PowerShell as Administrator
- Or use manual start method

### Port 27017 already in use
```powershell
# Find what's using the port
netstat -ano | findstr :27017

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

## After Installation

Once MongoDB is running:
1. Run backend: `cd backend && npm run dev`
2. You should see: `✅ MongoDB Connected: localhost`
3. Run frontend: `npm run dev`
4. Login with: `admin` / `admin123`

## Quick Links
- MongoDB Download: https://www.mongodb.com/try/download/community
- MongoDB Docs: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/
