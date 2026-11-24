import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseSpokenDate, parseSpokenTime } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Map Bolna webhook payload
    const callId = body.call_id || body.id || `call_${Date.now()}`;
    const userNumber = String(body.user_number || body.phone || body.caller_id || '').replace(/\D/g, '').slice(-10);
    const duration = body.call_duration || body.duration || 0;
    const summary = body.summary || body.call_summary || 'Call completed';
    const transcript = body.transcript || '';
    const recordingUrl = body.recording_url || body.recording || null;
    
    // Check outcome
    const isEmergency = Boolean(body.emergency || /108|emergency|గుండె నొప్పి|hospital emergency/i.test(transcript + summary));
    const isTransferred = Boolean(body.transferred || /receptionist|transfer/i.test(transcript + summary));
    const isBooked = Boolean(body.booking_confirmed || /confirmed|booked|ఖరారైంది|schedule/i.test(summary) || body.extracted_data?.appointment_date);

    let outcome = 'info_only';
    if (isEmergency) outcome = 'emergency_redirect';
    else if (isBooked) outcome = 'booked';
    else if (isTransferred) outcome = 'transferred';

    // 2. Save Call Log to Supabase
    try {
      await supabaseAdmin.from('call_logs').upsert({
        call_id: callId,
        phone: userNumber,
        duration_sec: Math.round(Number(duration)),
        summary: summary,
        transcript: transcript,
        outcome: outcome,
        recording_url: recordingUrl,
      }, { onConflict: 'call_id' });
    } catch (dbErr) {
      console.warn('Call log DB error (continuing):', dbErr);
    }

    // 3. Auto-Capture Appointment if booked
    if (isBooked) {
      const extracted = body.extracted_data || {};
      const patientName = extracted.patient_name || extracted.name || `Caller (${userNumber || 'Patient'})`;
      const doctor = extracted.doctor || extracted.doctor_name || 'Dr. Rahul Sharma';
      const rawDate = extracted.appointment_date || extracted.date || 'Wednesday';
      const rawTime = extracted.appointment_time || extracted.time || '10:00 AM';

      const cleanDate = parseSpokenDate(rawDate);
      const cleanTime = parseSpokenTime(rawTime);

      try {
        await supabaseAdmin.from('appointments').insert({
          patient_name: patientName,
          patient_phone: userNumber,
          appointment_date: cleanDate,
          appointment_time: cleanTime,
          source: 'Bolna Voice AI',
          call_id: callId,
          status: 'confirmed',
        });
      } catch (apptErr) {
        console.warn('Appointment auto-capture error:', apptErr);
      }
    }

    return NextResponse.json({
      status: 'logged',
      call_id: callId,
      outcome: outcome,
      appointment_captured: isBooked
    });
  } catch (err: any) {
    console.error('Call webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
