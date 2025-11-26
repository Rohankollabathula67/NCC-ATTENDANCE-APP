import React, { useState, useRef, useEffect } from 'react';
import { Shield, Menu, LogOut, Bell, Cloud, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { User, Notification, SyncStatus } from '../types';
import { clsx } from 'clsx';

interface NavbarProps {
  user: User;
  notifications: Notification[];
  onToggleSidebar: () => void;
  onLogout: () => void;
  onMarkAsRead: (id: string) => void;
  onClearNotifications: () => void;
  syncStatus?: SyncStatus;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  notifications, 
  onToggleSidebar, 
  onLogout,
  onMarkAsRead,
  onClearNotifications,
  syncStatus = 'idle'
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to the current user
  const myNotifications = notifications.filter(n => 
    n.recipientId === 'all' || 
    n.recipientId === user.id || 
    (user.role === 'cadet' && n.recipientId === user.cadetId)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = myNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  const getSyncIcon = () => {
      if (user.role !== 'admin') return null;
      switch(syncStatus) {
          case 'syncing': return <div className="flex items-center gap-1 text-indigo-300 text-xs"><RefreshCw size={14} className="animate-spin" /> <span className="hidden sm:inline">Syncing</span></div>;
          case 'saved': return <div className="flex items-center gap-1 text-green-400 text-xs"><Check size={14} /> <span className="hidden sm:inline">Saved</span></div>;
          case 'error': return <div className="flex items-center gap-1 text-red-400 text-xs"><AlertCircle size={14} /> <span className="hidden sm:inline">Error</span></div>;
          default: return <div className="flex items-center gap-1 text-stone-500 text-xs opacity-50"><Cloud size={14} /></div>;
      }
  };

  return (
    <div className="h-16 bg-stone-900 text-white flex items-center px-4 shadow-md border-b-4 border-b-red-700 relative z-20 flex-shrink-0 justify-between md:justify-start">
        {/* NCC Tricolor accent line inside the nav */}
      <div className="absolute bottom-0 left-0 right-0 h-1 flex">
        <div className="w-1/3 bg-red-600 h-full"></div>
        <div className="w-1/3 bg-blue-900 h-full"></div>
        <div className="w-1/3 bg-sky-500 h-full"></div>
      </div>

      <div className="flex items-center gap-3">
        {user.role === 'admin' && (
            <button 
                onClick={onToggleSidebar} 
                className="md:hidden p-2 -ml-2 hover:bg-stone-800 rounded-lg text-stone-300"
                title="Toggle Sidebar"
            >
                <Menu size={24} />
            </button>
        )}
        <img className="h-10 w-8" src="src/assets/Images/Emblem_of_National_Cadet_Corps_(India).png" alt="National Cadet Corps Emblem" />
        <div>
          <h1 className="text-base md:text-lg font-bold tracking-wide uppercase hidden xs:block leading-tight">NCC Command Center</h1>
          <h1 className="text-base font-bold tracking-wide uppercase xs:hidden">NCC</h1>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider hidden sm:block">Unit Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Sync Status Indicator (Admin Only) */}
        {user.role === 'admin' && (
            <div className="mr-2 px-2 py-1 rounded-full bg-stone-800/50 border border-stone-700" title="Cloud Sync Status">
                {getSyncIcon()}
            </div>
        )}

        {/* Notification Center */}
        <div className="relative" ref={notificationRef}>
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-stone-900 shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-[-3rem] xs:right-0 mt-3 w-[90vw] sm:w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50 mr-2 xs:mr-0">
                    <div className="p-4 bg-stone-100 border-b border-stone-200 flex justify-between items-center">
                        <h3 className="font-bold text-stone-700 text-sm uppercase tracking-wide">Unit Orders & Alerts</h3>
                        {myNotifications.length > 0 && (
                            <button onClick={onClearNotifications} className="text-xs text-stone-500 hover:text-red-600 underline">
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto divide-y divide-stone-100">
                        {myNotifications.length === 0 ? (
                            <div className="p-8 text-center text-stone-400 text-sm">
                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                No new notifications
                            </div>
                        ) : (
                            myNotifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className={clsx(
                                        "p-4 hover:bg-stone-50 transition-colors cursor-pointer relative",
                                        !notification.read ? "bg-blue-50/50" : ""
                                    )}
                                >
                                    {!notification.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className={clsx("text-sm font-bold line-clamp-1", !notification.read ? "text-blue-900" : "text-stone-700")}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[10px] text-stone-400 whitespace-nowrap flex-shrink-0">{formatTime(notification.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-stone-600 mt-1 line-clamp-3 whitespace-pre-line">
                                        {notification.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="hidden md:block text-right border-r border-stone-700 pr-4 mr-1">
          <p className="text-sm font-medium text-stone-200">{user.name}</p>
          <p className="text-xs text-stone-500">{user.rank}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-stone-700 border-2 border-stone-600 flex items-center justify-center text-xs font-bold text-stone-300 flex-shrink-0">
          {user.role === 'admin' ? 'CO' : user.name.charAt(0)}
        </div>
        <button 
            onClick={onLogout}
            className="ml-0 md:ml-2 p-2 text-stone-400 hover:text-red-500 hover:bg-stone-800 rounded-full transition-colors"
            title="Logout"
        >
            <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};
