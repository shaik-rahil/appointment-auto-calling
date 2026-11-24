'use client';

import { BarChart3, Download, Printer, PieChart, Users, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Doctor, Appointment } from './types';

interface ReportsViewProps {
  doctors: Doctor[];
  appointments: Appointment[];
}

export default function ReportsView({ doctors, appointments }: ReportsViewProps) {
  // Compute metrics
  const total = appointments.length || 1;
  const completed = appointments.filter((a) => a.status === 'Completed').length;
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;
  const confirmed = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Scheduled').length;

  const completedPct = Math.round((completed / total) * 100);
  const cancelledPct = Math.round((cancelled / total) * 100);
  const confirmedPct = Math.round((confirmed / total) * 100);

  // Doctor workload breakdown
  const docWorkload = doctors.map((doc) => {
    const count = appointments.filter((a) => a.doctorId === doc.id || a.doctorName.includes(doc.name)).length;
    return { name: doc.name, specialization: doc.specialization, count };
  }).sort((a, b) => b.count - a.count);

  const handleExportCSV = () => {
    let csv = 'Patient Name,Mobile,Doctor,Specialization,Date,Time,Status,Reason\n';
    appointments.forEach((a) => {
      csv += `"${a.patientName}","+91 ${a.patientPhone}","${a.doctorName}","${a.doctorSpecialization}","${a.date}","${a.time}","${a.status}","${a.reason}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital_appointments_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Reports & Performance Analytics
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              OPD Insights
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Doctor consultation distribution, appointment completion rates, and daily clinic reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            Appointment Status Ratio
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Active Scheduled / Confirmed</span>
                <span className="font-bold text-blue-600">{confirmed} ({confirmedPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${confirmedPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Completed Consultations</span>
                <span className="font-bold text-emerald-600">{completed} ({completedPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${completedPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Cancelled Slots</span>
                <span className="font-bold text-rose-600">{cancelled} ({cancelledPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${cancelledPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Workload */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Doctor Consultation Workload
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {docWorkload.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">{doc.name}</h4>
                  <p className="text-[11px] text-slate-400">{doc.specialization}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-xs font-mono">
                    {doc.count} appointments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
