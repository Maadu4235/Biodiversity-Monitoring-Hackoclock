import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Sighting, AnimalType } from '../types';
import { AlertCircle, History, MapPin } from 'lucide-react';

interface Props {
  sightings: Sighting[];
}

export const ReportDashboard: React.FC<Props> = ({ sightings }) => {
  const total = sightings.length;
  const dangerAlerts = sightings.filter(s => s.isDanger).length;
  
  const typeCounts = sightings.reduce((acc, s) => {
    acc[s.animalType] = (acc[s.animalType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  
  const pieData = [
    { name: 'Danger', value: dangerAlerts, color: '#E11D48' },
    { name: 'Safe', value: '#A8B091' }
  ];

  const COLORS = ['#5A5A40', '#A8B091', '#8B8B6B', '#DCDCD2', '#4A4A35'];

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-2">
        <h1 className="text-5xl font-serif text-forest italic">Biometric Insights</h1>
        <p className="text-neutral-500 text-sm">Zone 4B • Aggregate Biodiversity Metadata Analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="nature-card p-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-wheat text-forest rounded-full">
            <History size={28} />
          </div>
          <div>
            <p className="text-5xl font-serif italic text-forest">{total}</p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Total Logs</p>
          </div>
        </div>

        <div className="nature-card p-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-5xl font-serif italic text-rose-600">{dangerAlerts}</p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Threat Alerts</p>
          </div>
        </div>

        <div className="nature-card p-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-wheat text-sage rounded-full">
            <MapPin size={28} />
          </div>
          <div>
            <p className="text-5xl font-serif italic text-forest">
              {Object.keys(typeCounts).length}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Species Divergence</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="nature-card p-10 space-y-8">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Sighting Composition</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#A3A3A3', fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F5F2ED' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontFamily: 'serif', fontStyle: 'italic' }}
                 />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="nature-card p-10 space-y-8">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Risk Distribution</h3>
          <div className="h-72 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-6 pl-10">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{item.name}</p>
                    <p className="text-3xl font-serif italic text-forest">{((item.value / total || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
