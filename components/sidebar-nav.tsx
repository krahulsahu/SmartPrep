'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut, Menu, X, Brain } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
  userRole: string;
  userName: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function SidebarNav({ items, userRole, userName }: SidebarNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = ROUTES.LOGIN;
  };

  const navItems = items.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(item.href + '/'),
  }));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">SmartPrep</p>
            <p className="text-[10px] text-slate-400 leading-tight">AI Platform</p>
          </div>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {userRole}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative',
              item.active
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
            )}
            <span className={cn('w-5 h-5 flex-shrink-0', item.active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')}>
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-slate-500">{userRole}</p>
          </div>
        </div>
        <button
          onClick={() => void handleLogout()}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-indigo-600 text-white p-3.5 rounded-full shadow-xl shadow-indigo-500/40"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Content Offset */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
}
