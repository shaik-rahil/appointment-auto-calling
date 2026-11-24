'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  MessageSquare,
  Stethoscope,
  CalendarDays,
  FileText,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Doctor, Appointment, AppointmentStatus } from './types';
import BookingModal from './BookingModal';
import { getTodayDateStr, getRelativeDateLabel, getQuickDates } from '@/lib/dateUtils';

interface AppointmentManagementProps {
  doctors: Doctor[];
  appointments: Appointment[];
  onSaveAppointment: (appt: Appointment) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  selectedDoctorId?: string;
}

export default function AppointmentManagement({
  doctors,
  appointments,
  onSaveAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  selectedDoctorId,
}: AppointmentManagementProps) {
  // Dynamic calendar focus: tracks real current date
  const todayStr = useMemo(() => getTodayDateStr(), []);
  const todayObj = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayObj.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');

  // Filters
  const [filterDoctor, setFilterDoctor] = useState<string>(selectedDoctorId || 'all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar cells for Month view
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean; count: number }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const count = appointments.filter((a) => a.date === dateStr && a.status !== 'Cancelled').length;
      cells.push({ dateStr, dayNum, isCurrentMonth: false, isToday: false, count });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const count = appointments.filter((a) => a.date === dateStr && a.status !== 'Cancelled').length;
      cells.push({ dateStr, dayNum: day, isCurrentMonth: true, isToday, count });
    }

    // Next month padding
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const count = appointments.filter((a) => a.date === dateStr && a.status !== 'Cancelled').length;
      cells.push({ dateStr, dayNum: i, isCurrentMonth: false, isToday: false, count });
    }

    return cells;
  }, [currentYear, currentMonth, appointments]);

  // Selected date's appointments
  const selectedDateAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (appt.date !== selectedDate) return false;
      if (filterDoctor !== 'all' && appt.doctorId !== filterDoctor && appt.doctorName !== filterDoctor) {
        return false;
      }
      if (filterStatus !== 'all' && appt.status !== filterStatus) {
        return false;
      }
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate, filterDoctor, filterStatus]);

  const completedCount = selectedDateAppointments.filter((a) => a.status === 'Completed').length;
  const inQueueCount = selectedDateAppointments.filter((a) => a.status !== 'Completed' && a.status !== 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top 4 Mini Stats matching Image 2 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Selected Date Capacity */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              SELECTED DATE CAPACITY
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900">{selectedDateAppointments.length}</span>
              <span className="text-xs text-slate-400 font-bold">/ 18 slots filled</span>
            </div>
            <p className="text-[11px] text-blue-600 font-bold mt-1">
              ● 27% utilization rate
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Duty Specialists */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              DUTY SPECIALISTS
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900">3</span>
              <span className="text-xs text-slate-400 font-bold">Active Today</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[180px]">
              Dr. Rahul, Priya, Kumar
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Session Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              SESSION PROGRESS
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900">{completedCount}</span>
              <span className="text-xs text-emerald-600 font-bold">Completed</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              ✓ {inQueueCount} in-queue remaining
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: SMART GUARD */}
        <div className="bg-gradient-to-tr from-blue-700 to-blue-600 p-5 rounded-3xl text-white shadow-sm shadow-blue-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-200 block tracking-wider">
              SMART GUARD
            </span>
            <h4 className="text-base font-extrabold mt-0.5">Zero Overlaps</h4>
            <p className="text-[10px] text-blue-100 mt-0.5">
              Automatic conflict detection on
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAppt(null);
              setIsBookingModalOpen(true);
            }}
            className="px-3 py-2 bg-white text-blue-700 rounded-xl font-bold text-xs shadow-sm hover:bg-blue-50 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </section>

      {/* Main Interactive Calendar Section matching Image 2 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-5">
        {/* Calendar Title & Dropdown Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-slate-400">
                Central Outpatient Department Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50"
            >
              <option value="all">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => {
                setEditingAppt(null);
                setIsBookingModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Appointment</span>
            </button>
          </div>
        </div>

        {/* Navigation & View switcher bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Month</span>
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentYear(now.getFullYear());
                setCurrentMonth(now.getMonth());
                setSelectedDate(todayStr);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1"
            >
              <span>Next Month</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 rounded-lg transition ${
                calendarView === 'month' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1 rounded-lg transition ${
                calendarView === 'week' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1 rounded-lg transition ${
                calendarView === 'day' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Sub-header instruction label */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-slate-800 text-xs">Interactive Month Grid</span>
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Selected Focus Day
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> Has Appointments
            </span>
          </div>
          <span className="text-slate-400">Click any date card to load clinical appointments</span>
        </div>

        {/* Days of Week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[11px] text-slate-400 py-1 bg-slate-50/70 rounded-xl">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Month Day Cells matching Image 2 */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.isToday;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`min-h-[92px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : isToday
                    ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-400/40'
                    : cell.isCurrentMonth
                    ? 'border-slate-200/80 bg-white hover:bg-slate-50/80'
                    : 'border-slate-100 bg-slate-50/30 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold ${isToday ? 'text-blue-700 font-black' : isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                    {cell.dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded-md shadow-2xs">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Appointment Count & Dots matching Image 2 */}
                <div className="mt-2 space-y-1">
                  {cell.count > 0 ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span className="text-[10px] font-extrabold text-blue-700">
                          {cell.count} appts
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(cell.count, 3) }).map((_, i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        ))}
                        {cell.count > 3 && (
                          <span className="text-[9px] font-bold text-slate-400">+{cell.count - 3}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] text-transparent select-none">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date-wise Appointments Section matching Image 2 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {getRelativeDateLabel(selectedDate)}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time outpatient schedule & consultation tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-bold">
              Total Appointments: {selectedDateAppointments.length}
            </span>

            {/* Dynamic quick date selector pills */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold mr-1">Quick Dates:</span>
              {getQuickDates(todayStr).map((qd) => {
                const count = appointments.filter((a) => a.date === qd.dateStr && a.status !== 'Cancelled').length;
                const isSel = selectedDate === qd.dateStr;
                return (
                  <button
                    key={qd.dateStr}
                    onClick={() => {
                      setSelectedDate(qd.dateStr);
                      const [y, m] = qd.dateStr.split('-').map(Number);
                      setCurrentYear(y);
                      setCurrentMonth(m - 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      isSel ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {qd.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Appointment Cards (1 to 5) matching Image 2 */}
        <div className="space-y-3.5">
          {selectedDateAppointments.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/60 rounded-3xl border border-slate-100 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No appointments scheduled for this date</h4>
              <p className="text-xs text-slate-400">Select another date from the interactive calendar or book a patient.</p>
              <button
                onClick={() => {
                  setEditingAppt(null);
                  setIsBookingModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + Book for this date
              </button>
            </div>
          ) : (
            selectedDateAppointments.map((appt, idx) => {
              const isCompleted = appt.status === 'Completed';

              return (
                <div
                  key={appt.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition flex flex-wrap items-center justify-between gap-4"
                >
                  {/* Left: Number + Patient + Doctor + Reason */}
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          {appt.patientName}
                          {(appt.patientAge || appt.age) && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                              {appt.patientAge || appt.age} yrs
                            </span>
                          )}
                        </h4>
                        <span className="font-mono text-xs text-slate-500 font-medium">
                          +91 {appt.patientPhone}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                          {appt.doctorName} – {appt.doctorSpecialization}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-blue-600 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.time}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-medium">
                        Reason: <span className="text-slate-600">{appt.reason}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Pill + Actions (Mark Completed / Re-open / Edit / Delete) */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1.5 ${
                      isCompleted 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      {appt.status.toUpperCase()}
                    </span>

                    {isCompleted ? (
                      <button
                        onClick={() => onUpdateStatus(appt.id, 'Scheduled')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-open</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStatus(appt.id, 'Completed')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <span>✓</span>
                        <span>Mark Completed</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingAppt(appt);
                        setIsBookingModalOpen(true);
                      }}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                      title="Edit Appointment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Cancel appointment for ${appt.patientName}?`)) {
                          onUpdateStatus(appt.id, 'Cancelled');
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Cancel Appointment"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingAppt(null);
        }}
        doctors={doctors}
        appointments={appointments}
        editingAppointment={editingAppt}
        onSaveAppointment={onSaveAppointment}
        initialDate={selectedDate}
      />
    </div>
  );
}
