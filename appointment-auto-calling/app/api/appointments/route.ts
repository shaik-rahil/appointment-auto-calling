import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTodayDateStr } from '@/lib/dateUtils';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        patient_name,
        phone,
        source,
        status,
        doctor_id,
        slot_id,
        created_at,
        doctors (
          id,
          name,
          department
        ),
        doctor_slots (
          id,
          slot_start,
          is_booked
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch appointments warning:', error.message);
      return NextResponse.json({ appointments: [], error: error.message }, { status: 200 });
    }

    const mapped = (data || []).map((row: any) => {
      let date = getTodayDateStr();
      let time = '10:00 AM';
      if (row.doctor_slots?.slot_start) {
        const d = new Date(row.doctor_slots.slot_start);
        if (!isNaN(d.getTime())) {
          date = d.toISOString().split('T')[0];
          time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      } else if (row.created_at) {
        const d = new Date(row.created_at);
        if (!isNaN(d.getTime())) {
          date = d.toISOString().split('T')[0];
          time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      }

      return {
        id: row.id,
        patientName: row.patient_name || 'Patient',
        patientPhone: row.phone || '',
        doctorId: row.doctor_id,
        doctorName: row.doctors?.name || 'Dr. Assigned',
        doctorSpecialization: row.doctors?.department || 'General Consultation',
        date: date,
        time: time,
        reason: row.source ? `Booked via ${row.source}` : 'Clinical Consultation',
        status: row.status ? (row.status.charAt(0).toUpperCase() + row.status.slice(1)) : 'Scheduled',
        createdAt: row.created_at,
      };
    });

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

    if (!patientName || !patientPhone) {
      return NextResponse.json({ error: 'Missing required appointment fields' }, { status: 400 });
    }

    const cleanPhone = String(patientPhone).replace(/\D/g, '').slice(-10);

    // Create slot if date/time provided
    let slotId: string | null = null;
    if (date && time) {
      try {
        const slotIso = new Date(`${date} ${time}`).toISOString();
        const { data: slotData } = await supabaseAdmin
          .from('doctor_slots')
          .insert({
            doctor_id: doctorId || null,
            slot_start: slotIso,
            is_booked: true,
          })
          .select('id')
          .single();
        if (slotData) {
          slotId = slotData.id;
        }
      } catch (e) {
        // Continue without slotId
      }
    }

    const { data, error } = await supabaseAdmin.from('appointments').insert({
      patient_name: patientName.trim(),
      phone: cleanPhone,
      doctor_id: doctorId || null,
      slot_id: slotId,
      source: reason || 'Voice AI',
      status: (status || 'confirmed').toLowerCase(),
    }).select().single();

    if (error) {
      console.warn('Supabase insert warning:', error.message);
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
        patientPhone: data.phone,
        doctorId: data.doctor_id || doctorId,
        doctorName: doctorName || 'Dr. Assigned',
        doctorSpecialization: doctorSpecialization || 'General Consultation',
        date: date || getTodayDateStr(),
        time: time || '10:00 AM',
        reason: reason || 'Booked via Voice AI',
        status: status || 'Confirmed',
        createdAt: data.created_at,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
