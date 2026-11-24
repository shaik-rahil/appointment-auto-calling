import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        slot_id,
        doctor_id,
        patient_name,
        patient_phone,
        appointment_date,
        appointment_time,
        source,
        call_id,
        status,
        created_at,
        doctors (
          id,
          name,
          specialization
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch appointments warning:', error.message);
      return NextResponse.json({ appointments: [], error: error.message }, { status: 200 });
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      patientName: row.patient_name,
      patientPhone: row.patient_phone,
      doctorId: row.doctor_id,
      doctorName: row.doctors?.name || 'Dr. Assigned',
      doctorSpecialization: row.doctors?.specialization || 'General',
      date: row.appointment_date,
      time: row.appointment_time,
      reason: row.source ? `Booked via ${row.source}` : 'Clinical Consultation',
      status: row.status ? (row.status.charAt(0).toUpperCase() + row.status.slice(1)) : 'Scheduled',
      createdAt: row.created_at,
    }));

    return NextResponse.json({ appointments: mapped });
  } catch (err: any) {
    console.error('API appointments error:', err);
    return NextResponse.json({ appointments: [], error: err.message }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientPhone,
      doctorId,
      doctorName,
      doctorSpecialization,
      date,
      time,
      reason,
      status,
    } = body;

    if (!patientName || !patientPhone || !date || !time) {
      return NextResponse.json({ error: 'Missing required appointment fields' }, { status: 400 });
    }

    const cleanPhone = String(patientPhone).replace(/\D/g, '').slice(-10);

    const { data, error } = await supabaseAdmin.from('appointments').insert({
      patient_name: patientName,
      patient_phone: cleanPhone,
      doctor_id: doctorId || null,
      appointment_date: date,
      appointment_time: time,
      source: 'web_dashboard',
      status: (status || 'confirmed').toLowerCase(),
    }).select().single();

    if (error) {
      console.warn('Supabase insert warning:', error.message);
      // Return success with local payload so frontend continues without blocking
      return NextResponse.json({
        success: true,
        savedToDb: false,
        appointment: { ...body, id: `local_${Date.now()}` }
      });
    }

    return NextResponse.json({
      success: true,
      savedToDb: true,
      appointment: {
        id: data.id,
        patientName: data.patient_name,
        patientPhone: data.patient_phone,
        doctorId: data.doctor_id || doctorId,
        doctorName: doctorName || 'Assigned Doctor',
        doctorSpecialization: doctorSpecialization || 'General',
        date: data.appointment_date,
        time: data.appointment_time,
        reason: reason || 'Clinical Consultation',
        status: status || 'Confirmed',
        createdAt: data.created_at,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
