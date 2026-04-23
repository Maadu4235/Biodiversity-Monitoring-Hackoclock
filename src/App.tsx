/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UploadPage } from './components/UploadPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportDashboard } from './components/ReportDashboard';
import { Sighting, SightingStatus } from './types';
import { Shield, FileText, Camera, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'user' | 'admin' | 'reports';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('user');
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSightings = async () => {
    try {
      const response = await fetch('/api/sightings');
      const data = await response.json();
      setSightings(data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSightings();
  }, []);

  const handleNewSighting = (sighting: Sighting) => {
    setSightings(prev => [sighting, ...prev]);
  };

  const handleUpdateStatus = async (id: string, status: SightingStatus) => {
    try {
      const response = await fetch(`/api/sightings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSightings(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-wheat">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-forest text-wheat flex flex-col p-6 space-y-8 h-full shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-forest" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic uppercase">Silva</h1>
        </div>

        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('user')}
            className={`w-full text-left nav-link ${activeTab === 'user' ? 'nav-link-active' : 'nav-link-inactive'}`}
          >
            <Camera size={18} />
            <span>Deployment</span>
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`w-full text-left nav-link ${activeTab === 'admin' ? 'nav-link-active' : 'nav-link-inactive'}`}
          >
            <Shield size={18} />
            <span>Verification</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left nav-link ${activeTab === 'reports' ? 'nav-link-active' : 'nav-link-inactive'}`}
          >
            <FileText size={18} />
            <span>Analysis</span>
          </button>
        </nav>

        <div className="bg-forest/50 border border-sage/20 p-4 rounded-2xl">
          <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-2">Systems Online</p>
          <p className="text-sm font-serif italic leading-tight">Zone 4B Monitoring<br/>Active Nodes: {(sightings.length * 3.14).toFixed(0)}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="text-forest opacity-20"
              >
                <Leaf size={64} />
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                {activeTab === 'user' && <UploadPage onUpload={handleNewSighting} />}
                {activeTab === 'admin' && <AdminDashboard sightings={sightings} onUpdateStatus={handleUpdateStatus} />}
                {activeTab === 'reports' && <ReportDashboard sightings={sightings} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}


