import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import SADashboard from './SADashboard';
import MechanicDashboard from './MechanicDashboard';
import { Shield, Layers, Wrench } from 'lucide-react';

const ForemanDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SA' | 'MECHANIC'>('MECHANIC');

  return (
    <div className="h-full flex flex-col print:bg-white">
      <div className="p-4 print:hidden border-b border-slate-200">
        <div className="flex bg-slate-200 rounded p-1 w-fit">
          <button
            onClick={() => setActiveTab('SA')}
            className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center ${
              activeTab === 'SA' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Front Office View
          </button>
          <button
            onClick={() => setActiveTab('MECHANIC')}
            className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center ${
              activeTab === 'MECHANIC' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mechanic Queue View
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'SA' ? <SADashboard /> : <MechanicDashboard />}
      </div>
    </div>
  );
};

export default ForemanDashboard;
