import React, { useState } from 'react';
import { Cadet, Rank, Wing } from '../types';
import { PLATOONS } from '../constants';
import { Plus, Trash2, Search, UserPlus, AlertCircle, KeyRound, Pencil } from 'lucide-react';

interface RosterProps {
  cadets: Cadet[];
  onAddCadet: (cadet: Cadet) => void;
  onDeleteCadet: (id: string) => void;
  onUpdateCadet: (cadet: Cadet) => void;
}

export const Roster: React.FC<RosterProps> = ({ cadets, onAddCadet, onDeleteCadet, onUpdateCadet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newCadet, setNewCadet] = useState<Partial<Cadet>>({
    rank: Rank.CADET,
    wing: Wing.ARMY,
    platoon: PLATOONS[0],
    password: ''
  });

  const resetForm = () => {
    setNewCadet({ rank: Rank.CADET, wing: Wing.ARMY, platoon: PLATOONS[0], fullName: '', regimentalNumber: '', password: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (newCadet.fullName && newCadet.regimentalNumber) {
        if (editingId) {
            // Update existing
            onUpdateCadet({
                ...newCadet,
                id: editingId
            } as Cadet);
        } else {
            // Add new
            if (!newCadet.password) {
                alert("Password is required for new cadets.");
                return;
            }
            onAddCadet({
                id: Date.now().toString(),
                joinDate: new Date().toISOString().split('T')[0],
                ...newCadet
            } as Cadet);
        }
        resetForm();
    }
  };

  const handleEditClick = (e: React.MouseEvent, cadet: Cadet) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingId(cadet.id);
      setNewCadet({ ...cadet });
      setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteCadet(id);
  };

  const filteredCadets = cadets.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.regimentalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
        <h2 className="text-2xl font-bold text-stone-800 self-start md:self-center">Nominal Roll</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search cadets..." 
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 flex items-center justify-center gap-2 text-sm font-medium transition-colors w-full sm:w-auto"
          >
            <Plus size={18} />
            Add Cadet
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1 w-full">
          <table className="w-full text-left text-sm min-w-[800px] md:min-w-0">
            <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 uppercase text-xs font-semibold tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3 md:p-4 w-32 border-r border-stone-200">Rank</th>
                <th className="p-3 md:p-4 border-r border-stone-200">Name</th>
                <th className="p-3 md:p-4 border-r border-stone-200">Regimental No.</th>
                <th className="p-3 md:p-4 hidden sm:table-cell">Join Date</th>
                <th className="p-3 md:p-4 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCadets.map((cadet) => (
                <tr key={cadet.id} className="hover:bg-stone-50 transition-colors group relative">
                  {/* Rank Column - Distinct */}
                  <td className="p-3 md:p-4 border-r border-stone-100">
                     <span className="text-stone-800 font-bold text-xs md:text-sm block">
                        {cadet.rank}
                     </span>
                  </td>
                  {/* Name Column - Distinct */}
                  <td className="p-3 md:p-4 border-r border-stone-100">
                     <span className="text-stone-800 text-xs md:text-sm font-medium block">
                        {cadet.fullName}
                     </span>
                  </td>
                  <td className="p-3 md:p-4 border-r border-stone-100 font-mono text-stone-500 text-xs md:text-sm">
                    {cadet.regimentalNumber}
                  </td>
                  <td className="p-3 md:p-4 text-stone-500 text-xs md:text-sm hidden sm:table-cell">
                    {cadet.joinDate}
                  </td>
                  <td className="p-3 md:p-4 text-right relative z-20">
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button"
                            onClick={(e) => handleEditClick(e, cadet)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all"
                            title="Edit Cadet"
                        >
                            <Pencil size={18} className="pointer-events-none" />
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => handleDeleteClick(e, cadet.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Discharge Cadet"
                        >
                            <Trash2 size={18} className="pointer-events-none" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCadets.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400 flex flex-col items-center justify-center w-full">
                    <AlertCircle size={32} className="mb-2 opacity-20" />
                    <span>No cadets found matching criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Cadet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-stone-800 px-6 py-4 flex items-center gap-3">
              <UserPlus className="text-white" size={20} />
              <h3 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Cadet Service Record' : 'Enlist New Cadet'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Rank</label>
                <select 
                  className="w-full border border-stone-300 rounded-lg p-2 text-sm bg-white"
                  value={newCadet.rank}
                  onChange={e => setNewCadet({...newCadet, rank: e.target.value as Rank})}
                >
                  {Object.values(Rank).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Full Name</label>
                <input 
                  className="w-full border border-stone-300 rounded-lg p-2 text-sm"
                  placeholder="e.g. Rahul Sharma"
                  value={newCadet.fullName}
                  onChange={e => setNewCadet({...newCadet, fullName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Regimental Number</label>
                <input 
                  className="w-full border border-stone-300 rounded-lg p-2 text-sm"
                  placeholder="e.g. KA/24/SD/1001"
                  value={newCadet.regimentalNumber}
                  onChange={e => setNewCadet({...newCadet, regimentalNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase mb-1 flex items-center gap-1">
                    <KeyRound size={12}/> {editingId ? 'Reset Password' : 'Initial Password'}
                </label>
                <input 
                  className="w-full border border-stone-300 rounded-lg p-2 text-sm"
                  placeholder={editingId ? "Leave blank to keep current password" : "Set login password"}
                  type="text"
                  value={newCadet.password}
                  onChange={e => setNewCadet({...newCadet, password: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Platoon</label>
                    <select 
                    className="w-full border border-stone-300 rounded-lg p-2 text-sm bg-white"
                    value={newCadet.platoon}
                    onChange={e => setNewCadet({...newCadet, platoon: e.target.value})}
                    >
                    {PLATOONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Wing</label>
                    <select 
                    className="w-full border border-stone-300 rounded-lg p-2 text-sm bg-white"
                    value={newCadet.wing}
                    onChange={e => setNewCadet({...newCadet, wing: e.target.value as Wing})}
                    >
                    {Object.values(Wing).map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!newCadet.fullName || !newCadet.regimentalNumber || (!editingId && !newCadet.password)}
                  className="flex-1 py-2 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 text-white rounded-lg font-medium shadow-sm"
                >
                  {editingId ? 'Update Record' : 'Enlist Cadet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
