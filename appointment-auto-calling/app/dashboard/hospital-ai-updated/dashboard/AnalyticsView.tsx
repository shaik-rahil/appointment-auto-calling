'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Clock, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { Appointment, CallLog, Doctor } from './types';

interface AnalyticsViewProps {
  appointments: Appointment[];
  callLogs: CallLog[];
  doctors: Doctor[];
}

export default function AnalyticsView({
  appointments,
  callLogs,
  doctors,
}: AnalyticsViewProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Compute department breakdown
  const deptCounts: Record<string, number> = {};
  appointments.forEach((a) => {
    const dept = a.doctors?.department || a.doctorSpecialization || 'General Medicine';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const totalAppts = appointments.length || 1;
  const deptList = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  // Hourly distribution (8 AM to 6 PM)
  const hourlyData = [
    { hour: '8 AM', count: 2 },
    { hour: '9 AM', count: 6 },
    { hour: '10 AM', count: 12 },
    { hour: '11 AM', count: 15 },
    { hour: '12 PM', count: 9 },
    { hour: '1 PM', count: 4 },
    { hour: '2 PM', count: 8 },
    { hour: '3 PM', count: 14 },
    { hour: '4 PM', count: 11 },
    { hour: '5 PM', count: 7 },
    { hour: '6 PM', count: 3 },
  ];

  const maxHourlyCount = Math.max(...hourlyData.map((d) => d.count), 1);

  // Call outcomes breakdown
  const totalCalls = callLogs.length || 1;
  const bookedCalls = callLogs.filter((c) => c.outcome === 'booked').length;
  const transferredCalls = callLogs.filter((c) => c.outcome === 'transferred').length;
  const infoCalls = callLogs.filter((c) => c.outcome === 'info_only' || c.outcome === 'missed').length;

  const bookedPercent = Math.round((bookedCalls / totalCalls) * 100);
  const transferredPercent = Math.round((transferredCalls / totalCalls) * 100);
  const infoPercent = Math.max(0, 100 - bookedPercent - transferredPercent);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Call Resolution
            </p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">38s</h4>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 14% faster than human reception
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Booking Conversion
            </p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{bookedPercent}%</h4>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High intent callers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Patients Queued
            </p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{appointments.length}</h4>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
              Across {doctors.length} Doctors
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reception Desk Load
            </p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">Optimal</h4>
            <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
              0 Missed Calls Today
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Hourly Patient Visit & Booking Density
              </h3>
              <p className="text-xs text-slate-400">Peak reception traffic observed at 11:00 AM & 3:00 PM</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-xl">
              Today&apos;s Trend
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2">
            {hourlyData.map((d, i) => {
              const heightPercent = Math.round((d.count / maxHourlyCount) * 100);
              const isHovered = hoveredHour === i;
              return (
                <div 
                  key={d.hour} 
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredHour(i)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-9 z-20 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
                        {d.count} patients
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isHovered 
                          ? 'bg-blue-600 shadow-md scale-y-105' 
                          : d.count > 10 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-blue-100 hover:bg-blue-300'
                      }`}
                      style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold transition ${isHovered ? 'text-blue-600 font-black' : 'text-slate-400'}`}>
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Share & Call Outcomes */}
        <div className="space-y-6">
          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Department Load Share
            </h3>

            <div className="space-y-4">
              {deptList.length === 0 ? (
                <p className="text-xs text-slate-400">No department appointments yet.</p>
              ) : (
                deptList.map(([dept, count]) => {
                  const pct = Math.round((count / totalAppts) * 100);
                  return (
                    <div key={dept} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{dept}</span>
                        <span className="text-slate-500 font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Call Conversion breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              AI Call Outcomes
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-900">Direct Bookings</span>
                <span className="text-xs font-bold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-200">
                  {bookedPercent}% ({bookedCalls})
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                <span className="text-xs font-bold text-purple-900">Desk Transfers</span>
                <span className="text-xs font-bold text-purple-800 px-2.5 py-0.5 rounded-full bg-purple-200">
                  {transferredPercent}% ({transferredCalls})
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-xs font-bold text-blue-900">General Inquiry</span>
                <span className="text-xs font-bold text-blue-800 px-2.5 py-0.5 rounded-full bg-blue-200">
                  {infoPercent}% ({infoCalls})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
