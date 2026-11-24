'use client';

import { useState } from 'react';
import { Settings, Building, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => void;
}

export default function SettingsView({ onResetData }: SettingsViewProps) {
  const [hospitalName, setHospitalName] = useState('City Hospital & Research Center');
  const [address, setAddress] = useState('14/B, Healthcare Avenue, MG Road, Mumbai');
  const [contactPhone, setContactPhone] = useState('+91 22 2654 3300');
  const [slotDuration, setSlotDuration] = useState('30');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Hospital Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure hospital profile, OPD slot intervals, and database management.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building className="w-4 h-4 text-blue-600" />
          Hospital / Clinic Profile
        </h3>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hospital Name</label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reception Hotline</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Physical Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            Appointment Slot Configuration
          </h3>
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Slot Interval</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
            >
              <option value="15">15 Minutes per patient</option>
              <option value="30">30 Minutes per patient (Default)</option>
              <option value="45">45 Minutes per patient</option>
              <option value="60">60 Minutes per patient</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* Database demo reset */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Restore Sample Demo Data</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset doctors and appointments back to the clean November 2026 demo state.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all doctors and appointments to default sample data?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
}
