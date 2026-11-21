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

export const INITIAL_APPOINTMENTS: Appointment[] = [
  // Today: 21 November 2026 (matching Image 2)
  {
    id: 'appt-1',
    patientName: 'Arun Kumar',
    patientPhone: '98450 11204',
    doctorId: 'doc-101',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialization: 'Cardiology',
    date: '2026-11-21',
    time: '09:00 AM',
    reason: 'Annual Cardiac Checkup',
    status: 'Scheduled',
    createdAt: '2026-11-21T08:15:00Z',
  },
  {
    id: 'appt-2',
    patientName: 'Priya Sharma',
    patientPhone: '99160 33451',
    doctorId: 'doc-102',
    doctorName: 'Dr. Priya Nair',
    doctorSpecialization: 'Pediatrics',
    date: '2026-11-21',
    time: '10:00 AM',
    reason: 'Child Fever & Vaccination',
    status: 'Completed',
    createdAt: '2026-11-21T08:30:00Z',
  },
  {
    id: 'appt-3',
    patientName: 'Ramesh',
    patientPhone: '98441 55678',
    doctorId: 'doc-103',
    doctorName: 'Dr. Kumar Swamy',
    doctorSpecialization: 'Orthopedics',
    date: '2026-11-21',
    time: '11:30 AM',
    reason: 'Knee Joint Pain Followup',
    status: 'Scheduled',
    createdAt: '2026-11-21T09:00:00Z',
  },
  {
    id: 'appt-4',
    patientName: 'Suresh',
    patientPhone: '97412 88902',
    doctorId: 'doc-101',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialization: 'Cardiology',
    date: '2026-11-21',
    time: '02:00 PM',
    reason: 'Blood Pressure Review',
    status: 'Scheduled',
    createdAt: '2026-11-21T09:45:00Z',
  },
  {
    id: 'appt-5',
    patientName: 'Anjali',
    patientPhone: '96110 77412',
    doctorId: 'doc-102',
    doctorName: 'Dr. Priya Nair',
    doctorSpecialization: 'Pediatrics',
    date: '2026-11-21',
    time: '04:00 PM',
    reason: 'Routine Growth Assessment',
    status: 'Scheduled',
    createdAt: '2026-11-21T10:15:00Z',
  },

  // Executive overview items (Image 1)
  {
    id: 'appt-ex-1',
    patientName: 'Emma Lindqvist',
    patientPhone: '555 902-1244',
    doctorId: 'doc-102',
    doctorName: 'Dr. Priya Nair',
    doctorSpecialization: 'Pediatrics',
    date: '2026-11-21',
    time: '11:00 AM',
    reason: 'Respiratory cough checkup',
    status: 'Scheduled',
    createdAt: '2026-11-21T10:30:00Z',
  },
  {
    id: 'appt-ex-2',
    patientName: 'Tariq Khan',
    patientPhone: '555 611-9230',
    doctorId: 'doc-104',
    doctorName: 'Dr. Anjali Mehta',
    doctorSpecialization: 'Neurology',
    date: '2026-11-21',
    time: '12:30 PM',
    reason: 'Migraine aura follow-up',
    status: 'Scheduled',
    createdAt: '2026-11-21T10:45:00Z',
  },
  {
    id: 'appt-ex-3',
    patientName: 'Ananya Chatterjee',
    patientPhone: '555 234-9981',
    doctorId: 'doc-101',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialization: 'Cardiology',
    date: '2026-11-21',
    time: '03:30 PM',
    reason: 'ECG Rhythm diagnostic',
    status: 'Scheduled',
    createdAt: '2026-11-21T11:00:00Z',
  },
  {
    id: 'appt-ex-4',
    patientName: 'David Lawson',
    patientPhone: '555 433-2890',
    doctorId: 'doc-103',
    doctorName: 'Dr. Kumar Swamy',
    doctorSpecialization: 'Orthopedics',
    date: '2026-11-21',
    time: '05:00 PM',
    reason: 'Shoulder impingement review',
    status: 'Scheduled',
    createdAt: '2026-11-21T11:15:00Z',
  },

  // Nov 20 (2 appts)
  {
    id: 'appt-nov20-1',
    patientName: 'Robert Hawkins',
    patientPhone: '98450 11999',
    doctorId: 'doc-103',
    doctorName: 'Dr. Kumar Swamy',
    doctorSpecialization: 'Orthopedics',
    date: '2026-11-20',
    time: '10:00 AM',
    reason: 'Post-op knee ligament check',
    status: 'Completed',
    createdAt: '2026-11-20T08:00:00Z',
  },
  {
    id: 'appt-nov20-2',
    patientName: 'Elena Rostova',
    patientPhone: '98450 22888',
    doctorId: 'doc-101',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialization: 'Cardiology',
    date: '2026-11-20',
    time: '11:30 AM',
    reason: 'Holter monitor analysis',
    status: 'Completed',
    createdAt: '2026-11-20T09:00:00Z',
  },

  // Nov 22 (4 appts)
  {
    id: 'appt-nov22-1',
    patientName: 'Vikramaditya Rao',
    patientPhone: '98450 33777',
    doctorId: 'doc-101',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialization: 'Cardiology',
    date: '2026-11-22',
    time: '09:30 AM',
    reason: 'Lipid profile review',
    status: 'Confirmed',
    createdAt: '2026-11-21T11:00:00Z',
  },
  {
    id: 'appt-nov22-2',
    patientName: 'Meenakshi Iyer',
    patientPhone: '98450 44666',
    doctorId: 'doc-102',
    doctorName: 'Dr. Priya Nair',
    doctorSpecialization: 'Pediatrics',
    date: '2026-11-22',
    time: '11:00 AM',
    reason: 'Pediatric allergy consultation',
    status: 'Scheduled',
    createdAt: '2026-11-21T11:30:00Z',
  },
  {
    id: 'appt-nov22-3',
    patientName: 'Kavita Menon',
    patientPhone: '98450 55444',
    doctorId: 'doc-106',
    doctorName: 'Dr. Sarah Thomas',
    doctorSpecialization: 'Dermatology',
    date: '2026-11-22',
    time: '02:30 PM',
    reason: 'Eczema skin care review',
    status: 'Confirmed',
    createdAt: '2026-11-21T12:00:00Z',
  },
  {
    id: 'appt-nov22-4',
    patientName: 'Sanjay Malhotra',
    patientPhone: '98450 66333',
    doctorId: 'doc-104',
    doctorName: 'Dr. Anjali Mehta',
    doctorSpecialization: 'Neurology',
    date: '2026-11-22',
    time: '04:00 PM',
    reason: 'Tension headache analysis',
    status: 'Scheduled',
    createdAt: '2026-11-21T12:15:00Z',
  },

  // Nov 23 (1 appt)
  {
    id: 'appt-nov23-1',
    patientName: 'Deepak Chopra',
    patientPhone: '98450 77222',
    doctorId: 'doc-101',
    doctorName: 'Dr. Rahul Sharma',
    doctorSpecialization: 'Cardiology',
    date: '2026-11-23',
    time: '10:00 AM',
    reason: 'Routine ECG scan',
    status: 'Scheduled',
    createdAt: '2026-11-21T13:00:00Z',
  },
];

const STORAGE_KEYS = {
  DOCTORS: 'medpulse_docs_v3',
  APPOINTMENTS: 'medpulse_appts_v3',
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
