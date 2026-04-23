/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { UploadPage } from './components/UploadPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportDashboard } from './components/ReportDashboard';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Sighting, SightingStatus } from './types';
import { Shield, FileText, Camera, Leaf, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-primary text-white flex flex-col p-6 space-y-8 h-full shrink-0 shadow-2xl z-20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">WildEye</h1>
      </div>

      <nav className="space-y-3 flex-grow">
        {user.role === 'User' && (
          <Link 
            to="/upload"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest ${isActive('/upload') ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Camera size={18} />
            <span>Deployment</span>
          </Link>
        )}
        {user.role === 'Officer' && (
          <>
            <Link 
              to="/admin"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest ${isActive('/admin') ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Shield size={18} />
              <span>Verification</span>
            </Link>
            <Link 
              to="/reports"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest ${isActive('/reports') ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <FileText size={18} />
              <span>Analysis</span>
            </Link>
          </>
        )}
      </nav>

      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <p className="text-[9px] opacity-40 uppercase tracking-[0.2em] font-bold mb-1">Authenticated</p>
          <p className="text-sm font-serif italic text-white truncate">{user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
            <p className="text-[8px] uppercase tracking-widest opacity-30 text-white">{user.role}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold tracking-widest uppercase text-[10px] text-white/40 hover:text-rose-400 hover:bg-rose-950/20"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={user.role === 'Officer' ? '/admin' : '/upload'} />;
  return <>{children}</>;
};

const LiveAlert = () => {
  const [latestAlert, setLatestAlert] = useState<Sighting | null>(null);

  const fetchAlert = async () => {
    try {
      const res = await fetch('/api/alerts/latest');
      const data = await res.json();
      setLatestAlert(data);
    } catch (e) {
      console.error("Alert fetch failed", e);
    }
  };

  useEffect(() => {
    fetchAlert();
    const interval = setInterval(fetchAlert, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (!latestAlert) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rose-700 text-white px-8 py-2.5 flex items-center justify-center gap-4 z-50 relative overflow-hidden shadow-md"
    >
      <Shield size={18} className="text-rose-100" />
      <p className="text-[11px] font-bold uppercase tracking-[0.1em]">
        ⚠️ ALERT: {latestAlert.animalType} spotted near {latestAlert.location}
      </p>
    </motion.div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LiveAlert />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const { user, loading } = useAuth();

  const fetchSightings = async () => {
    try {
      const response = await fetch('/api/sightings');
      const data = await response.json();
      setSightings(data);
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  };

  useEffect(() => {
    if (user) fetchSightings();
  }, [user]);

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

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-primary">
        <Leaf size={40} />
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Navigation />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <Routes>
            <Route path="/login" element={user ? <Navigate to={user.role === 'Officer' ? '/admin' : '/upload'} /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to={user.role === 'Officer' ? '/admin' : '/upload'} /> : <RegisterPage />} />
            
            <Route path="/upload" element={
              <ProtectedRoute allowedRole="User">
                <UploadPage onUpload={handleNewSighting} />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="Officer">
                <AdminDashboard sightings={sightings} onUpdateStatus={handleUpdateStatus} />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute allowedRole="Officer">
                <ReportDashboard sightings={sightings} />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}


