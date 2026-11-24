'use client';

import { useState, useMemo } from 'react';
import { Users, Search, Phone, Calendar, Clock, Plus, ArrowUpRight } from 'lucide-react';
import { Appointment, Doctor } from './types';

interface PatientsViewProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onBookForPatient: (name: string, phone: string) => void;
}

export default function PatientsView({
  appointments,
  doctors,
  onBookForPatient,
}: PatientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique patient records
  const patients = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; visits: number; lastDate: string; doctors: Set<string>; reasons: string[] }>();

    appointments.forEach((a) => {
      const key = a.patientPhone || a.patientName;
      if (!map.has(key)) {
        map.set(key, {
          name: a.patientName,
          phone: a.patientPhone,
          visits: 0,
          lastDate: a.date,
          doctors: new Set<string>(),
          reasons: [],
        });
      }
      const record = map.get(key)!;
      record.visits += 1;
      record.doctors.add(a.doctorName);
      if (a.reason && !record.reasons.includes(a.reason)) {
        record.reasons.push(a.reason);
      }
      if (a.date > record.lastDate) {
        record.lastDate = a.date;
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.phone.includes(q);
      }
      return true;
    });
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Patients Directory
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {patients.length} Registered Patients
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search patients by name or mobile number, view visit history and book follow-up consultations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Patient Name</th>
                <th className="py-3.5 px-6">Mobile Phone</th>
                <th className="py-3.5 px-6">Total Visits</th>
                <th className="py-3.5 px-6">Doctors Consulted</th>
                <th className="py-3.5 px-6">Last Appointment</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.phone} className="hover:bg-blue-50/30 transition">
                    <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {patient.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{patient.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {patient.reasons.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-600 font-medium">
                      +91 {patient.phone}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
                        {patient.visits} {patient.visits === 1 ? 'visit' : 'visits'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {Array.from(patient.doctors).join(', ')}
                    </td>

                    <td className="py-4 px-6 text-slate-500 font-mono">
                      {patient.lastDate}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onBookForPatient(patient.name, patient.phone)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                      >
                        + Book Again
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
