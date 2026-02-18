# MongoDB Backend Migration - Setup Guide

## 🎯 What We've Built

Your NCC Attendance Application has been migrated from a localStorage-based system to a full-stack application with:
- ✅ **Backend**: Node.js + Express + MongoDB
- ✅ **Database**: MongoDB with Mongoose ODM
- ✅ **Authentication**: JWT-based with bcrypt password hashing
- ✅ **API**: RESTful endpoints for all operations
- ✅ **Frontend**: Updated to communicate with backend

## 📋 Prerequisites

Before running the application, ensure you have:
1. **Node.js** installed (v16 or higher)
2. **MongoDB** installed and running
3. **MongoDB Compass** (optional, for visual database management)

## 🚀 Quick Start

### Step 1: Start MongoDB

**Windows:**
```powershell
# Option 1: Start as Windows Service
net start MongoDB

# Option 2: Start manually
mongod
```

**Mac/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or use brew (Mac)
brew services start mongodb-community
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Test MongoDB Connection

```bash
npm run test:db
```

You should see:
```
✅ Connection successful!
🏢 Host: localhost
📊 Database: ncc-attendance
```

### Step 4: Create Initial Admin User

Run the migration script to create the default admin:
```bash
node src/config/migrateData.js
```

This creates:
- **Username**: `admin`
- **Password**: `admin123`

### Step 5: Start the Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Step 6: Start the Frontend

Open a new terminal:
```bash
cd ..
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Login Credentials

### Admin Login
- Username: `admin`
- Password: `admin123`

### Cadet Login
After creating cadets through the admin panel, cadets can login with:
- Username: Their regimental number
- Password: Set during cadet creation (default: regimental number)

## 📊 MongoDB Compass

To view your database visually:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `ncc-attendance`
4. View collections: `cadets`, `users`, `attendances`, `notifications`, `drillschedules`

## 🔄 Migrating Existing Data

If you have existing data in localStorage:

1. Open your browser console on the old app
2. Run this command:
```javascript
JSON.stringify({
  cadets: JSON.parse(localStorage.getItem("ncc_cadets_realtime")),
  attendanceHistory: JSON.parse(localStorage.getItem("ncc_attendance_realtime")),
  notifications: JSON.parse(localStorage.getItem("ncc_notifications_realtime"))
})
```
3. Copy the output
4. Edit `backend/src/config/migrateData.js`
5. Paste the data into the `localStorageData` variable
6. Run: `node src/config/migrateData.js`

## 🛠️ Troubleshooting

### "MongoDB Connection Error"
- Ensure MongoDB is running: `mongod` or `net start MongoDB`
- Check if port 27017 is available
- Verify MongoDB is installed correctly

### "Cannot connect to server" (Frontend)
- Make sure backend is running on port 5000
- Check `backend/.env` has correct settings
- Verify `VITE_API_URL` in frontend `.env.local`

### "Invalid credentials"
- Use default admin: `admin` / `admin123`
- Or create cadets first through admin panel

## 📁 Project Structure

```
NCC-ATTENDANCE-Application/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & error handling
│   │   └── server.js       # Express app
│   ├── .env                # Environment variables
│   └── package.json
├── src/
│   ├── components/         # React components
│   ├── services/
│   │   └── apiService.ts   # API client
│   └── App.tsx             # Main app (now uses API)
└── .env.local              # Frontend env variables
```

## 🔑 Key Changes

### What Changed:
- ❌ Removed localStorage persistence
- ❌ Removed JSONBin cloud sync
- ✅ Added MongoDB database
- ✅ Added Express backend API
- ✅ Added JWT authentication
- ✅ Added proper user management

### What Stayed the Same:
- ✅ All UI components
- ✅ Dashboard analytics
- ✅ Attendance tracking
- ✅ Cadet management
- ✅ Notifications system

## 📞 API Endpoints

All endpoints are prefixed with `/api`:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Cadets**: `/api/cadets` (GET, POST, PUT, DELETE)
- **Attendance**: `/api/attendance` (GET, POST)
- **Notifications**: `/api/notifications` (GET, POST, PATCH, DELETE)
- **Drills**: `/api/drills` (GET, POST, PUT, DELETE)

## 🎓 Next Steps

1. Login as admin (`admin` / `admin123`)
2. Add cadets through the Roster page
3. Mark attendance
4. Create drill schedules
5. Send notifications

## ⚠️ Important Notes

- **Change default admin password** in production!
- Backend must be running for the app to work
- Data is now persisted in MongoDB, not browser
- Use MongoDB Compass to backup/restore data
