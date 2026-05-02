import { Link, useLocation, Outlet } from 'react-router-dom';
import { BarChart3, FileUp, Wand2, CheckCircle, Settings, LogOut, Menu, Scale } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/dashboard/upload', label: 'Upload Cases', icon: FileUp },
    { to: '/dashboard/workspace/case-001', label: 'AI Workspace', icon: Wand2 },
    { to: '/dashboard/verification/case-001', label: 'Verification', icon: CheckCircle },
    { to: '/dashboard/governance', label: 'Governance', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-[#0047CC] rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-sm">CourtAction</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to || pathname.startsWith(item.to.split('/').slice(0, 3).join('/') + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#0047CC] text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">CourtAction AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Judicial Administrator</span>
            <Link to="/login" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
