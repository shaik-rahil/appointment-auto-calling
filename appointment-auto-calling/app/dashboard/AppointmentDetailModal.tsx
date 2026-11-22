'use client';

import { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  Printer, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Appointment } from './types';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onStatusChange: (id: string, status: any) => void;
  onDelete?: (id: string) => void;
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  onStatusChange,
  onDelete,
}: AppointmentDetailModalProps) {
  if (!isOpen || !appointment) return null;

  const slotFormatted = appointment.doctor_slots?.slot_start
    ? new Date(appointment.doctor_slots.slot_start).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Slot Confirmed';

  const dateFormatted = appointment.doctor_slots?.slot_start
    ? new Date(appointment.doctor_slots.slot_start).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : new Date(appointment.created_at || appointment.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

  const handlePrintSlip = () => {
    window.print();
  };

  const whatsappUrl = `https://wa.me/91${appointment.phone}?text=${encodeURIComponent(
    `Hello ${appointment.patient_name}, your appointment at City Hospital with ${appointment.doctors?.name || 'the Doctor'} is scheduled for ${slotFormatted}. Please arrive 10 minutes early. Thank you!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{appointment.patient_name}</h3>
              <p className="text-xs text-slate-400 font-mono">+91 {appointment.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge & Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Appointment Status
              </p>
              <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                {appointment.status || 'Confirmed'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {(['Confirmed', 'Scheduled', 'Completed', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange(appointment.id, st)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold capitalize transition ${
                    appointment.status === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-100 bg-white">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Doctor Assigned
              </span>
              <p className="text-sm font-bold text-slate-800">
                {appointment.doctors?.name || 'Dr. Sharma'}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {appointment.doctors?.department || 'General Medicine'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-100 bg-white">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Date & Time Slot
              </span>
              <p className="text-sm font-bold text-slate-800">{slotFormatted}</p>
              <p className="text-xs text-slate-500 mt-0.5">{dateFormatted}</p>
            </div>
          </div>

          {/* Channel info */}
          <div className="flex items-center justify-between text-xs py-2 px-1 text-slate-500 border-t border-slate-100">
            <span>Booking Source:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {appointment.source || 'Voice AI Reception Desk'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:+91${appointment.phone}`}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Call Patient
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Alert
              </a>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Token Slip
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Cancel and remove this appointment?')) {
                      onDelete(appointment.id);
                      onClose();
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 text-rose-600 font-semibold text-xs transition"
                  title="Remove Appointment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
