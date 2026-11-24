import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Real-time call cache (empty by default so only real incoming calls are shown)
let cachedLogs: any[] = [];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ calls: cachedLogs });
    }

    return NextResponse.json({ calls: data });
  } catch (err: any) {
    return NextResponse.json({ calls: cachedLogs });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newCall = {
      id: body.id || `call_${Date.now()}`,
      call_id: body.call_id || `call_${Date.now()}`,
      phone: String(body.phone || body.user_number || '').replace(/\D/g, '').slice(-10),
      duration_sec: Number(body.duration_sec || body.duration || 0),
      summary: body.summary || 'Phone consultation inquiry',
      transcript: body.transcript || '',
      outcome: body.outcome || 'info_only',
      created_at: new Date().toISOString(),
      recording_url: body.recording_url || null,
      emergency_flag: Boolean(body.emergency_flag),
    };

    cachedLogs = [newCall, ...cachedLogs];

    // Attempt push to Supabase
    try {
      await supabaseAdmin.from('call_logs').upsert({
        call_id: newCall.call_id,
        phone: newCall.phone,
        duration_sec: newCall.duration_sec,
        summary: newCall.summary,
        transcript: newCall.transcript,
        outcome: newCall.outcome,
        recording_url: newCall.recording_url,
      }, { onConflict: 'call_id' });
    } catch (e) {
      // Ignored if offline
    }

    return NextResponse.json({ success: true, call: newCall });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
