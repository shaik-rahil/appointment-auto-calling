'use client';

import { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  X,
  Filter,
  Building,
  UserCheck,
  Download,
  Lock,
  ChevronDown,
  UserX,
  Plane,
  FolderOpen
} from 'lucide-react';
import { Doctor, DoctorStatus } from './types';

interface DoctorManagementProps {
  doctors: Doctor[];
  onUpdateDoctor: (updated: Doctor) => void;
  onAddDoctor: (newDoc: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  onNavigateToAppointments?: (doctorId?: string) => void;
}

export default function DoctorManagement({
  doctors,
  onUpdateDoctor,
  onAddDoctor,
  onDeleteDoctor,
  onNavigateToAppointments,
}: DoctorManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState<Partial<Doctor>>({
    doctorId: `DOC-${100 + doctors.length + 1}`,
    name: '',
    specialization: 'Cardiologist',
    phone: '',
    email: '',
    consultationTimings: 'Mon-Fri: 09:00 AM – 02:00 PM, 04:00 PM – 07:00 PM',
    status: 'Available',
    room: 'Rm 101, Main Block',
  });

  const specializations = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => set.add(d.specialization));
    return Array.from(set);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesId = doc.doctorId.toLowerCase().includes(q);
        const matchesSpec = doc.specialization.toLowerCase().includes(q);
        const matchesPhone = doc.phone.includes(q);
        if (!matchesName && !matchesId && !matchesSpec && !matchesPhone) return false;
      }
      if (selectedSpecialization !== 'all' && doc.specialization !== selectedSpecialization) {
        return false;
      }
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [doctors, searchQuery, selectedSpecialization, selectedStatus]);

  const handleStatusChange = (doctor: Doctor, newStatus: DoctorStatus) => {
    const updated: Doctor = { ...doctor, status: newStatus };
    onUpdateDoctor(updated);
  };

  const handleOpenAddModal = () => {
    setFormData({
      doctorId: `DOC-${100 + doctors.length + 1}`,
      name: '',
      specialization: 'Cardiologist',
      phone: '',
      email: '',
      consultationTimings: 'Mon-Fri: 09:00 AM – 02:00 PM, 04:00 PM – 07:00 PM',
      status: 'Available',
      room: 'Rm 101, Main Block',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill out the doctor name and contact number.');
      return;
    }

    if (editingDoctor) {
      onUpdateDoctor({ ...editingDoctor, ...(formData as Doctor) });
      setEditingDoctor(null);
    } else {
      const newDoc: Doctor = {
        id: `doc_${Date.now()}`,
        doctorId: formData.doctorId || `DOC-${Math.floor(100 + Math.random() * 899)}`,
        name: formData.name || '',
        specialization: formData.specialization || 'General Physician',
        phone: formData.phone || '',
        email: formData.email || `${(formData.name || 'doctor').toLowerCase().replace(/[^a-z]/g, '')}@medpulse.clinic`,
        consultationTimings: formData.consultationTimings || 'Mon-Fri: 09:00 AM – 01:00 PM',
        status: (formData.status as DoctorStatus) || 'Available',
        room: formData.room || 'Rm 101',
      };
      onAddDoctor(newDoc);
      setIsAddModalOpen(false);
    }
  };

  // Metrics matching Image 3
  const totalRegistered = doctors.length;
  const currentlyAvailable = doctors.filter((d) => d.status === 'Available').length;
  const onLeaveCount = doctors.filter((d) => d.status === 'On Leave').length;
  const unavailableCount = doctors.filter((d) => d.status === 'Not Available').length;
  const activePercent = Math.round((currentlyAvailable / (totalRegistered || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header Bar matching Image 3 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              CLINICAL REGISTRY
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-Time Sync Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Doctor Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage clinic physicians, consultation timings, and real-time on-duty availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Doctor</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching Image 3 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Total Registered
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{totalRegistered}</span>
              <span className="text-xs font-bold text-blue-600">+3 this month</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Currently Available */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Currently Available
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{currentlyAvailable}</span>
              <span className="text-xs font-bold text-emerald-600">{activePercent}% active</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: On Scheduled Leave */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              On Scheduled Leave
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{onLeaveCount}</span>
              <span className="text-xs font-bold text-amber-600">3 return Mon</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Unavailable / Off-Duty */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Unavailable / Off-Duty
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{unavailableCount}</span>
              <span className="text-xs font-bold text-rose-600">Bookings locked</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Filter and Search Bar matching Image 3 */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name, specialization, or ID (e.g. DOC-101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none"
          >
            <option value="all">Specialization: All Departments</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none"
          >
            <option value="all">Status: All Statuses</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
            <option value="On Leave">On Leave</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialization('all');
              setSelectedStatus('all');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Status Indicators Legend & Booking Safeguard Alert matching Image 3 */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
            STATUS INDICATORS:
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available (Open for Consults)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Not Available (Off-duty / Shift Ended)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> On Leave (Approved Absence)
          </span>
        </div>

        <div className="flex items-center gap-2 text-blue-700 bg-blue-50/70 border border-blue-200/80 px-3 py-1.5 rounded-xl font-medium text-[11px]">
          <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>When set to Unavailable or On Leave, appointment slots automatically restrict booking.</span>
        </div>
      </div>

      {/* Doctor Table matching Image 3 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">DOCTOR ID</th>
                <th className="py-3.5 px-6">PRACTITIONER</th>
                <th className="py-3.5 px-6">SPECIALIZATION</th>
                <th className="py-3.5 px-6">CONTACT INFO</th>
                <th className="py-3.5 px-6">CONSULTATION TIMINGS</th>
                <th className="py-3.5 px-6">LIVE AVAILABILITY</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => {
                const isAvail = doc.status === 'Available';
                const isLeave = doc.status === 'On Leave';
                const isNot = doc.status === 'Not Available';

                // Initial tag like RS, PN, KS, AM, RI, ST
                const initials = doc.name.split(' ').filter(x => !x.includes('Dr')).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'DR';

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition group">
                    {/* Doctor ID */}
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">
                      {doc.doctorId}
                    </td>

                    {/* Practitioner Name + Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs">{doc.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {doc.doctorId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-900 block">{doc.specialization}</span>
                      <span className="text-[10px] text-slate-400">{doc.room || 'General OPD'}</span>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-slate-800 font-semibold block">{doc.phone}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px] block">{doc.email}</span>
                    </td>

                    {/* Consultation Timings */}
                    <td className="py-4 px-6">
                      <span className="text-slate-700 font-medium text-xs block max-w-xs">{doc.consultationTimings}</span>
                    </td>

                    {/* Live Availability Dropdown */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-500' : isLeave ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc, e.target.value as DoctorStatus)}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition ${
                            isAvail ? 'bg-emerald-50/80 text-emerald-800 border-emerald-300' :
                            isLeave ? 'bg-amber-50/80 text-amber-800 border-amber-300' : 'bg-rose-50/80 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Available">● AVAILABLE</option>
                          <option value="Not Available">● NOT AVAILABLE</option>
                          <option value="On Leave">● ON LEAVE</option>
                        </select>
                      </div>
                    </td>

                    {/* Action: Eye icon */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setViewingDoctor(doc)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
                        title="View Doctor Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer matching Image 3 */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredDoctors.length} of {doctors.length} active clinicians</span>
          <div className="flex items-center gap-1.5 font-bold">
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Previous</button>
            <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white">1</button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">2</button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Doctor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleSaveDoctor} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Doctor ID</label>
                  <input
                    type="text"
                    required
                    value={formData.doctorId || ''}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Eleanor Vance"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="Cardiologist"
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Availability</label>
                  <select
                    value={formData.status || 'Available'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DoctorStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@medpulse.clinic"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Consultation Timings</label>
                <input
                  type="text"
                  required
                  value={formData.consultationTimings || ''}
                  onChange={(e) => setFormData({ ...formData, consultationTimings: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-xs"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {viewingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">{viewingDoctor.name}</h3>
              <button onClick={() => setViewingDoctor(null)} className="text-slate-400">✕</button>
            </div>
            <p><strong>Doctor ID:</strong> {viewingDoctor.doctorId}</p>
            <p><strong>Specialization:</strong> {viewingDoctor.specialization}</p>
            <p><strong>Phone:</strong> {viewingDoctor.phone}</p>
            <p><strong>Email:</strong> {viewingDoctor.email}</p>
            <p><strong>Timings:</strong> {viewingDoctor.consultationTimings}</p>
            <p><strong>Status:</strong> {viewingDoctor.status}</p>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setViewingDoctor(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
