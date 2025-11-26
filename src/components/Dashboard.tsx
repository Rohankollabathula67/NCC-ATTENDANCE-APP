import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Cadet, AttendanceStatus, Rank } from '../types';
import { generateExecutiveSummary } from '../services/geminiService';
import { Sparkles, Activity, Users, UserX, Calendar } from 'lucide-react';

interface DashboardProps {
  cadets: Cadet[];
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>;
}

const COLORS = ['#166534', '#991b1b', '#ca8a04', '#1e3a8a']; // Green, Red, Yellow, Blue

export const Dashboard: React.FC<DashboardProps> = ({ cadets, attendanceHistory }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Calculate today's stats (or most recent date)
  const dates = Object.keys(attendanceHistory).sort().reverse();
  const latestDate = dates[0] || new Date().toISOString().split('T')[0];
  const latestRecords = attendanceHistory[latestDate] || {};

  const stats = {
    present: 0,
    absent: 0,
    leave: 0,
    duty: 0
  };

  cadets.forEach(c => {
    const status = latestRecords[c.id];
    if (status === AttendanceStatus.PRESENT) stats.present++;
    else if (status === AttendanceStatus.ABSENT) stats.absent++;
    else if (status === AttendanceStatus.LEAVE) stats.leave++;
    else if (status === AttendanceStatus.DUTY) stats.duty++;
    else stats.absent++; // Default to absent for stats if not marked
  });

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
    { name: 'Leave', value: stats.leave },
    { name: 'Duty', value: stats.duty },
  ].filter(d => d.value > 0);

  // Weekly trend
  const weeklyData = dates.slice(0, 7).reverse().map(date => {
    const recs = attendanceHistory[date];
    const p = Object.values(recs).filter(s => s === AttendanceStatus.PRESENT).length;
    const d = new Date(date);
    return { 
        date: `${d.getDate()}/${d.getMonth() + 1}`, 
        present: p 
    };
  });

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    const result = await generateExecutiveSummary(cadets, attendanceHistory, latestDate);
    setReport(result);
    setLoadingReport(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Unit Dashboard</h2>
          <p className="text-stone-500 text-sm">Overview for {new Date(latestDate).toDateString()}</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={loadingReport}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 md:py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
        >
          <Sparkles size={18} />
          {loadingReport ? "Generating Analysis..." : "Generate CO's Briefing"}
        </button>
      </div>

      {/* Report Card */}
      {report && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
          <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500"/> 
            AI Situation Report
          </h3>
          <div className="prose prose-stone max-w-none text-xs md:text-sm whitespace-pre-wrap bg-stone-50 p-4 rounded-lg border border-stone-200 font-mono max-h-60 overflow-y-auto">
            {report}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Strength" value={cadets.length} icon={<Users className="text-blue-600" size={20} />} color="bg-blue-50 border-blue-200" />
        <StatCard title="Present" value={stats.present} icon={<Activity className="text-green-600" size={20} />} color="bg-green-50 border-green-200" />
        <StatCard title="Absent" value={stats.absent} icon={<UserX className="text-red-600" size={20} />} color="bg-red-50 border-red-200" />
        <StatCard title="Other" value={stats.leave + stats.duty} icon={<Calendar className="text-yellow-600" size={20} />} color="bg-yellow-50 border-yellow-200" />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-stone-200">
          <h3 className="font-semibold text-stone-700 mb-4">Parade State Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-x-4 gap-y-2 mt-2 flex-wrap">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  {/* <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div> */}
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-stone-200">
          <h3 className="font-semibold text-stone-700 mb-4">Weekly Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} allowDecimals={false} width={30} />
                <Tooltip cursor={{fill: '#f5f5f4'}} />
                <Bar dataKey="present" fill="#166534" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="h-8"></div> {/* Spacing for bottom on mobile */}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`p-3 md:p-4 rounded-lg border ${color} flex items-center justify-between`}>
    <div>
      <p className="text-stone-500 text-[10px] md:text-xs font-medium uppercase tracking-wider">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-stone-800 mt-1">{value}</p>
    </div>
    <div className="p-2 md:p-3 bg-white rounded-full shadow-sm">
      {icon}
    </div>
  </div>
);