import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, CheckCircle2, Loader2, X, MapPin, History } from 'lucide-react';
import { AnimalType, Sighting } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';

interface Props {
  onUpload: (sighting: Sighting) => void;
}

export const UploadPage: React.FC<Props> = ({ onUpload }) => {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState<AnimalType | ''>('');
  const [location, setLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Sighting | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [history, setHistory] = useState<Sighting[]>([]);

  const animalTypes: AnimalType[] = ['Tiger', 'Elephant', 'Deer', 'Leopard', 'Human'];

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/sightings/user/${user.id}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("History fetch failed", e);
    }
  };

  useEffect(() => {
    fetchHistory();
    detectLocation();
  }, [user]);

  const detectLocation = () => {
    setIsDetectingLocation(true);
    setLocError(null);
    if (navigator.geolocation) {
      const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setIsDetectingLocation(false);
        },
        (error) => {
          setIsDetectingLocation(false);
          setLocError("Location blocked or timeout");
        },
        options
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0 || !location || !selectedType) {
      alert("Please provide images, location and animal type.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFiles[0]);
      formData.append('animalType', selectedType);
      formData.append('location', location);
      formData.append('userId', user?.id || 'anonymous');

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      setResult(data);
      onUpload(data);
      fetchHistory();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 mt-8">
      <div className="space-y-2">
        <h1 className="text-5xl font-serif text-primary italic">WildEye Grid</h1>
        <p className="text-neutral-500 text-sm">Synchronizing field intelligence with central monitors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-12 items-start">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSubmit} 
              className="nature-card p-10 space-y-10"
            >
              <div className="space-y-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">Step 1: Visual Evidence</label>
                <div className="grid grid-cols-3 gap-6">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-[24px] overflow-hidden border border-neutral-100 group shadow-sm">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="aspect-square flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-[24px] cursor-pointer hover:bg-wheat/30 transition-all group">
                      <Camera className="text-neutral-300 group-hover:text-forest transition-colors" size={32} />
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">Step 2: Animal Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {animalTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedType === type ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">Step 3: Location Data</label>
                <div className="space-y-4">
                  <div className="relative">
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={isDetectingLocation ? "Synchronizing location..." : "e.g. Mysore Road"} className="w-full p-4 pr-12 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-sage outline-none transition-all text-sm"/>
                    <button type="button" onClick={detectLocation} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"><MapPin size={20} /></button>
                  </div>
                  <div className="h-40 bg-neutral-50 border border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-neutral-300 relative overflow-hidden group">
                    <MapPin size={40} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Static Map Preview</span>
                    {location && <span className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-neutral-100 text-[9px] font-mono text-primary truncate">📍 {location}</span>}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isUploading || images.length === 0 || !location || !selectedType} className="w-full py-5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all hover:bg-primary/90 active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                {isUploading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <CheckCircle2 size={18} />
                    Deploy Intelligence
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`nature-card p-12 text-center space-y-10 border-2 ${result.isDanger ? 'border-rose-200 bg-rose-50/10' : 'border-emerald-200 bg-emerald-50/10'}`}
            >
              <div className="flex justify-center">
                <div className={`rounded-full px-4 py-1 flex items-center gap-2 ${result.isDanger ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {result.isDanger ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{result.isDanger ? 'Potential Danger' : 'Safe Area'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="mx-auto w-64 h-64 rounded-[32px] overflow-hidden border-8 border-white shadow-2xl relative">
                   <img src={result.images[0]} alt="Sighting" className="w-full h-full object-cover" />
                   <div className="absolute top-4 right-4 bg-primary text-wheat px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">
                     Verified
                   </div>
                </div>
                <div className="space-y-3 text-center">
                  <h2 className="text-4xl font-serif italic text-primary">Detected: {result.animalType}</h2>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-neutral-50 shadow-sm">{result.confidenceScore}% Confidence</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-neutral-50 shadow-sm">Status: {result.status}</span>
                  </div>
                </div>
              </div>

              {result.isDanger && (
                <div className="p-6 bg-rose-600 rounded-2xl text-white space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider">⚠️ Critical Warning</p>
                  <p className="text-sm font-serif italic">Precautionary measure recommended: dangerous wildlife detected in vicinity.</p>
                </div>
              )}

              <button onClick={() => setResult(null)} className="w-full py-5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all">Analyze New Grid</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <History size={18} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="nature-card p-10 text-center space-y-3 border-dashed">
                <Camera size={32} className="mx-auto text-neutral-200" />
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">No previous intel logs.</p>
              </div>
            ) : (
              history.map(s => (
                <div key={s.id} className="nature-card p-4 flex gap-4 items-center group cursor-default">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-neutral-100 shrink-0">
                    <img src={s.images[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-serif italic text-primary text-lg leading-tight">{s.animalType}</p>
                    <p className="text-[8px] text-neutral-400 uppercase font-bold tracking-[0.2em] truncate mt-1">{s.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border ${
                      s.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      s.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {s.status}
                    </span>
                    <span className="text-[7px] text-neutral-300 font-mono italic">{new Date(s.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
