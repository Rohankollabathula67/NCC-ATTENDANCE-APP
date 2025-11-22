import React, { useState, useEffect } from 'react';
import { Cadet, AttendanceStatus } from '../types';
import { Calendar as CalendarIcon, Check, X, Clock, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

interface AttendanceViewProps {
  cadets: Cadet[];
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>;
  onSaveAttendance: (date: string, records: Record<string, AttendanceStatus>) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ cadets, attendanceHistory, onSaveAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [filterPlatoon, setFilterPlatoon] = useState<string>('All');

  // Load existing data when date changes
  useEffect(() => {
    if (attendanceHistory[selectedDate]) {
      setRecords(attendanceHistory[selectedDate]);
    } else {
      const initial: Record<string, AttendanceStatus> = {};
      cadets.forEach(c => initial[c.id] = AttendanceStatus.PRESENT);
      setRecords(initial);
    }
  }, [selectedDate, attendanceHistory, cadets]);

  const handleMark = (id: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = () => {
    onSaveAttendance(selectedDate, records);
    alert("Attendance Parade State Saved.");
  };

  const markAll = (status: AttendanceStatus) => {
    const newRecords = { ...records };
    visibleCadets.forEach(c => newRecords[c.id] = status);
    setRecords(newRecords);
  };

  const platoons = ['All', ...Array.from(new Set(cadets.map(c => c.platoon)))];
  const visibleCadets = filterPlatoon === 'All' ? cadets : cadets.filter(c => c.platoon === filterPlatoon);

  // Stats for current selection
  const currentPresent = visibleCadets.filter(c => records[c.id] === AttendanceStatus.PRESENT).length;

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-stone-100 p-2 md:p-3 rounded-lg">
                <CalendarIcon className="text-stone-600" size={20} />
            </div>
            <div className="flex-1">
                <h2 className="text-base md:text-lg font-bold text-stone-800 leading-tight">Mark Attendance</h2>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs md:text-sm text-stone-500 bg-transparent border-none p-0 focus:ring-0 cursor-pointer w-full"
                />
            </div>
          </div>

          <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 md:gap-3 min-w-max pb-1">
                {platoons.map(p => (
                    <button
                        key={p}
                        onClick={() => setFilterPlatoon(p)}
                        className={clsx(
                            "px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                            filterPlatoon === p 
                                ? "bg-stone-800 text-white shadow-md" 
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        )}
                    >
                        {p === 'All' ? 'All' : `Platoon ${p}`}
                    </button>
                ))}
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors w-full md:w-auto text-sm"
          >
            Save Roll Call
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 flex flex-col xs:flex-row items-start xs:items-center justify-between border-t border-stone-100 pt-3 gap-2">
            <div className="text-xs md:text-sm text-stone-500">
                Present: <span className="font-bold text-green-700">{currentPresent}</span> / {visibleCadets.length}
            </div>
            <div className="flex gap-2 w-full xs:w-auto">
                <button onClick={() => markAll(AttendanceStatus.PRESENT)} className="flex-1 xs:flex-none text-center text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded transition-colors">All Present</button>
                <button onClick={() => markAll(AttendanceStatus.ABSENT)} className="flex-1 xs:flex-none text-center text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded transition-colors">All Absent</button>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-stone-200">
        <div className="grid grid-cols-1">
            {visibleCadets.map((cadet) => (
                <div key={cadet.id} className="flex flex-col xs:flex-row xs:items-center p-3 md:p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded bg-stone-50">{cadet.platoon}</span>
                            <span className="font-bold text-stone-800 text-sm">{cadet.rank} {cadet.fullName}</span>
                        </div>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">{cadet.regimentalNumber}</p>
                    </div>
                    
                    <div className="flex gap-1 bg-stone-100 p-1 rounded-lg self-start xs:self-auto w-full xs:w-auto justify-between xs:justify-start">
                        <StatusButton 
                            active={records[cadet.id] === AttendanceStatus.PRESENT} 
                            onClick={() => handleMark(cadet.id, AttendanceStatus.PRESENT)}
                            type="present"
                            label="P"
                        />
                        <StatusButton 
                            active={records[cadet.id] === AttendanceStatus.ABSENT} 
                            onClick={() => handleMark(cadet.id, AttendanceStatus.ABSENT)}
                            type="absent"
                            label="A"
                        />
                        <StatusButton 
                            active={records[cadet.id] === AttendanceStatus.LEAVE} 
                            onClick={() => handleMark(cadet.id, AttendanceStatus.LEAVE)}
                            type="leave"
                            label="L"
                        />
                         <StatusButton 
                            active={records[cadet.id] === AttendanceStatus.DUTY} 
                            onClick={() => handleMark(cadet.id, AttendanceStatus.DUTY)}
                            type="duty"
                            label="D"
                        />
                    </div>
                </div>
            ))}
             {visibleCadets.length === 0 && (
                <div className="p-12 text-center text-stone-400">
                  No cadets in this list.
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

const StatusButton: React.FC<{ active: boolean, onClick: () => void, type: 'present' | 'absent' | 'leave' | 'duty', label: string }> = ({ active, onClick, type, label }) => {
    const baseStyle = "w-full xs:w-9 h-8 xs:h-9 rounded-md flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-200";
    const styles = {
        present: active ? "bg-green-600 text-white shadow-md" : "text-stone-400 hover:bg-stone-200 bg-white xs:bg-transparent",
        absent: active ? "bg-red-600 text-white shadow-md" : "text-stone-400 hover:bg-stone-200 bg-white xs:bg-transparent",
        leave: active ? "bg-yellow-500 text-white shadow-md" : "text-stone-400 hover:bg-stone-200 bg-white xs:bg-transparent",
        duty: active ? "bg-blue-600 text-white shadow-md" : "text-stone-400 hover:bg-stone-200 bg-white xs:bg-transparent"
    };

    const icons = {
        present: <Check size={14} />,
        absent: <X size={14} />,
        leave: <Clock size={14} />,
        duty: <ShieldAlert size={14} />
    };

    return (
        <button onClick={onClick} className={clsx(baseStyle, styles[type])} title={type}>
            {active ? icons[type] : label}
        </button>
    );
};