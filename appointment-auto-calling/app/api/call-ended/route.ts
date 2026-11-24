import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseSpokenDate, parseSpokenTime, getTodayDateStr } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('Call ended webhook received:', JSON.stringify(payload, null, 2));

    const callId = payload.call_id || payload.conversation_id || `call_${Date.now()}`;
    const callerPhone = payload.user_phone || payload.phone || payload.caller_phone || '';
    const cleanPhone = String(callerPhone).replace(/\D/g, '').slice(-10);
    const transcript = payload.transcript || (Array.isArray(payload.messages) ? payload.messages.map((m: any) => `${m.role}: ${m.content}`).join('\n') : '');
    const durationSec = Number(payload.duration || payload.call_duration || 0);

    // Determine outcome
    const extractedData = payload.extracted_data || payload.context || {};
    const bookingConfirmed = payload.booking_confirmed || 
      extractedData.booking_confirmed || 
      /confirmed|booked|success/i.test(payload.status || '') ||
      (extractedData.doctor && (extractedData.date || extractedData.time));

    let outcome = 'inquiry_only';
    if (payload.emergency_detected || extractedData.is_emergency) {
      outcome = 'emergency_escalated';
    } else if (payload.transferred_to_human || extractedData.transferred) {
      outcome = 'human_transferred';
    } else if (bookingConfirmed) {
      outcome = 'booking_confirmed';
    }

    // 1. Record Call Log in Supabase if table exists
    try {
      await supabaseAdmin.from('call_logs').insert({
        call_id: callId,
        caller_phone: cleanPhone,
        duration_seconds: durationSec,
        outcome: outcome,
        language: payload.language || 'te',
        emergency_detected: outcome === 'emergency_escalated',
        human_transfer: outcome === 'human_transferred',
        transcript: transcript,
        recording_url: payload.recording_url || null,
        metadata: payload,
      });
    } catch (dbErr) {
      // Continue
    }

    // 2. If appointment was verbally confirmed, ensure it exists in appointments table
    if (bookingConfirmed) {
      const patientName = extractedData.patient_name || extractedData.name || 'Caller';
      const ageVal = extractedData.age || extractedData.patient_age;
      const parsedAge = ageVal ? parseInt(String(ageVal).replace(/\D/g, ''), 10) : null;
      const doctorName = extractedData.doctor || 'Dr. Rahul Sharma';
      const rawDate = extractedData.date || getTodayDateStr();
      const rawTime = extractedData.time || '10:00 AM';

      const cleanDate = parseSpokenDate(rawDate);
      const cleanTime = parseSpokenTime(rawTime);

      try {
        let slotId: string | null = null;
        try {
          const slotIso = new Date(`${cleanDate} ${cleanTime}`).toISOString();
          const { data: slotData } = await supabaseAdmin
            .from('doctor_slots')
            .insert({ slot_start: slotIso, is_booked: true })
            .select('id')
            .maybeSingle();
          if (slotData) slotId = slotData.id;
        } catch (e) {}

        await supabaseAdmin.from('appointments').insert({
          patient_name: patientName,
          phone: cleanPhone || '9999999999',
          age: parsedAge,
          source: 'Bolna Voice AI',
          status: 'confirmed',
          slot_id: slotId,
        });
      } catch (apptErr) {
        console.error('Call ended appointment auto-capture error:', apptErr);
      }
    }

    return NextResponse.json({
      success: true,
      call_id: callId,
      outcome: outcome,
      message: 'Call logged and processed successfully'
    }, { status: 200 });
  } catch (err: any) {
    console.error('Error handling call-ended webhook:', err);
    return NextResponse.json({ success: true, warning: err.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'call-ended-webhook' });
}
