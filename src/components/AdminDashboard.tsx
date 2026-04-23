import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, UserCheck, ShieldCheck, X } from 'lucide-react';
import { Sighting, SightingStatus, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  sightings: Sighting[];
  onUpdateStatus: (id: string, status: SightingStatus) => void;
}

export const AdminDashboard: React.FC<Props> = ({ sightings, onUpdateStatus }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [officers, setOfficers] = useState<User[]>([]);
  const [activeView, setActiveView] = useState<'sightings' | 'officers'>('sightings');

  const stats = {
    total: sightings.length,
    pending: sightings.filter(s => s.status === 'Pending').length,
    danger: sightings.filter(s => s.isDanger && s.status === 'Approved').length
  };

  const fetchOfficers = async () => {
    try {
      const response = await fetch('/api/admin/officers');
      const data = await response.json();
      setOfficers(data);
    } catch (error) {
      console.error("Failed to fetch officers", error);
    }
  };

  useEffect(() => {
    if (activeView === 'officers') fetchOfficers();
  }, [activeView]);

  const handleApproveOfficer = async (id: string) => {
    try {
      await fetch(`/api/admin/officers/${id}/approve`, { method: 'POST' });
      fetchOfficers();
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  return (
    <div className="space-y-12 pb-20 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="nature-card p-8 bg-slate-900 text-white shadow-xl shadow-slate-900/10">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified Logs</p>
          <p className="text-4xl font-serif italic mt-2">{stats.total - stats.pending} Approved</p>
        </div>
        <div className="nature-card p-8 bg-white border-slate-200 border text-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Queue Status</p>
          <p className="text-4xl font-serif italic mt-2">{stats.pending} Pending</p>
        </div>
        <div className="nature-card p-8 bg-rose-700 text-white shadow-xl shadow-rose-900/10">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Critical Threats</p>
          <p className="text-4xl font-serif italic mt-2">{stats.danger} Alerts</p>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-5xl font-serif text-primary italic">WildEye Dashboard</h1>
          <p className="text-neutral-500 text-sm">Managing biodiversity data with precision.</p>
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm">
          <button 
            onClick={() => setActiveView('sightings')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'sightings' ? 'bg-primary shadow-sm text-white' : 'text-neutral-400 hover:text-primary'}`}
          >
            Sightings
          </button>
          <button 
            onClick={() => setActiveView('officers')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'officers' ? 'bg-primary shadow-sm text-white' : 'text-neutral-400 hover:text-primary'}`}
          >
            Officers
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'sightings' ? (
          <motion.div 
            key="sightings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="nature-card"
          >
            <div className="bg-slate-50 p-5 border-b border-slate-100 grid grid-cols-[1.2fr,2fr,1fr,1fr] text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Plate ID / Animal</span>
              <span>Images & Confidence</span>
              <span>Node / Status</span>
              <span className="text-right">Manage</span>
            </div>

            <div className="divide-y divide-slate-100">
              {sightings.length === 0 ? (
                <div className="p-20 text-center text-slate-300 italic font-serif text-xl">No pending logs found.</div>
              ) : (
                sightings.map(s => (
                  <div key={s.id} className="grid grid-cols-[1.2fr,2fr,1fr,1fr] items-center p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col space-y-1">
                      <span className="font-serif text-xl italic text-slate-900 leading-tight">{s.animalType}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.id.toUpperCase()} • {new Date(s.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex -space-x-4">
                        {s.images.map((img, i) => (
                          <div 
                            key={i} 
                            onClick={() => setSelectedImage(img)}
                            className="inline-block h-14 w-14 rounded-[18px] ring-4 ring-white overflow-hidden bg-slate-100 shadow-sm cursor-zoom-in hover:scale-110 transition-transform relative group"
                          >
                            <img src={img} alt="Sighting" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye size={16} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${s.confidenceScore}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{s.confidenceScore}% Acc.</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{s.location}</span>
                      <div>
                        {s.status === 'Pending' && (
                          <span className="status-badge status-pending">Pending</span>
                        )}
                        {s.status === 'Approved' && (
                          <span className="status-badge status-approved">Approved</span>
                        )}
                        {s.status === 'Rejected' && (
                          <span className="status-badge status-rejected">Rejected</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 px-2">
                      {s.status === 'Pending' ? (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(s.id, 'Approved')}
                            className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-full transition-all hover:scale-110 active:scale-90"
                            title="Approve Log"
                          >
                            <CheckCircle size={22} />
                          </button>
                          <button 
                            onClick={() => onUpdateStatus(s.id, 'Rejected')}
                            className="p-3 text-rose-600 hover:bg-rose-50 rounded-full transition-all hover:scale-110 active:scale-90"
                            title="Reject Log"
                          >
                            <XCircle size={22} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">Archived</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="officers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="nature-card"
          >
            <div className="bg-slate-50 p-5 border-b border-slate-100 grid grid-cols-[2fr,1.5fr,1fr] text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Identification / Email</span>
              <span>Clearance Status</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-slate-50">
              {officers.map(off => (
                <div key={off.id} className="grid grid-cols-[2fr,1.5fr,1fr] items-center p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-primary border border-slate-200">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <p className="font-serif text-lg text-slate-900">{off.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{off.email}</p>
                    </div>
                  </div>
                  <div>
                    {off.isApproved ? (
                      <span className="status-badge bg-emerald-50 text-emerald-700 flex items-center gap-2 w-fit">
                        <ShieldCheck size={12} /> Approved
                      </span>
                    ) : (
                      <span className="status-badge bg-amber-50 text-amber-700 flex items-center gap-2 w-fit">
                        <Clock size={12} /> Pending Approval
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    {!off.isApproved && (
                      <button 
                         onClick={() => handleApproveOfficer(off.id)}
                         className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md shadow-slate-900/10"
                       >
                         Grant Access
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal Support */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-10 cursor-zoom-out"
          >
            <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform">
              <X size={40} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              src={selectedImage} 
              alt="Full Preview"
              className="max-w-full max-h-full rounded-[24px] shadow-2xl border-8 border-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
