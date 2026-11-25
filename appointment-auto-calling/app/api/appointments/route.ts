import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTodayDateStr, formatKolkataDate, formatKolkataTime, getSlotIso } from '@/lib/dateUtils';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        patient_name,
        phone,
        age,
        source,
        status,
        doctor_id,
        slot_id,
        notes,
        created_at,
        doctors (
          id,
          name,
          department
        ),
        doctor_slots (
          id,
          slot_start,
          slot_end,
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
        date = formatKolkataDate(row.doctor_slots.slot_start);
        time = formatKolkataTime(row.doctor_slots.slot_start);
      } else if (row.notes && row.notes.includes('Booked for ')) {
        const match = row.notes.match(/Booked for (\d{4}-\d{2}-\d{2}) at (.+)/);
        if (match) {
          date = match[1];
          time = match[2];
        }
      } else if (row.created_at) {
        date = formatKolkataDate(row.created_at);
        time = formatKolkataTime(row.created_at);
      }

      return {
        id: row.id,
        patientName: row.patient_name || 'Patient',
        patientPhone: row.phone || '',
        patientAge: row.age || undefined,
        age: row.age || undefined,
        doctorId: row.doctor_id,
        doctorName: row.doctors?.name || 'Dr. Assigned',
        doctorSpecialization: row.doctors?.department || 'General Consultation',
        date: date,
        time: time,
        reason: row.source ? `Booked via ${row.source}` : 'Clinical Consultation',
        status: row.status ? (row.status.charAt(0).toUpperCase() + row.status.slice(1)) : 'Confirmed',
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
      patientAge,
      age,
      doctorId,
      doctorName,
      doctorSpecialization,
      date,
      time,
      reason,
      status,
    } = body;

    if (!patientName) {
      return NextResponse.json({ error: 'Missing required patient name' }, { status: 400 });
    }

    const rawPhone = patientPhone || body.phone || body.user_phone || '9876543210';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10) || '9876543210';
    const apptDate = date || getTodayDateStr();
    const apptTime = time || '10:00 AM';
    const parsedAge = age || patientAge ? parseInt(String(age || patientAge).replace(/\D/g, ''), 10) : null;

    // Create slot if date/time provided
    let slotId: string | null = null;
    try {
      const { startIso, endIso } = getSlotIso(apptDate, apptTime);
      const { data: slotData } = await supabaseAdmin
        .from('doctor_slots')
        .insert({
          doctor_id: doctorId || null,
          slot_start: startIso,
          slot_end: endIso,
          is_booked: true,
        })
        .select('id')
        .single();
      if (slotData) {
        slotId = slotData.id;
      }
    } catch (e) {
      // Continue
    }

    const { data, error } = await supabaseAdmin.from('appointments').insert({
      patient_name: patientName.trim(),
      phone: cleanPhone,
      age: parsedAge,
      doctor_id: doctorId || null,
      slot_id: slotId,
      source: reason || 'Voice AI',
      status: (status || 'confirmed').toLowerCase(),
      notes: `Booked for ${apptDate} at ${apptTime}`,
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
        patientAge: data.age,
        age: data.age,
        doctorId: data.doctor_id || doctorId,
        doctorName: doctorName || 'Dr. Assigned',
        doctorSpecialization: doctorSpecialization || 'General Consultation',
        date: apptDate,
        time: apptTime,
        reason: reason || 'Booked via Voice AI',
        status: status || 'Confirmed',
        createdAt: data.created_at,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
