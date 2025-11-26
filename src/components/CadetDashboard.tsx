import React from 'react';
import { AttendanceStatus, Cadet } from '../types';
import { Check, X, Clock, ShieldAlert, Calendar, TrendingUp, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CadetDashboardProps {
  cadet: Cadet;
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>;
}

const COLORS = ['#166534', '#991b1b', '#ca8a04', '#1e3a8a'];

export const CadetDashboard: React.FC<CadetDashboardProps> = ({ cadet, attendanceHistory }) => {
  const dates = Object.keys(attendanceHistory).sort().reverse();
  
  const stats = {
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    duty: 0
  };

  const history = dates.map(date => {
    const status = attendanceHistory[date][cadet.id] || AttendanceStatus.ABSENT; 
    stats.total++;
    if (status === AttendanceStatus.PRESENT) stats.present++;
    else if (status === AttendanceStatus.ABSENT) stats.absent++;
    else if (status === AttendanceStatus.LEAVE) stats.leave++;
    else if (status === AttendanceStatus.DUTY) stats.duty++;

    return { date, status };
  });

  const attendancePercentage = stats.total > 0 ? Math.round(((stats.present + stats.duty) / stats.total) * 100) : 0;

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
    { name: 'Leave', value: stats.leave },
    { name: 'Duty', value: stats.duty },
  ].filter(d => d.value > 0);

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return <Check size={14} className="text-green-600" />;
      case AttendanceStatus.ABSENT: return <X size={14} className="text-red-600" />;
      case AttendanceStatus.LEAVE: return <Clock size={14} className="text-yellow-600" />;
      case AttendanceStatus.DUTY: return <ShieldAlert size={14} className="text-blue-600" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return "bg-green-50 text-green-700 border-green-200";
      case AttendanceStatus.ABSENT: return "bg-red-50 text-red-700 border-red-200";
      case AttendanceStatus.LEAVE: return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case AttendanceStatus.DUTY: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">
      <div className="mb-6 md:mb-8 bg-stone-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-stone-800 to-transparent opacity-50"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-stone-900 font-bold text-xl shadow-md border-2 border-white flex-shrink-0">
                    {cadet.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold truncate">{cadet.rank} | {cadet.fullName}</h2>
                    <p className="text-stone-400 font-mono text-xs md:text-sm truncate">{cadet.regimentalNumber}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-[10px] md:text-xs border border-stone-700 whitespace-nowrap">{cadet.wing} Wing</span>
                <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-[10px] md:text-xs border border-stone-700 whitespace-nowrap">Platoon {cadet.platoon}</span>
                <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-[10px] md:text-xs border border-stone-700 whitespace-nowrap">Joined: {cadet.joinDate}</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Main Stat Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center justify-center text-center">
            <div className="mb-2 p-3 bg-blue-50 rounded-full text-blue-600">
                <TrendingUp size={24} />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-stone-800 mb-1">{attendancePercentage}%</div>
            <div className="text-xs md:text-sm text-stone-500 font-medium uppercase tracking-wider">Attendance Rate</div>
            <div className="mt-4 w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            </div>
             <p className="text-xs text-stone-400 mt-2">{attendancePercentage >= 75 ? "Good standing" : "Improvement needed"}</p>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center gap-6 md:gap-8">
            <div className="h-40 w-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                <StatBox label="Total Parades" value={stats.total} icon={<Calendar size={16} />} color="bg-stone-100 text-stone-600" />
                <StatBox label="Present" value={stats.present} icon={<Check size={16} />} color="bg-green-50 text-green-700" />
                <StatBox label="Absent" value={stats.absent} icon={<X size={16} />} color="bg-red-50 text-red-700" />
                <StatBox label="Duty/Leave" value={stats.duty + stats.leave} icon={<Award size={16} />} color="bg-blue-50 text-blue-700" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 text-sm md:text-base">
                <Calendar size={18} className="text-stone-500"/>
                Attendance History
            </h3>
        </div>
        <div className="divide-y divide-stone-100">
            {history.map((item) => (
                <div key={item.date} className="p-3 md:p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="text-xs md:text-sm font-medium text-stone-600">
                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                    </div>
                </div>
            ))}
             {history.length === 0 && (
                <div className="p-8 text-center text-stone-400 text-sm">No attendance records found.</div>
            )}
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className={`p-3 rounded-lg ${color} flex items-center justify-between`}>
        <div className="flex flex-col">
             <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
             <span className="text-lg md:text-xl font-bold">{value}</span>
        </div>
        {icon}
    </div>
);