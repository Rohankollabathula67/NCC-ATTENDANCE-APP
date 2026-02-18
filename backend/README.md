# NCC Attendance Backend

## Quick Start

### Prerequisites
- Node.js installed
- MongoDB installed and running

### Setup Steps

1. **Start MongoDB** (if not already running):
   ```bash
   # Windows - Run in Command Prompt as Administrator
   net start MongoDB
   
   # Or start MongoDB manually
   mongod
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Edit `.env` file
   - Add your `GEMINI_API_KEY` if using AI features

4. **Test MongoDB connection**:
   ```bash
   npm run test:db
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register admin

### Cadets
- `GET /api/cadets` - Get all cadets
- `POST /api/cadets` - Create cadet (admin)
- `PUT /api/cadets/:id` - Update cadet (admin)
- `DELETE /api/cadets/:id` - Delete cadet (admin)

### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/date/:date` - Get by date
- `POST /api/attendance` - Mark attendance (admin)

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification (admin)
- `PATCH /api/notifications/:id/read` - Mark as read

### Drills
- `GET /api/drills` - Get drill schedules
- `POST /api/drills` - Create drill (admin)

## MongoDB Compass

Connect to: `mongodb://localhost:27017`
Database: `ncc-attendance`

## Troubleshooting

**MongoDB Connection Error?**
- Make sure MongoDB service is running
- Check MongoDB is installed correctly
- Verify connection string in `.env`
