import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';
import { UserPlus, Leaf, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate(role === 'Officer' ? '/admin' : '/upload');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md nature-card p-10 space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Leaf size={28} />
          </div>
          <h1 className="text-3xl font-serif italic text-slate-900">Enlist Network</h1>
          <p className="text-slate-500 text-sm">Join the global biodiversity monitoring collective.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Biological Full Name</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-secondary outline-none transition-all"
              placeholder="Dr. John Smith"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Registry Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-secondary outline-none transition-all"
              placeholder="jsmith@monitoring.org"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Security Cipher</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-secondary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Assignment Role</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setRole('User')}
                className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${role === 'User' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-100'}`}
              >
                Contributor
              </button>
              <button 
                type="button"
                onClick={() => setRole('Officer')}
                className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${role === 'Officer' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-100'}`}
              >
                Officer
              </button>
            </div>
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center uppercase tracking-wider">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-primary/10"
          >
            {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
            Synchronize Profile
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already verified? <Link to="/login" className="text-primary font-bold hover:underline">Establish Link</Link>
        </div>
      </motion.div>
    </div>
  );
};
