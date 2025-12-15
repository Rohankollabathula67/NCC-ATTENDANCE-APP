import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Roster } from './components/Roster';
import { AttendanceView } from './components/AttendanceView';
import { DrillScheduler } from './components/DrillScheduler';
import { Login } from './components/Login';
import { CadetDashboard } from './components/CadetDashboard';
import { Settings } from './components/Settings';
import { AppView, Cadet, AttendanceStatus, User, Notification, CloudConfig, SyncStatus } from './types';
import { MOCK_CADETS, MOCK_ATTENDANCE } from './constants';
import { saveToCloud, loadFromCloud } from './services/cloudStorage';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ncc_user_realtime');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [view, setView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // --- Data State ---
  const [cadets, setCadets] = useState<Cadet[]>(() => {
    const saved = localStorage.getItem('ncc_cadets_realtime');
    return saved ? JSON.parse(saved) : MOCK_CADETS;
  });

  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, Record<string, AttendanceStatus>>>(() => {
    const saved = localStorage.getItem('ncc_attendance_realtime');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('ncc_notifications_realtime');
    if (!saved) {
        return [{
            id: 'init-1',
            title: 'Welcome to Command Center',
            message: 'System initialized. Ready for operations.',
            timestamp: new Date().toISOString(),
            read: false,
            recipientId: 'all',
            type: 'info'
        }];
    }
    return JSON.parse(saved);
  });

  // --- Cloud Config State ---
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(() => {
    const saved = localStorage.getItem('ncc_cloud_config');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      binId: '',
      autoSync: false,
      lastSync: null
    };
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const autoSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Effects ---

  // Local Storage Persistence
  useEffect(() => { localStorage.setItem('ncc_cadets_realtime', JSON.stringify(cadets)); }, [cadets]);
  useEffect(() => { localStorage.setItem('ncc_attendance_realtime', JSON.stringify(attendanceHistory)); }, [attendanceHistory]);
  useEffect(() => { localStorage.setItem('ncc_notifications_realtime', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ncc_cloud_config', JSON.stringify(cloudConfig)); }, [cloudConfig]);
  useEffect(() => {
    if (user) localStorage.setItem('ncc_user_realtime', JSON.stringify(user));
    else localStorage.removeItem('ncc_user_realtime');
  }, [user]);

  // Validate Session
  useEffect(() => {
      if (user?.role === 'cadet') {
          const exists = cadets.find(c => c.id === user.cadetId);
          if (!exists) setUser(null);
      }
  }, [user, cadets]);

  // --- Auto-Sync Logic ---
  const triggerSync = async () => {
    if (!cloudConfig.apiKey || !cloudConfig.binId) return;
    
    setSyncStatus('syncing');
    try {
      await saveToCloud(cloudConfig, { cadets, attendanceHistory, notifications });
      setSyncStatus('saved');
      setCloudConfig(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      // Reset status after 3s
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (cloudConfig.autoSync && cloudConfig.apiKey && cloudConfig.binId) {
      if (autoSyncTimeoutRef.current) clearTimeout(autoSyncTimeoutRef.current);
      
      // Debounce sync 2 seconds after last change
      autoSyncTimeoutRef.current = setTimeout(() => {
        triggerSync();
      }, 2000);
    }
    return () => {
      if (autoSyncTimeoutRef.current) clearTimeout(autoSyncTimeoutRef.current);
    };
  }, [cadets, attendanceHistory, notifications, cloudConfig.autoSync]);

  // --- Cloud Load from Remote ---
  useEffect(() => {
    const loadDataFromCloud = async () => {
      if (!cloudConfig.apiKey || !cloudConfig.binId) return;
      try {
        const cloudData = await loadFromCloud(cloudConfig);
        if (cloudData) {
          setCadets(cloudData.cadets);
          setAttendanceHistory(cloudData.attendanceHistory);
          setNotifications(cloudData.notifications);
        }
      } catch (error) {
        console.error('Failed to load cloud data:', error);
      }
    };

    loadDataFromCloud();
  }, [cloudConfig.apiKey, cloudConfig.binId]);

  // --- Handlers ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
  };

  const handleAddCadet = (cadet: Cadet) => {
    setCadets([...cadets, cadet]);
  };

  const handleUpdateCadet = (updatedCadet: Cadet) => {
    setCadets(prev => prev.map(c => c.id === updatedCadet.id ? updatedCadet : c));
  };

  const handleDeleteCadet = (id: string) => {
    if (window.confirm("Are you sure you want to discharge this cadet? This action cannot be undone.")) {
      setCadets(prevCadets => prevCadets.filter(c => String(c.id) !== String(id)));
    }
  };

  const handleSaveAttendance = (date: string, records: Record<string, AttendanceStatus>) => {
    setAttendanceHistory(prev => ({ ...prev, [date]: records }));
  };

  const handleImportData = (data: any) => {
    if (data.cadets) setCadets(data.cadets);
    if (data.attendanceHistory) setAttendanceHistory(data.attendanceHistory);
    if (data.notifications) setNotifications(data.notifications);
  };

  const sendNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNote: Notification = {
        id: Date.now().toString(),
        title, message, timestamp: new Date().toISOString(),
        read: false, recipientId: 'all', type
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Cloud Actions
  const handleUpdateCloudConfig = (config: CloudConfig) => {
    setCloudConfig(config);
  };

  const handleForceSync = async () => {
      await triggerSync();
  };

  // --- Render ---

  if (!user) {
    return <Login cadets={cadets} onLogin={handleLogin} />;
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
                      cloudConfig={cloudConfig}
                      onUpdateCloudConfig={handleUpdateCloudConfig}
                      onForceSync={handleForceSync}
                      syncStatus={syncStatus}
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
                syncStatus={syncStatus}
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
      if (!currentCadet) return <div>Error: Cadet record not found.</div>;

      return (
          <div className="flex h-screen bg-stone-50 flex-col overflow-hidden">
              <Navbar 
                user={user} 
                notifications={notifications}
                onToggleSidebar={() => {}} 
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
