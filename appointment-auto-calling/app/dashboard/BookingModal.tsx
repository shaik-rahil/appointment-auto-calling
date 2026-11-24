'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Doctor, Appointment, AppointmentStatus } from './types';
import { getTodayDateStr } from '@/lib/dateUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  appointments: Appointment[];
  editingAppointment?: Appointment | null;
  onSaveAppointment: (appt: Appointment) => void;
  initialDate?: string; // YYYY-MM-DD
}

const TIME_SLOTS = [
  '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
  '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
];

export default function BookingModal({
  isOpen,
  onClose,
  doctors,
  appointments,
  editingAppointment,
  onSaveAppointment,
  initialDate,
}: BookingModalProps) {
  // Available doctors only (Available status)
  const availableDoctors = doctors.filter((d) => d.status === 'Available');

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('Confirmed');
  const [error, setError] = useState<string | null>(null);

  // Sync state when opening modal
  useEffect(() => {
    if (editingAppointment) {
      setPatientName(editingAppointment.patientName);
      setPatientPhone(editingAppointment.patientPhone);
      setDoctorId(editingAppointment.doctorId);
      setSpecialization(editingAppointment.doctorSpecialization);
      setDate(editingAppointment.date);
      setTime(editingAppointment.time);
      setReason(editingAppointment.reason);
      setStatus(editingAppointment.status);
    } else {
      const defaultDoc = availableDoctors[0] || doctors[0];
      setPatientName('');
      setPatientPhone('');
      setDoctorId(defaultDoc ? defaultDoc.id : '');
      setSpecialization(defaultDoc ? defaultDoc.specialization : '');
      setDate(initialDate || getTodayDateStr());
      setTime('10:00 AM');
      setReason('');
      setStatus('Confirmed');
    }
    setError(null);
  }, [editingAppointment, isOpen, initialDate, doctors]);

  // When doctor changes, automatically populate specialization!
  const handleDoctorChange = (selectedId: string) => {
    setDoctorId(selectedId);
    const doc = doctors.find((d) => d.id === selectedId);
    if (doc) {
      setSpecialization(doc.specialization);
      if (doc.status !== 'Available') {
        setError(`Warning: ${doc.name} is currently marked as "${doc.status}". Please select an Available doctor.`);
      } else {
        setError(null);
      }
    }
  };

  // Check double booking in real-time
  const selectedDoc = doctors.find((d) => d.id === doctorId);
  const isDoubleBooked = appointments.some((a) => {
    if (editingAppointment && a.id === editingAppointment.id) return false;
    return a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'Cancelled';
  });

  const isDoctorUnavailable = selectedDoc ? selectedDoc.status !== 'Available' : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = patientPhone.replace(/\D/g, '').slice(-10);
    if (!patientName.trim()) {
      setError('Please enter the patient name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (!selectedDoc) {
      setError('Please select a doctor.');
      return;
    }

    // Functional requirement: Prevent booking if doctor is unavailable or on leave
    if (selectedDoc.status !== 'Available') {
      setError(`Cannot book: ${selectedDoc.name} is currently "${selectedDoc.status}". Only Available doctors can be scheduled.`);
      return;
    }

    // Functional requirement: Prevent double bookings for same doctor at the same time
    if (isDoubleBooked) {
      setError(`Double Booking Conflict! ${selectedDoc.name} already has an appointment booked on ${date} at ${time}. Please select another time slot.`);
      return;
    }

    const apptToSave: Appointment = {
      id: editingAppointment ? editingAppointment.id : `appt_${Date.now()}`,
      patientName: patientName.trim(),
      patientPhone: cleanPhone,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      doctorSpecialization: selectedDoc.specialization,
      date: date,
      time: time,
      reason: reason.trim() || 'General Medical Consultation',
      status: status,
      createdAt: editingAppointment ? editingAppointment.createdAt : new Date().toISOString(),
    };

    onSaveAppointment(apptToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {editingAppointment ? 'Edit Appointment' : 'Book New Patient Appointment'}
              </h3>
              <p className="text-xs text-blue-100">
                {editingAppointment ? `Updating #${editingAppointment.id}` : 'Fill in patient and scheduling details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isDoubleBooked && !error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Warning: {selectedDoc?.name} is already booked at {time} on this date.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Patient Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                <input
                  type="tel"
                  required
                  placeholder="98201 12345"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Doctor Selection & Auto-populated Specialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                Select Doctor
              </label>
              <select
                value={doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                <optgroup label="Available Doctors (Can Book)">
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} · {doc.specialization}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Unavailable Doctors (Cannot Book)">
                  {doctors
                    .filter((d) => d.status !== 'Available')
                    .map((doc) => (
                      <option key={doc.id} value={doc.id} className="text-slate-400">
                        {doc.name} · {doc.specialization} ({doc.status})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Doctor Specialization (Auto-populated)
              </label>
              <input
                type="text"
                readOnly
                value={specialization}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-blue-700 font-bold text-xs cursor-not-allowed"
              />
            </div>
          </div>

          {/* Date and Time Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Appointment Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Appointment Time Slot
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                {TIME_SLOTS.map((slot) => {
                  const isSlotTaken = appointments.some(
                    (a) =>
                      a.doctorId === doctorId &&
                      a.date === date &&
                      a.time === slot &&
                      a.status !== 'Cancelled' &&
                      (!editingAppointment || a.id !== editingAppointment.id)
                  );
                  return (
                    <option key={slot} value={slot} disabled={isSlotTaken}>
                      {slot} {isSlotTaken ? '(Booked)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Reason for Visit
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chest pain checkup, Knee joint pain, Viral fever"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Appointment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDoubleBooked || isDoctorUnavailable}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingAppointment ? 'Save Changes' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
