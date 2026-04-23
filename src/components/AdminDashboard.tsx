import React from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Sighting, SightingStatus } from '../types';

interface Props {
  sightings: Sighting[];
  onUpdateStatus: (id: string, status: SightingStatus) => void;
}

export const AdminDashboard: React.FC<Props> = ({ sightings, onUpdateStatus }) => {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-5xl font-serif text-forest italic">Officer Validation</h1>
          <p className="text-neutral-500 text-sm">Awaiting expert verification for recorded taxonomy plates.</p>
        </div>
      </div>

      <div className="nature-card">
        <div className="bg-wheat/30 p-5 border-b border-neutral-100 grid grid-cols-[1.2fr,2fr,1fr,1fr] text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          <span>Plate ID / Animal</span>
          <span>Images & Confidence</span>
          <span>Verification</span>
          <span className="text-right">Manage</span>
        </div>

        <div className="divide-y divide-neutral-50">
          {sightings.length === 0 ? (
            <div className="p-20 text-center text-neutral-300 italic font-serif text-xl">No pending logs found.</div>
          ) : (
            sightings.map(s => (
              <div key={s.id} className="grid grid-cols-[1.2fr,2fr,1fr,1fr] items-center p-6 hover:bg-wheat/30 transition-colors">
                <div className="flex flex-col space-y-1">
                  <span className="font-serif text-xl italic text-forest leading-tight">{s.animalType}</span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{s.id.toUpperCase()} • {new Date(s.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {s.images.map((img, i) => (
                      <div key={i} className="inline-block h-14 w-14 rounded-[18px] ring-4 ring-white overflow-hidden bg-neutral-100 shadow-sm">
                        <img src={img} alt="Sighting" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="h-1.5 w-32 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sage" 
                        style={{ width: `${s.confidenceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-sage uppercase tracking-widest">{s.confidenceScore}% Acc.</span>
                  </div>
                </div>

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
            )
          )
          )}
        </div>
      </div>
    </div>
  );
};
