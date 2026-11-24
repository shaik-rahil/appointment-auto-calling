import { Doctor, Appointment } from './types';

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-101',
    doctorId: 'DOC-101',
    name: 'Dr. Rahul Sharma',
    specialization: 'Cardiologist',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@medpulse.clinic',
    consultationTimings: 'Mon-Fri: 09:00 AM – 02:00 PM, 04:00 PM – 07:00 PM',
    status: 'Available',
    room: 'Rm 304, Cardiology Wing',
    experienceYears: 14,
  },
  {
    id: 'doc-102',
    doctorId: 'DOC-102',
    name: 'Dr. Priya Nair',
    specialization: 'Pediatrician',
    phone: '+91 98123 45678',
    email: 'priya.nair@medpulse.clinic',
    consultationTimings: 'Mon-Sat: 10:00 AM – 01:00 PM, 05:00 PM – 08:00 PM',
    status: 'Available',
    room: 'Rm 205, Child Care Clinic',
    experienceYears: 10,
  },
  {
    id: 'doc-103',
    doctorId: 'DOC-103',
    name: 'Dr. Kumar Swamy',
    specialization: 'Orthopedic Surgeon',
    phone: '+91 98450 11223',
    email: 'kumar.swamy@medpulse.clinic',
    consultationTimings: 'Tue-Sat: 08:30 AM – 01:30 PM',
    status: 'On Leave',
    room: 'Rm 112, Orthopedic Suite',
    experienceYears: 16,
  },
  {
    id: 'doc-104',
    doctorId: 'DOC-104',
    name: 'Dr. Anjali Mehta',
    specialization: 'Neurologist',
    phone: '+91 98220 99887',
    email: 'anjali.mehta@medpulse.clinic',
    consultationTimings: 'Mon-Thu: 11:00 AM – 04:00 PM',
    status: 'Available',
    room: 'Rm 402, Neuro Wing',
    experienceYears: 11,
  },
  {
    id: 'doc-105',
    doctorId: 'DOC-105',
    name: 'Dr. Rajesh Iyer',
    specialization: 'General Physician',
    phone: '+91 98711 22334',
    email: 'rajesh.iyer@medpulse.clinic',
    consultationTimings: 'Mon-Sat: 08:00 AM – 02:00 PM',
    status: 'Not Available',
    room: 'Rm 101, Primary Triage',
    experienceYears: 18,
  },
  {
    id: 'doc-106',
    doctorId: 'DOC-106',
    name: 'Dr. Sarah Thomas',
    specialization: 'Dermatologist',
    phone: '+91 98990 66778',
    email: 'sarah.thomas@medpulse.clinic',
    consultationTimings: 'Wed-Sun: 01:00 PM – 06:00 PM',
    status: 'Available',
    room: 'Rm 115, Derma Center',
    experienceYears: 8,
  },
];

// All dummy data completely cleared so only real test & phone bookings are displayed
export const INITIAL_APPOINTMENTS: Appointment[] = [];

const STORAGE_KEYS = {
  DOCTORS: 'medpulse_docs_v5',
  APPOINTMENTS: 'medpulse_appts_v5',
};

export function loadStoredDoctors(): Doctor[] {
  if (typeof window === 'undefined') return INITIAL_DOCTORS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
      return INITIAL_DOCTORS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_DOCTORS;
  }
}

export function saveStoredDoctors(doctors: Doctor[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  } catch (err) {
    console.error('Failed to save doctors:', err);
  }
}

export function loadStoredAppointments(): Appointment[] {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveStoredAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  } catch (err) {
    console.error('Failed to save appointments:', err);
  }
}

export function resetDemoData(): { doctors: Doctor[]; appointments: Appointment[] } {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  }
  return { doctors: INITIAL_DOCTORS, appointments: INITIAL_APPOINTMENTS };
}
