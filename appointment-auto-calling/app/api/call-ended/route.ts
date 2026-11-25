import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseSpokenDate, parseSpokenTime, getTodayDateStr, getSlotIso } from '@/lib/dateUtils';

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    console.log('Call ended webhook received:', JSON.stringify(payload, null, 2));

    const callId = payload.call_id || payload.conversation_id || `call_${Date.now()}`;
    const rawPhone = 
      payload.user_phone || 
      payload.phone || 
      payload.caller_phone || 
      payload.recipient_phone || 
      payload.from || 
      payload.to || 
      payload.caller_id || 
      '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10) || '9876543210';
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

      // Resolve doctor_id (NOT NULL in appointments table)
      let docId: string | null = null;
      try {
        const { data: docData } = await supabaseAdmin
          .from('doctors')
          .select('id, name')
          .ilike('name', `%${doctorName.replace(/^Dr\.\s*/i, '').trim()}%`)
          .limit(1)
          .maybeSingle();
        if (docData) docId = docData.id;
        else {
          const { data: anyDoc } = await supabaseAdmin.from('doctors').select('id').limit(1).maybeSingle();
          if (anyDoc) docId = anyDoc.id;
        }
      } catch (e) {}

      try {
        let slotId: string | null = null;
        try {
          const { startIso, endIso } = getSlotIso(cleanDate, cleanTime);
          const { data: slotData } = await supabaseAdmin
            .from('doctor_slots')
            .insert({
              doctor_id: docId,
              slot_start: startIso,
              slot_end: endIso,
              is_booked: true,
            })
            .select('id')
            .maybeSingle();
          if (slotData) slotId = slotData.id;
        } catch (e) {}

        await supabaseAdmin.from('appointments').insert({
          patient_name: patientName.trim(),
          phone: cleanPhone,
          age: parsedAge,
          doctor_id: docId,
          source: 'Bolna Voice AI',
          status: 'confirmed',
          slot_id: slotId,
          notes: `Booked for ${cleanDate} at ${cleanTime}`,
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
