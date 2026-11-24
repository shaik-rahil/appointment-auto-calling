export type DoctorStatus = 'Available' | 'Not Available' | 'On Leave';
export type AppointmentStatus = 
  | 'Scheduled' 
  | 'Confirmed' 
  | 'Completed' 
  | 'Cancelled' 
  | 'scheduled' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'arrived';

export interface Doctor {
  id: string;
  doctorId: string; // e.g. 'DOC-101'
  name: string;
  specialization: string;
  department?: string;
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
  patientAge?: number;
  age?: number;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. '09:00 AM'
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  notes?: string;
  source?: string;
  // Supabase snake_case & nested compatibility:
  patient_name?: string;
  phone?: string;
  created_at?: string;
  doctors?: {
    name?: string;
    department?: string;
    specialization?: string;
  };
  doctor_slots?: {
    slot_start?: string;
  };
}

export type CallOutcome = 'booked' | 'transferred' | 'info_only' | 'emergency_redirect' | 'missed' | 'dropped';

export interface CallLog {
  id: string;
  call_id: string;
  phone: string;
  duration_sec: number;
  summary: string;
  transcript: string;
  outcome: CallOutcome;
  created_at: string;
  recording_url?: string | null;
  language?: string;
  cost_inr?: number;
  emergency_flag?: boolean;
}

export interface PatientRecord {
  name: string;
  phone: string;
  totalAppointments: number;
  lastVisit: string;
  reasons: string[];
  primaryDoctor?: string;
}

export type ActiveModule = 'dashboard' | 'doctors' | 'appointments' | 'calls' | 'patients' | 'reports' | 'settings';
