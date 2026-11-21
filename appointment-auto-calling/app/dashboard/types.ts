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
