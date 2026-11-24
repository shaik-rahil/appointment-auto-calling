'use client';

import { useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  Clock, 
  MessageSquare, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { CallLog } from './types';

interface VoiceCallsViewProps {
  calls: CallLog[];
  onSelectCall: (call: CallLog) => void;
  onRefresh: () => void;
  onSimulateCall?: () => void;
}

export default function VoiceCallsView({
  calls,
  onSelectCall,
  onRefresh,
  onSimulateCall,
}: VoiceCallsViewProps) {
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = calls.filter((c) => {
    if (filterOutcome !== 'all' && c.outcome !== filterOutcome) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.phone.includes(q) ||
        (c.summary && c.summary.toLowerCase().includes(q)) ||
        (c.transcript && c.transcript.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getOutcomeBadge = (outcome: string, emergency?: boolean) => {
    if (emergency || outcome === 'emergency_redirect') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          Emergency Diverted (108)
        </span>
      );
    }
    switch (outcome) {
      case 'booked':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Appointment Booked
          </span>
        );
      case 'transferred':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Transferred (Receptionist)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Inquiry Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              AI TELEPHONY DESK
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Live Call Capturing
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Voice Conversations & Call Transcripts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time phone conversations handled by the AI voice agent, including transcripts and bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Calls</span>
          </button>

          {onSimulateCall && (
            <button
              onClick={onSimulateCall}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Simulate Real Phone Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search transcripts, phone numbers, or summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setFilterOutcome('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterOutcome === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            All Calls ({calls.length})
          </button>
          <button
            onClick={() => setFilterOutcome('booked')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterOutcome === 'booked' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Booked ({calls.filter((c) => c.outcome === 'booked').length})
          </button>
          <button
            onClick={() => setFilterOutcome('transferred')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterOutcome === 'transferred' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Transferred ({calls.filter((c) => c.outcome === 'transferred').length})
          </button>
        </div>
      </div>

      {/* Calls List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
            <PhoneCall className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="font-bold text-sm text-slate-700">No Phone Calls Logged Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When a caller speaks with the AI phone system, the full conversation transcript and booking will appear here automatically.
            </p>
          </div>
        ) : (
          filtered.map((call) => (
            <div
              key={call.id || call.call_id}
              onClick={() => onSelectCall(call)}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 font-mono">
                      +91 {call.phone}
                    </span>
                    {getOutcomeBadge(call.outcome, call.emergency_flag)}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(call.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 max-w-2xl font-medium">
                    {call.summary || 'Caller inquiry processed.'}
                  </p>

                  {call.transcript && (
                    <div className="mt-2 text-[11px] text-blue-700 bg-blue-50/70 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1.5 font-medium line-clamp-1 max-w-2xl">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{call.transcript.split('\n')[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center flex-shrink-0">
                <div className="text-right text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-extrabold text-slate-700">{call.duration_sec}s</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCall(call);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition flex items-center gap-1"
                >
                  <span>View Transcript</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
