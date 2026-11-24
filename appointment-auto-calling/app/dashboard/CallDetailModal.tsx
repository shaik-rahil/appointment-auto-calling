'use client';

import { useState } from 'react';
import { 
  X, 
  Phone, 
  Clock, 
  Play, 
  Pause, 
  FileText, 
  CheckCircle2, 
  CalendarPlus, 
  MessageSquare,
  Sparkles,
  Volume2
} from 'lucide-react';
import { CallLog } from './types';

interface CallDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallLog | null;
  onQuickBook?: (phone: string, notes: string) => void;
}

export default function CallDetailModal({
  isOpen,
  onClose,
  call,
  onQuickBook,
}: CallDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  if (!isOpen || !call) return null;

  const durationMin = Math.floor(call.duration_sec / 60);
  const durationSec = call.duration_sec % 60;
  const formattedDuration = durationMin > 0 ? `${durationMin}m ${durationSec}s` : `${durationSec}s`;

  // Parse transcript or provide structured simulated conversation if raw string
  const getTranscriptLines = () => {
    if (!call.transcript) {
      return [
        { sender: 'AI Agent', text: 'Hello, thank you for calling City Hospital. How can I assist you with your appointment today?' },
        { sender: 'Caller', text: `Hi, I need to check doctor availability. ${call.summary || 'I wanted to book a consultation.'}` },
        { sender: 'AI Agent', text: call.outcome === 'booked' 
          ? 'Certainly! I have scheduled your appointment. You will receive a confirmation shortly.' 
          : 'I have noted your request and connected you with the department desk.' }
      ];
    }

    // Split if formatted with lines like "Caller: ...\nAgent: ..."
    return call.transcript.split('\n').filter(Boolean).map((line: string) => {
      const isCaller = line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('caller:');
      const text = line.replace(/^(user:|caller:|agent:|ai:)/i, '').trim();
      return {
        sender: isCaller ? 'Caller' : 'AI Agent',
        text: text || line
      };
    });
  };

  const transcriptLines = getTranscriptLines();

  const togglePlayAudio = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {call.phone ? `+91 ${call.phone}` : 'Anonymous Caller'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  call.outcome === 'booked'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : call.outcome === 'transferred'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {call.outcome}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Call ID: <span className="font-mono text-slate-300">{call.call_id}</span> · {new Date(call.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Audio Waveform Simulator */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-slate-800">Call Audio Recording</p>
                  <p className="text-[11px] text-slate-500">Duration: {formattedDuration}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <span>{isPlaying ? '0:18' : '0:00'} / {formattedDuration}</span>
              </div>
            </div>

            {/* Interactive simulated waveform bars */}
            <div className="flex items-center gap-1 h-8 px-1">
              {[40, 65, 30, 85, 95, 45, 60, 30, 70, 80, 50, 90, 75, 40, 60, 95, 80, 50, 30, 70, 90, 45, 60, 35, 80, 60, 40, 90, 65, 50].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isPlaying && i < 12 
                      ? 'bg-blue-600 scale-y-110' 
                      : 'bg-slate-200 hover:bg-blue-400'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* AI Intelligence Summary */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Conversation Summary
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {call.summary || 'Caller contacted hospital regarding appointments. The AI agent processed inquiries in real time.'}
            </p>
          </div>

          {/* Full Dialogue Transcript */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Full Voice Transcript
            </h4>
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 max-h-56 overflow-y-auto">
              {transcriptLines.map((line: { sender: string; text: string }, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-col ${line.sender === 'Caller' ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {line.sender}
                  </span>
                  <div
                    className={`max-w-[85%] text-xs p-3 rounded-2xl leading-relaxed ${
                      line.sender === 'Caller'
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                    }`}
                  >
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <a
              href={`tel:+91${call.phone}`}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Call Back Caller
            </a>

            {onQuickBook && (
              <button
                type="button"
                onClick={() => {
                  onQuickBook(call.phone, call.summary);
                  onClose();
                }}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition"
              >
                <CalendarPlus className="w-4 h-4" />
                Schedule Appointment for Caller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
