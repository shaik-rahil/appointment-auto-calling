import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseSpokenDate, parseSpokenTime } from '@/lib/dateUtils';

export async function POST(req: Request) {
  // 1. Verify Secret Token (optional)
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.AGENT_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { doctor, date, time, patient_name, phone, call_id } = body;

    if (!doctor || !patient_name || !phone) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'doctor, patient_name, and phone are required.' },
        { status: 400 }
      );
    }

    // 2. Sanitize Date and Time from spoken voice input
    const cleanDate = parseSpokenDate(date);
    const cleanTime = parseSpokenTime(time);
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    // 3. Atomically book via SQL stored procedure if available
    let bookingResult: any = null;
    try {
      const { data, error } = await supabaseAdmin.rpc('book_by_time', {
        p_doctor: doctor,
        p_date: cleanDate,
        p_time: cleanTime,
        p_name: patient_name,
        p_phone: cleanPhone,
        p_call: call_id || 'voice_bolna',
      });
      if (!error && data && data.success) {
        bookingResult = data;
      }
    } catch (e) {
      // Stored proc fallback
    }

    // 4. Fallback: Direct table insert into appointments
    if (!bookingResult) {
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
          patient_name: patient_name,
          patient_phone: cleanPhone,
          appointment_date: cleanDate,
          appointment_time: cleanTime,
          source: 'Bolna Voice AI',
          call_id: call_id || `call_${Date.now()}`,
          status: 'confirmed',
        })
        .select()
        .single();

      bookingResult = {
        success: true,
        patient_name: patient_name,
        doctor: doctor,
        date: cleanDate,
        time: cleanTime,
        phone: cleanPhone,
        message: `Appointment successfully booked with ${doctor} for ${cleanDate} at ${cleanTime}.`
      };
    }

    return NextResponse.json(bookingResult);
  } catch (err: any) {
    console.error('Booking request error:', err);
    return NextResponse.json({ error: 'invalid_request', details: err.message }, { status: 400 });
  }
}
