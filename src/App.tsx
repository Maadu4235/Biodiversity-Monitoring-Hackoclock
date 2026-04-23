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
    <aside className="w-64 bg-forest text-wheat flex flex-col p-6 space-y-8 h-full shrink-0">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
          <Leaf className="w-6 h-6 text-forest" />
        </div>
        <h1 className="text-xl font-bold tracking-tight font-serif italic uppercase">Silva</h1>
      </div>

      <nav className="space-y-2 flex-grow">
        {user.role === 'User' && (
          <Link 
            to="/upload"
            className={`w-full nav-link ${isActive('/upload') ? 'nav-link-active' : 'nav-link-inactive'}`}
          >
            <Camera size={18} />
            <span>Deployment</span>
          </Link>
        )}
        {user.role === 'Officer' && (
          <>
            <Link 
              to="/admin"
              className={`w-full nav-link ${isActive('/admin') ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <Shield size={18} />
              <span>Verification</span>
            </Link>
            <Link 
              to="/reports"
              className={`w-full nav-link ${isActive('/reports') ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <FileText size={18} />
              <span>Analysis</span>
            </Link>
          </>
        )}
      </nav>

      <div className="space-y-4">
        <div className="bg-forest/50 border border-sage/20 p-4 rounded-2xl">
          <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-1">User Profile</p>
          <p className="text-sm font-serif italic leading-tight">{user.name}</p>
          <p className="text-[9px] uppercase tracking-widest mt-1 opacity-50">{user.role}</p>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold tracking-wide uppercase text-[10px] text-wheat/60 hover:text-wheat hover:bg-sage/10"
        >
          <LogOut size={16} />
          Terminal Exit
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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

  if (loading) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-wheat">
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


