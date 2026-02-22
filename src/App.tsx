import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Roster } from './components/Roster';
import { AttendanceView } from './components/AttendanceView';
import { DrillScheduler } from './components/DrillScheduler';
import { Login } from './components/Login';
import { CadetDashboard } from './components/CadetDashboard';
import { Settings } from './components/Settings';
import { AppView, Cadet, AttendanceStatus, User, Notification } from './types';
import { cadetsAPI, attendanceAPI, notificationsAPI, authAPI } from './services/apiService';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ncc_user_realtime');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [view, setView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // --- Data State ---
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Load Data from API ---
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [cadetsData, notificationsData, attendanceData] = await Promise.all([
        cadetsAPI.getAll(),
        notificationsAPI.getAll(),
        attendanceAPI.getAll()
      ]);

      setCadets(cadetsData);
      setNotifications(notificationsData);

      // Convert attendance array to history object
      const history: Record<string, Record<string, AttendanceStatus>> = {};
      attendanceData.forEach((record: any) => {
        if (!history[record.date]) {
          history[record.date] = {};
        }
        history[record.date][record.cadetId._id || record.cadetId] = record.status as AttendanceStatus;
      });
      setAttendanceHistory(history);

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.message || 'Failed to load data from server');
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('ncc_user_realtime', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setView('dashboard');
    setCadets([]);
    setAttendanceHistory({});
    setNotifications([]);
  };

  const handleAddCadet = async (cadet: Cadet) => {
    try {
      const newCadet = await cadetsAPI.create(cadet);
      setCadets([...cadets, newCadet]);
      sendNotification('Cadet Added', `${newCadet.fullName} has been added to the roster.`, 'info');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add cadet');
    }
  };

  const handleUpdateCadet = async (updatedCadet: Cadet) => {
    try {
      const updated = await cadetsAPI.update(updatedCadet.id, updatedCadet);
      // `updated` already has `id` mapped from `_id` via apiService mapId()
      setCadets(prev => prev.map(c => c.id === updated.id ? updated : c));
      sendNotification('Cadet Updated', `${updated.fullName}'s information has been updated.`, 'info');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update cadet');
    }
  };

  const handleDeleteCadet = async (id: string) => {
    if (window.confirm("Are you sure you want to discharge this cadet? This action cannot be undone.")) {
      try {
        await cadetsAPI.delete(id);
        setCadets(prevCadets => prevCadets.filter(c => String(c.id) !== String(id)));
        sendNotification('Cadet Discharged', 'Cadet has been removed from the roster.', 'alert');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete cadet');
      }
    }
  };

  const handleSaveAttendance = async (date: string, records: Record<string, AttendanceStatus>) => {
    try {
      await attendanceAPI.markAttendance(date, records);
      setAttendanceHistory(prev => ({ ...prev, [date]: records }));
      sendNotification('Attendance Saved', `Attendance for ${new Date(date).toDateString()} has been recorded.`, 'info');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleImportData = async (data: any) => {
    // This would need a backend endpoint to handle bulk import
    alert('Data import via API not yet implemented. Please use the migration script.');
  };

  const sendNotification = async (title: string, message: string, type: Notification['type'] = 'info') => {
    try {
      const newNote = await notificationsAPI.create({ title, message, type });
      setNotifications(prev => [newNote, ...prev]);
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // --- Render ---

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading data from server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Connection Error</h2>
          <p className="text-stone-600 mb-4">{error}</p>
          <p className="text-sm text-stone-500 mb-4">Make sure the backend server is running and accessible.</p>
          <button
            onClick={() => loadAllData()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    const renderAdminContent = () => {
      switch (view) {
        case 'dashboard':
          return <Dashboard cadets={cadets} attendanceHistory={attendanceHistory} />;
        case 'roster':
          return <Roster cadets={cadets} onAddCadet={handleAddCadet} onDeleteCadet={handleDeleteCadet} onUpdateCadet={handleUpdateCadet} />;
        case 'attendance':
          return <AttendanceView cadets={cadets} attendanceHistory={attendanceHistory} onSaveAttendance={handleSaveAttendance} />;
        case 'reports':
          return <DrillScheduler cadets={cadets} onNotify={sendNotification} />;
        case 'settings':
          return <Settings
            cadets={cadets}
            attendanceHistory={attendanceHistory}
            notifications={notifications}
            onImportData={handleImportData}
          />;
        default:
          return <Dashboard cadets={cadets} attendanceHistory={attendanceHistory} />;
      }
    };

    return (
      <div className="flex h-screen bg-stone-50 overflow-hidden">
        <Sidebar
          currentView={view}
          onChangeView={setView}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          <Navbar
            user={user}
            notifications={notifications}
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            onLogout={handleLogout}
            onMarkAsRead={markNotificationAsRead}
            onClearNotifications={clearNotifications}
            syncStatus="idle"
          />
          <main className="flex-1 overflow-hidden relative">
            {renderAdminContent()}
          </main>
        </div>
      </div>
    );
  }

  // Cadet View
  if (user.role === 'cadet') {
    const currentCadet = cadets.find(c => c.id === user.cadetId);
    if (!currentCadet) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: Cadet record not found.</p>
            <button onClick={handleLogout} className="bg-stone-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-stone-50 flex-col overflow-hidden">
        <Navbar
          user={user}
          notifications={notifications}
          onToggleSidebar={() => { }}
          onLogout={handleLogout}
          onMarkAsRead={markNotificationAsRead}
          onClearNotifications={clearNotifications}
        />
        <main className="flex-1 overflow-y-auto">
          <CadetDashboard cadet={currentCadet} attendanceHistory={attendanceHistory} />
        </main>
      </div>
    );
  }

  return null;
}

export default App;
