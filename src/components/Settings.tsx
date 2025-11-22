import React, { useRef, useState } from 'react';
import { Download, Upload, Database, AlertTriangle, FileJson, CheckCircle2, Cloud, CloudCog, RefreshCw, Save } from 'lucide-react';
import { Cadet, AttendanceStatus, Notification, CloudConfig, SyncStatus } from '../types';

interface SettingsProps {
  cadets: Cadet[];
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>;
  notifications: Notification[];
  onImportData: (data: any) => void;
  cloudConfig: CloudConfig;
  onUpdateCloudConfig: (config: CloudConfig) => void;
  onForceSync: () => Promise<void>;
  syncStatus: SyncStatus;
}

export const Settings: React.FC<SettingsProps> = ({ 
  cadets, 
  attendanceHistory, 
  notifications, 
  onImportData,
  cloudConfig,
  onUpdateCloudConfig,
  onForceSync,
  syncStatus
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(false);

  const handleExport = () => {
    const data = {
      cadets,
      attendanceHistory,
      notifications,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ncc_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.cadets || !Array.isArray(json.cadets)) {
          throw new Error("Invalid backup file format.");
        }

        if (window.confirm(`Found backup with ${json.cadets.length} cadets. This will OVERWRITE all current data. Continue?`)) {
          onImportData(json);
          setImportStatus({ type: 'success', msg: 'System restored successfully.' });
        }
      } catch (err) {
        setImportStatus({ type: 'error', msg: 'Failed to import file. Invalid format.' });
        console.error(err);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleCloudConfigChange = (key: keyof CloudConfig, value: string | boolean) => {
    onUpdateCloudConfig({
      ...cloudConfig,
      [key]: value
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-4rem)] overflow-y-auto pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
          <Database className="text-stone-600"/>
          System Administration
        </h2>
        <p className="text-stone-500 mt-2">Manage unit database, backups, and cloud synchronization.</p>
      </div>

      {/* Cloud Storage Section - NEW */}
      <div className="bg-white rounded-xl shadow-md border border-stone-200 mb-8 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                        <Cloud size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-stone-800">Cloud Storage (JSONBin.io)</h3>
                        <p className="text-sm text-stone-500">Sync attendance records automatically across devices.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${cloudConfig.apiKey && cloudConfig.binId ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}`}>
                        {cloudConfig.apiKey && cloudConfig.binId ? 'Configured' : 'Not Configured'}
                    </span>
                </div>
            </div>
        </div>

        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase mb-1">JSONBin Master Key (API Key)</label>
                    <input 
                        type={showKeys ? "text" : "password"} 
                        value={cloudConfig.apiKey}
                        onChange={(e) => handleCloudConfigChange('apiKey', e.target.value)}
                        className="w-full border border-stone-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter X-Master-Key"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Bin ID</label>
                    <input 
                        type="text" 
                        value={cloudConfig.binId}
                        onChange={(e) => handleCloudConfigChange('binId', e.target.value)}
                        className="w-full border border-stone-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter Bin ID"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="showKeys"
                    checked={showKeys}
                    onChange={(e) => setShowKeys(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="showKeys" className="text-xs text-stone-500 select-none cursor-pointer">Show API Secrets</label>
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={cloudConfig.autoSync}
                                onChange={(e) => handleCloudConfigChange('autoSync', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <span className="text-sm font-medium text-stone-700">Auto-Sync</span>
                    </div>
                    {cloudConfig.lastSync && (
                        <span className="text-xs text-stone-400">Last synced: {new Date(cloudConfig.lastSync).toLocaleTimeString()}</span>
                    )}
                 </div>

                 <div className="flex gap-2 w-full md:w-auto">
                     <a 
                        href="https://jsonbin.io/app/bins" 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
                     >
                        <CloudCog size={16} />
                        Get Keys
                     </a>
                     <button 
                        onClick={onForceSync}
                        disabled={!cloudConfig.apiKey || !cloudConfig.binId || syncStatus === 'syncing'}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
                     >
                        {syncStatus === 'syncing' ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                     </button>
                 </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Backup Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-600">
                <Download size={18} />
            </div>
            <h3 className="font-bold text-stone-800">Manual Local Backup</h3>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Download a JSON file copy of your database to your local device. Useful for offline archives.
          </p>
          <button 
            onClick={handleExport}
            className="w-full py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <FileJson size={16} />
            Download Backup File
          </button>
        </div>

        {/* Manual Restore Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200">
           <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-600">
                <Upload size={18} />
            </div>
            <h3 className="font-bold text-stone-800">Manual Restore</h3>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Restore system state from a local JSON file. <span className="text-red-600 font-bold">Overwrites current data.</span>
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="w-full py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Upload size={16} />
            Select Backup File
          </button>
          
          {importStatus && (
             <div className={`mt-3 p-2 rounded text-xs font-medium flex items-center gap-2 ${importStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {importStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {importStatus.msg}
             </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-stone-100 p-6 rounded-xl border border-stone-200">
        <h4 className="font-bold text-stone-700 mb-4">Database Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200">
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Total Cadets</div>
                <div className="text-2xl font-bold text-stone-800">{cadets.length}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200">
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Attendance Days</div>
                <div className="text-2xl font-bold text-stone-800">{Object.keys(attendanceHistory).length}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200">
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">Notifications</div>
                <div className="text-2xl font-bold text-stone-800">{notifications.length}</div>
            </div>
        </div>
      </div>
    </div>
  );
};
