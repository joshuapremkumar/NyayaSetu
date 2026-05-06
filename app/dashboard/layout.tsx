'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileUp, Wand2, CheckCircle, Settings, LogOut, Menu, Scale } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const recentCaseId = typeof window !== 'undefined' ? localStorage.getItem('nyayasetu_recent_case_id') || 'case-001' : 'case-001';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/dashboard/upload', label: 'Upload Cases', icon: FileUp },
    { to: `/dashboard/workspace/${recentCaseId}`, label: 'AI Workspace', icon: Wand2 },
    { to: `/dashboard/verification/${recentCaseId}`, label: 'Verification', icon: CheckCircle },
    { to: '/dashboard/governance', label: 'Governance', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-[#0047CC] rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-sm">NyayaSetu</span>}
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to || pathname.startsWith(item.to.split('/').slice(0, 3).join('/') + '/');
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#0047CC] text-white' : 'text-slate-300 hover:bg-slate-800'} ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3 space-y-2">
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Menu className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">NyayaSetu AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Judicial Administrator</span>
            <Link href="/login" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
