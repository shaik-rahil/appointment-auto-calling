'use client';

import { useState, useEffect } from 'react';
import { 
  Menu, 
  Calendar as CalendarIcon, 
  Plus, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Clock,
  Search,
  Bell,
  Activity,
  User
} from 'lucide-react';
import { ActiveModule, Doctor, Appointment, AppointmentStatus, DoctorStatus } from './types';
import { 
  loadStoredDoctors, 
  saveStoredDoctors, 
  loadStoredAppointments, 
  saveStoredAppointments,
  resetDemoData 
} from './dataStore';

import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import DoctorManagement from './DoctorManagement';
import AppointmentManagement from './AppointmentManagement';
import PatientsView from './PatientsView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import BookingModal from './BookingModal';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Doctors & Appointments State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Global Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Global search input in topbar
  const [topSearch, setTopSearch] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load persistent data
  useEffect(() => {
    const loadedDocs = loadStoredDoctors();
    const loadedAppts = loadStoredAppointments();
    setDoctors(loadedDocs);
    setAppointments(loadedAppts);
    setIsLoaded(true);
  }, []);

  const showToast = (title: string, message: string, type: Toast['type'] = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: Toast = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Doctors Handlers
  const handleUpdateDoctor = (updated: Doctor) => {
    setDoctors((prev) => {
      const next = prev.map((d) => (d.id === updated.id ? updated : d));
      saveStoredDoctors(next);
      return next;
    });
    showToast('Doctor Updated', `${updated.name} availability is now set to "${updated.status}"`);
  };

  const handleUpdateDoctorStatus = (id: string, status: DoctorStatus) => {
    setDoctors((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, status } : d));
      saveStoredDoctors(next);
      return next;
    });
    const doc = doctors.find((d) => d.id === id);
    showToast('Availability Updated', doc ? `${doc.name} status is now ${status}` : `Status updated to ${status}`);
  };

  const handleAddDoctor = (newDoc: Doctor) => {
    setDoctors((prev) => {
      const next = [newDoc, ...prev];
      saveStoredDoctors(next);
      return next;
    });
    showToast('Doctor Registered', `${newDoc.name} (${newDoc.specialization}) added to clinic registry.`);
  };

  const handleDeleteDoctor = (id: string) => {
    const target = doctors.find((d) => d.id === id);
    setDoctors((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveStoredDoctors(next);
      return next;
    });
    showToast('Doctor Removed', target ? `${target.name} has been removed` : 'Doctor removed', 'info');
  };

  // Appointments Handlers
  const handleSaveAppointment = (appt: Appointment) => {
    setAppointments((prev) => {
      const exists = prev.some((a) => a.id === appt.id);
      let next: Appointment[];
      if (exists) {
        next = prev.map((a) => (a.id === appt.id ? appt : a));
        showToast('Appointment Updated', `Appointment for ${appt.patientName} saved.`);
      } else {
        next = [appt, ...prev];
        showToast('Appointment Booked', `Confirmed booking for ${appt.patientName} with ${appt.doctorName} at ${appt.time}.`);
      }
      saveStoredAppointments(next);
      return next;
    });
  };

  const handleUpdateApptStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => {
      const target = prev.find((a) => a.id === id);
      const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
      saveStoredAppointments(next);
      showToast('Status Updated', target ? `${target.patientName} marked as ${status}` : `Marked as ${status}`);
      return next;
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveStoredAppointments(next);
      showToast('Appointment Cancelled', 'Appointment was removed from schedule', 'info');
      return next;
    });
  };

  const handleResetData = () => {
    const res = resetDemoData();
    setDoctors(res.doctors);
    setAppointments(res.appointments);
    showToast('Data Restored', 'Demo doctors and appointments reloaded to default sample state.');
  };

  const handleBookForPatient = (name: string, phone: string) => {
    setIsBookingModalOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 text-xs font-bold">
        Loading MedPulse Clinic Portal...
      </div>
    );
  }

  const todayCount = appointments.filter((a) => a.date === '2026-11-21' && a.status !== 'Cancelled').length;
  const availableDocsCount = doctors.filter((d) => d.status === 'Available').length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Feedback Banners */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-3 duration-300 ${
              t.type === 'warning'
                ? 'bg-rose-950/90 text-white border-rose-800'
                : t.type === 'info'
                ? 'bg-slate-900/90 text-white border-slate-700'
                : 'bg-emerald-950/90 text-white border-emerald-800'
            }`}
          >
            <div className="p-1.5 rounded-xl bg-white/10 mt-0.5">
              {t.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 text-rose-300" />
              ) : t.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-bold">{t.title}</h5>
              <p className="text-[11px] text-white/80 mt-0.5 leading-snug">{t.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        todayAppointmentsCount={todayCount}
        availableDoctorsCount={availableDocsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar matching Image 1, 2, 3 */}
        <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 px-6 py-3 flex items-center justify-between gap-4 shadow-2xs">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar matching images */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctors, patients, appointments..."
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Right Header Status, Date, Notification, User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* ACTIVE OPERATION badge */}
            <div className="hidden md:flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-3 py-1.5 rounded-full text-blue-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE OPERATION
            </div>

            {/* Date Display */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Today, 21 Nov 2026</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-500 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {/* User Avatar + Name */}
            <div className="flex items-center gap-2.5 pl-1 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                EV
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">Dr. Eleanor Vance</p>
                <p className="text-[10px] text-slate-400 font-medium">(Admin)</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Module Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'dashboard' && (
            <DashboardOverview
              doctors={doctors}
              appointments={appointments}
              onNavigate={setActiveModule}
              onOpenBookingModal={() => setIsBookingModalOpen(true)}
              onOpenAddDoctorModal={() => setActiveModule('doctors')}
              onUpdateDoctorStatus={handleUpdateDoctorStatus}
            />
          )}

          {activeModule === 'doctors' && (
            <DoctorManagement
              doctors={doctors}
              onUpdateDoctor={handleUpdateDoctor}
              onAddDoctor={handleAddDoctor}
              onDeleteDoctor={handleDeleteDoctor}
            />
          )}

          {activeModule === 'appointments' && (
            <AppointmentManagement
              doctors={doctors}
              appointments={appointments}
              onSaveAppointment={handleSaveAppointment}
              onUpdateStatus={handleUpdateApptStatus}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {activeModule === 'patients' && (
            <PatientsView
              appointments={appointments}
              doctors={doctors}
              onBookForPatient={handleBookForPatient}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsView
              doctors={doctors}
              appointments={appointments}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}
        </main>
      </div>

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctors={doctors}
        appointments={appointments}
        onSaveAppointment={handleSaveAppointment}
        initialDate="2026-11-21"
      />
    </div>
  );
}
