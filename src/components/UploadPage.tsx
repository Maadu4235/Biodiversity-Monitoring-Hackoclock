import React, { useState, useEffect } from 'react';
import { Upload, Camera, AlertTriangle, CheckCircle2, Loader2, X, MapPin } from 'lucide-react';
import { AnimalType, Sighting } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onUpload: (sighting: Sighting) => void;
}

export const UploadPage: React.FC<Props> = ({ onUpload }) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<AnimalType | ''>('');
  const [location, setLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Sighting | null>(null);

  const animalTypes: AnimalType[] = ['Tiger', 'Elephant', 'Deer', 'Leopard', 'Human'];

  const [locError, setLocError] = useState<string | null>(null);

  const detectLocation = () => {
    setIsDetectingLocation(true);
    setLocError(null);
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, 
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setLocation(`${lat}, ${lng}`);
          setIsDetectingLocation(false);
          setLocError(null);
        },
        (error) => {
          setIsDetectingLocation(false);
          let msg = "Inaccessible";
          if (error.code === error.PERMISSION_DENIED) msg = "Permissions Blocked";
          else if (error.code === error.TIMEOUT) msg = "Connection Timeout";
          setLocError(msg);
          console.error("GPS Failure:", error);
        },
        options
      );
    } else {
      setIsDetectingLocation(false);
      setLocError("Not Supported");
    }
  };

  // Auto-detect location on load
  useEffect(() => {
    detectLocation();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + images.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || images.length === 0 || !location) {
      alert("Please provide images, taxonomy, and location.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, animalType: selectedType, location }),
      });
      const data = await response.json();
      setResult(data);
      onUpload(data);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setImages([]);
    setSelectedType('');
    setLocation('');
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      <div className="space-y-2">
        <h1 className="text-5xl font-serif text-forest italic">Post Sighting</h1>
        <p className="text-neutral-500 text-sm">Zone 4B • Northern Reach Biodiversity Monitoring</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit} 
            className="nature-card p-10 space-y-10"
          >
            <div className="space-y-6">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">Step 1: Visual Evidence</label>
              <div className="grid grid-cols-3 gap-6">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-[24px] overflow-hidden border border-neutral-100 group shadow-sm">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="aspect-square flex flex-col items-center justify-center border border-neutral-100 rounded-[24px] cursor-pointer hover:bg-wheat/30 transition-all group">
                    <Camera className="text-neutral-300 group-hover:text-forest transition-colors" size={32} />
                    <span className="text-[10px] mt-2 font-bold uppercase tracking-widest text-neutral-300 group-hover:text-forest">Add Plate</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">Step 2: Taxonomy Classification</label>
              <div className="flex flex-wrap gap-3">
                {animalTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-6 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all ${
                      selectedType === type 
                      ? 'bg-forest text-white border-forest shadow-md shadow-forest/20' 
                      : 'bg-white text-forest border-neutral-100 hover:border-forest'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400">Step 3: Geolocation Data</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    isDetectingLocation 
                      ? "Synchronizing with monitoring grid..." 
                      : locError 
                        ? `GPS Error: ${locError}. Please enter manually.`
                        : "e.g. Mysore Road or coordinates"
                  }
                  className={`w-full p-4 pr-12 rounded-2xl bg-wheat/30 border border-neutral-100 focus:border-sage outline-none transition-all text-sm ${isDetectingLocation ? 'animate-pulse text-sage' : locError ? 'border-rose-200' : ''}`}
                />
                <button 
                  type="button"
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-forest hover:scale-110 transition-transform ${isDetectingLocation ? 'animate-spin opacity-50' : ''}`}
                >
                  <MapPin size={20} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isUploading || !selectedType || images.length === 0 || !location}
              className="w-full btn-primary py-5 flex items-center justify-center gap-2 shadow-xl shadow-forest/10"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Algorithmic Analysis...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Execute Sighting Log
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`nature-card p-12 text-center space-y-10 ${result.isDanger ? 'border-rose-100 bg-rose-50/20' : 'border-emerald-100 bg-emerald-50/20'}`}
          >
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${result.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {result.isDanger ? <AlertTriangle size={40} /> : <CheckCircle2 size={40} />}
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-serif italic text-forest">Species Identified</h2>
              <p className="text-neutral-500 text-sm">Automated scan verified at <span className="font-bold text-forest">{result.confidenceScore}%</span> accuracy.</p>
            </div>

            {result.isDanger && (
              <div className="p-4 bg-rose-600 text-white rounded-2xl animate-pulse space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <AlertTriangle size={14} /> Critical Warning
                </p>
                <p className="text-sm italic font-serif">Be careful during your journey. A dangerous animal was reported near your location.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-10 py-6 border-y border-neutral-100">
              <div className="text-center">
                <p className="text-[10px] uppercase text-neutral-400 font-bold tracking-widest mb-1">Detected Genus</p>
                <p className="text-2xl font-serif italic text-forest">{result.detectedSpecies}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase text-neutral-400 font-bold tracking-widest mb-1">Location Node</p>
                <p className="text-xl font-serif italic text-forest truncate px-2">{result.location}</p>
              </div>
            </div>

            <button onClick={reset} className="btn-primary w-full py-5 shadow-xl shadow-forest/20">
              New Deployment Log
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
