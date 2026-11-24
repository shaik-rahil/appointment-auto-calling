'use client';

import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  PhoneCall, 
  CalendarPlus, 
  Zap, 
  CheckCircle2, 
  Play
} from 'lucide-react';
import { Doctor } from './types';
import { supabase } from '@/lib/supabase';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onSimulatedBooking: (booking: any) => void;
  onSimulatedCall: (call: any) => void;
}

export default function SimulatorModal({
  isOpen,
  onClose,
  doctors,
  onSimulatedBooking,
  onSimulatedCall,
}: SimulatorModalProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const runQuickSimulation = async (scenario: 'booking' | 'call_inquiry' | 'urgent_cardio') => {
    setLoading(true);
    setSuccessMsg(null);

    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
    const targetDoc = doctors[0] || { id: 'doc_1', name: 'Dr. Sharma', department: 'Cardiology' };

    try {
      if (scenario === 'booking' || scenario === 'urgent_cardio') {
        const patientNames = ['Ananya Deshmukh', 'Vikramaditya Roy', 'Priya Kulkarni', 'Arjun Nambiar', 'Sunita Rao'];
        const chosenPatient = patientNames[Math.floor(Math.random() * patientNames.length)];
        
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);

        const newAppt = {
          id: `sim_appt_${Date.now()}`,
          patient_name: chosenPatient,
          phone: String(randomNum),
          source: 'Bolna Voice AI Agent',
          status: 'confirmed',
          created_at: new Date().toISOString(),
          doctors: { name: targetDoc.name, department: targetDoc.department || targetDoc.specialization },
          doctor_slots: { slot_start: now.toISOString() }
        };

        // Also create matching call log
        const newCall = {
          id: `sim_call_${Date.now()}`,
          call_id: `call_bolna_${Date.now()}`,
          phone: String(randomNum),
          duration_sec: 42,
          outcome: 'booked' as const,
          summary: `Patient ${chosenPatient} called requesting earliest consultation with ${targetDoc.name}. AI booked slot for ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          transcript: `Agent: Hello, welcome to City Hospital appointment line.\nCaller: Hello, I would like to consult with ${targetDoc.name}.\nAgent: Checking available slots... Dr. ${targetDoc.name} is available today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Should I book this for you?\nCaller: Yes, please book it under ${chosenPatient}.\nAgent: Confirmed! You will receive an SMS reminder. Have a great day!`,
          created_at: new Date().toISOString(),
        };

        // Try pushing to Supabase
        await supabase.from('appointments').insert({
          patient_name: newAppt.patient_name,
          phone: newAppt.phone,
          source: newAppt.source,
          status: 'confirmed',
          doctor_id: targetDoc.id,
        });

        await supabase.from('call_logs').insert({
          call_id: newCall.call_id,
          phone: newCall.phone,
          duration_sec: newCall.duration_sec,
          summary: newCall.summary,
          transcript: newCall.transcript,
          outcome: newCall.outcome,
        });

        onSimulatedBooking(newAppt);
        onSimulatedCall(newCall);
        setSuccessMsg(`Simulated AI booking created for ${chosenPatient}! Real-time events dispatched.`);
      } else {
        // Inquiry call simulation
        const newCall = {
          id: `sim_call_${Date.now()}`,
          call_id: `call_bolna_${Date.now()}`,
          phone: String(randomNum),
          duration_sec: 28,
          outcome: 'info_only' as const,
          summary: 'Caller inquired about OPD consultation hours and hospital location on MG Road.',
          transcript: 'Agent: City Hospital support, how may I help?\nCaller: Hi, could you tell me when the cardiology OPD opens tomorrow?\nAgent: Cardiology OPD opens at 9:00 AM with Dr. Sharma.\nCaller: Thank you, that is all I needed.\nAgent: You are welcome, take care!',
          created_at: new Date().toISOString(),
        };

        await supabase.from('call_logs').insert({
          call_id: newCall.call_id,
          phone: newCall.phone,
          duration_sec: newCall.duration_sec,
          summary: newCall.summary,
          transcript: newCall.transcript,
          outcome: newCall.outcome,
        });

        onSimulatedCall(newCall);
        setSuccessMsg(`Simulated inquiry call logged (+91 ${newCall.phone})!`);
      }
    } catch (err: any) {
      console.warn('Simulation database save fallback:', err);
      setSuccessMsg('Simulated event dispatched in UI test mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Interactive AI Call Simulator</h3>
              <p className="text-xs text-purple-200">Test real-time WebSocket sync, chimes & alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Trigger live voice agent booking and phone events with one click. Test how the receptionist dashboard updates instantaneously via Supabase WebSockets.
          </p>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => runQuickSimulation('booking')}
              className="w-full p-4 rounded-2xl border border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Simulate Incoming AI Voice Booking</h4>
                  <p className="text-xs text-slate-500">AI caller books appointment with available doctor</p>
                </div>
              </div>
              <Play className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => runQuickSimulation('call_inquiry')}
              className="w-full p-4 rounded-2xl border border-purple-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 group-hover:bg-purple-600 group-hover:text-white text-purple-600 flex items-center justify-center transition">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Simulate General Information Call</h4>
                  <p className="text-xs text-slate-500">Caller asks for doctor schedule and OPD timings</p>
                </div>
              </div>
              <Play className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Close Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
