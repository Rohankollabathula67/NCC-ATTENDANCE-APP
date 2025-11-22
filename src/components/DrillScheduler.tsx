import React, { useState } from 'react';
import { generateDrillSchedule } from '../services/geminiService';
import { Cadet } from '../types';
import { CalendarDays, Bot, Loader2, Send } from 'lucide-react';

interface DrillSchedulerProps {
    cadets: Cadet[];
    onNotify: (title: string, message: string, type: 'schedule' | 'info' | 'alert') => void;
}

export const DrillScheduler: React.FC<DrillSchedulerProps> = ({ cadets, onNotify }) => {
  const [focusArea, setFocusArea] = useState('');
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!focusArea.trim()) return;
    setLoading(true);
    const result = await generateDrillSchedule(cadets, focusArea);
    setSchedule(result);
    setLoading(false);
  };

  const handleBroadcast = () => {
    if (!schedule) return;
    
    // Create a simpler message for the notification toast/alert
    const preview = schedule.split('\n').slice(0, 5).join('\n'); // First 5 lines roughly
    
    onNotify(
        `Orders: Training Schedule - ${focusArea}`, 
        `New training schedule generated.\n\nFocus: ${focusArea}\n\n${preview}\n...\nPlease check the notice board for full details.`,
        'schedule'
    );
    alert("Orders broadcasted to all unit members.");
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                <Bot size={24} />
            </div>
            <h2 className="text-2xl font-bold text-stone-800">AI Training Scheduler</h2>
            <p className="text-stone-500 mt-2">Automatically generate structured drill plans based on unit requirements.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200 mb-8">
            <label className="block text-sm font-medium text-stone-700 mb-2">
                Training Focus Area (e.g., "Map Reading", "Weapon Training", "Drill")
            </label>
            <div className="flex gap-3">
                <input 
                    type="text" 
                    className="flex-1 border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter training topic..."
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !focusArea}
                    className="bg-stone-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-stone-900 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <CalendarDays size={18}/>}
                    Generate Plan
                </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {["Map Reading", "0.22 Rifle Drill", "Disaster Management", "Leadership", "Obstacle Course"].map(topic => (
                    <button 
                        key={topic}
                        onClick={() => setFocusArea(topic)}
                        className="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full hover:bg-stone-200 transition-colors"
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </div>

        {schedule && (
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-600 animate-in slide-in-from-bottom-4 duration-500 relative">
                 <div className="absolute top-4 right-4">
                    <button 
                        onClick={handleBroadcast}
                        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors"
                    >
                        <Send size={16} />
                        Broadcast Orders
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <CalendarDays className="text-purple-600"/>
                    Proposed Schedule
                </h3>
                <div className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-th:bg-stone-100 prose-th:p-2 prose-td:p-2">
                    <div className="whitespace-pre-wrap text-sm font-mono bg-stone-50 p-4 rounded-lg border border-stone-200">
                        {schedule}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};