export type DoctorStatus = 'Available' | 'Not Available' | 'On Leave';
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Doctor {
  id: string;
  doctorId: string; // e.g. 'DOC-101'
  name: string;
  specialization: string;
  phone: string;
  email: string;
  consultationTimings: string;
  status: DoctorStatus;
  room?: string;
  experienceYears?: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. '09:00 AM'
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  notes?: string;
  // Optional Supabase relationship fields used by appointment detail views.
  patient_name?: string;
  phone?: string;
  source?: string;
  created_at?: string;
  doctors?: { name?: string; department?: string } | null;
  doctor_slots?: { slot_start?: string } | null;
}

export interface CallLog {
  call_id: string;
  phone: string;
  duration_sec: number;
  summary: string;
  transcript: string;
  outcome: 'booked' | 'transferred' | 'info_only' | 'missed' | string;
  recording_url?: string | null;
  created_at: string;
}

export interface PatientRecord {
  name: string;
  phone: string;
  totalAppointments: number;
  lastVisit: string;
  reasons: string[];
  primaryDoctor?: string;
}

export type ActiveModule = 'dashboard' | 'doctors' | 'appointments' | 'patients' | 'reports' | 'settings';
