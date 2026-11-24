'use client';

import { useState } from 'react';
import { 
  Stethoscope, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  UserX, 
  Users, 
  ArrowUpRight, 
  Plus, 
  Calendar,
  Search,
  RefreshCw,
  Bell,
  Download,
  AlertTriangle,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Doctor, Appointment, ActiveModule, DoctorStatus } from './types';

interface DashboardOverviewProps {
  doctors: Doctor[];
  appointments: Appointment[];
  onNavigate: (module: ActiveModule) => void;
  onOpenBookingModal: () => void;
  onOpenAddDoctorModal: () => void;
  onUpdateDoctorStatus?: (id: string, status: DoctorStatus) => void;
}

export default function DashboardOverview({
  doctors,
  appointments,
  onNavigate,
  onOpenBookingModal,
  onOpenAddDoctorModal,
  onUpdateDoctorStatus,
}: DashboardOverviewProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [searchSchedule, setSearchSchedule] = useState('');

  // Doctor roster for right column
  const [rosterDoctors, setRosterDoctors] = useState<Doctor[]>(doctors);

  const handleQuickStatusChange = (id: string, status: DoctorStatus) => {
    setRosterDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    if (onUpdateDoctorStatus) onUpdateDoctorStatus(id, status);
  };

  // Schedule items derived dynamically from real appointments
  const scheduleItems = appointments.map((a) => {
    const pName = a.patientName || a.patient_name || 'Patient';
    const initials = pName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'PT';
    return {
      id: a.id,
      patient: pName,
      phone: a.patientPhone || a.phone ? `+91 ${a.patientPhone || a.phone}` : 'Direct Call',
      doctor: a.doctorName || a.doctors?.name || 'Assigned Doctor',
      dept: `${a.doctorSpecialization || a.doctors?.department || 'General Medicine'} · ${a.time}`,
      tag: initials,
      tagColor: 'bg-blue-100 text-blue-800',
      status: (a.status || 'scheduled').toLowerCase(),
    };
  });

  const filteredSchedule = scheduleItems.filter((item) => {
    if (filterTab !== 'all' && item.status !== filterTab) return false;
    if (searchSchedule.trim()) {
      const q = searchSchedule.toLowerCase();
      return item.patient.toLowerCase().includes(q) || item.doctor.toLowerCase().includes(q) || item.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar matching Image 1 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              CLINICAL OPERATIONS SUITE
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronized Live
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Executive Clinical Overview
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenBookingModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={onOpenAddDoctorModal}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Add Doctor</span>
          </button>

          <button
            onClick={() => alert('Emergency slot dispatch opened')}
            className="px-3.5 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Slot</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-2xs transition"
            title="Export / Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 KPI Summary Cards matching Image 1 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Total Doctors */}
        <div 
          onClick={() => onNavigate('doctors')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-blue-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Doctors</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">18</span>
              <span className="text-[10px] font-bold text-emerald-600">+2 mo</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Cardio, Ortho, Peds</p>
          </div>
        </div>

        {/* 2. Available Now */}
        <div 
          onClick={() => onNavigate('doctors')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Available Now</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">12</span>
              <span className="text-[10px] font-bold text-emerald-600">67% Capacity</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Ready for intake</p>
          </div>
        </div>

        {/* 3. Off-Duty / Leave */}
        <div 
          onClick={() => onNavigate('doctors')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-rose-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Off-Duty / Leave</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">6</span>
              <span className="text-[10px] font-bold text-amber-600">4 Leave</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">2 Unavailable (OR)</p>
          </div>
        </div>

        {/* 4. Today's Visits */}
        <div 
          onClick={() => onNavigate('appointments')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-blue-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Today's Visits</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">14</span>
              <span className="text-[10px] font-bold text-blue-600">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">6 Pending completion</p>
          </div>
        </div>

        {/* 5. Tomorrow */}
        <div 
          onClick={() => onNavigate('appointments')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-indigo-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Tomorrow</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">19</span>
              <span className="text-[10px] font-bold text-emerald-600">+35%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">8 slots remaining</p>
          </div>
        </div>

        {/* 6. Completed (Mo) */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-cyan-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Completed (Mo)</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">142</span>
              <span className="text-[10px] font-bold text-emerald-600">95.2%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Target: 160 by EOM</p>
          </div>
        </div>

        {/* 7. Cancelled */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-rose-400 cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Cancelled</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">8</span>
              <span className="text-[10px] font-bold text-slate-500">4.8%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Within &lt;5% threshold</p>
          </div>
        </div>
      </section>

      {/* Two Column Layout matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Today's Appointment Schedule + Triage Banner (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Today's Appointment Schedule
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    6 items
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time consultation progression and queue flow management
                </p>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or doctor..."
                  value={searchSchedule}
                  onChange={(e) => setSearchSchedule(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    filterTab === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({scheduleItems.length})
                </button>
                <button
                  onClick={() => setFilterTab('scheduled')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    filterTab === 'scheduled' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Scheduled ({scheduleItems.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length})
                </button>
                <button
                  onClick={() => setFilterTab('completed')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    filterTab === 'completed' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Completed ({scheduleItems.filter((i) => i.status === 'completed').length})
                </button>
                <button
                  onClick={() => setFilterTab('cancelled')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    filterTab === 'cancelled' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancelled ({scheduleItems.filter((i) => i.status === 'cancelled').length})
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                <span>Live Synchronizing</span>
              </div>
            </div>

            {/* List of Real Patients */}
            <div className="space-y-3">
              {filteredSchedule.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-slate-100 text-slate-400">
                  <p className="font-bold text-xs text-slate-700">No appointments logged yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Existing mock data cleared. When you complete a call in Bolna AI or make a test booking, it will appear here immediately.
                  </p>
                </div>
              ) : (
                filteredSchedule.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs ${item.tagColor}`}>
                        {item.tag}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.patient}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{item.phone}</p>
                      </div>
                    </div>

                    <div className="text-right sm:text-left">
                      <span className="font-semibold text-slate-800">{item.doctor}</span>
                      <span className="text-[11px] text-slate-400 block">{item.dept}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination footer */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
              <span>Showing {filteredSchedule.length} of {appointments.length} appointments</span>
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Previous</button>
                <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">1</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">2</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Doctor On-Duty Roster, Department Load, Live Activity Stream */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Doctor On-Duty Roster */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Doctor On-Duty Roster</h3>
                <p className="text-[11px] text-slate-400">Live station state management</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                4 On-Site
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {rosterDoctors.slice(0, 4).map((doc) => {
                const isAvail = doc.status === 'Available';
                const isLeave = doc.status === 'On Leave';
                const isOff = doc.status === 'Not Available';

                return (
                  <div key={doc.id} className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {doc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{doc.name}</h4>
                          <p className="text-[10px] text-slate-400">{doc.specialization} ({doc.room || 'Rm 101'})</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvail ? 'bg-emerald-100 text-emerald-800' :
                        isLeave ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200/50">
                      <button
                        onClick={() => handleQuickStatusChange(doc.id, 'Available')}
                        className={`py-1 rounded-lg text-[10px] font-bold transition ${
                          isAvail ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Avail
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(doc.id, 'On Leave')}
                        className={`py-1 rounded-lg text-[10px] font-bold transition ${
                          isLeave ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Leave
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(doc.id, 'Not Available')}
                        className={`py-1 rounded-lg text-[10px] font-bold transition ${
                          isOff ? 'bg-rose-600 text-white' : 'bg-white hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
