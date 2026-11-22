import { NextResponse } from 'next/server';
import { hasSupabaseServiceKey } from './supabase';

export function validateAgentRequest(request: Request): NextResponse | null {
  const expectedSecret = process.env.AGENT_SECRET;
  if (!expectedSecret || request.headers.get('authorization') !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!hasSupabaseServiceKey) {
    return NextResponse.json({ error: 'server_not_configured' }, { status: 503 });
  }

  return null;
}
