import React from 'react';
import { LayoutDashboard, Users, ClipboardCheck, FileText, LogOut, X, Settings } from 'lucide-react';
import { AppView } from '../types';
import { clsx } from 'clsx';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, onLogout }) => {
  const menuItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'attendance', label: 'Attendance Parade', icon: <ClipboardCheck size={20} /> },
    { id: 'roster', label: 'Nominal Roll', icon: <Users size={20} /> },
    { id: 'reports', label: 'Drill Scheduler (AI)', icon: <FileText size={20} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <div className={clsx(
        "fixed top-0 left-0 h-full w-64 bg-stone-900 text-stone-300 z-40 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col border-r border-stone-800",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:relative md:h-auto md:shadow-none md:translate-x-0" // Reset on desktop
      )}>
        {/* Mobile Close Button */}
        <div className="md:hidden p-4 flex justify-end">
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Main Menu</div>
            <nav className="space-y-2">
            {menuItems.map((item) => (
                <button
                key={item.id}
                onClick={() => {
                    onChangeView(item.id);
                    onClose();
                }}
                className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    currentView === item.id 
                    ? "bg-red-700 text-white shadow-lg" 
                    : "hover:bg-stone-800 hover:text-white"
                )}
                >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                </button>
            ))}
            </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-800">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-stone-400 hover:text-red-400 transition-colors w-full px-4 py-2"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
          <p className="text-[10px] text-stone-600 mt-4 text-center">
            v1.3.0 | NCC Digital Ops
          </p>
        </div>
      </div>
    </>
  );
};