'use client';

import { 
  LayoutDashboard, 
  Stethoscope, 
  CalendarDays, 
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  X,
  Activity
} from 'lucide-react';
import { ActiveModule } from './types';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  todayAppointmentsCount: number;
  availableDoctorsCount: number;
}

export default function Sidebar({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  todayAppointmentsCount,
  availableDoctorsCount,
}: SidebarProps) {
  const menuItems: { id: ActiveModule; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Brand */}
          <div className="p-6 pb-5 flex items-center justify-between border-b border-slate-100/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-snug">
                  MedPulse Clinic
                </h1>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Health Admin Portal
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-sm font-semibold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer System Status */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-slate-500">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                SYSTEM STATUS
              </p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                HIPAA Secure v2.4
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      </aside>
    </>
  );
}
