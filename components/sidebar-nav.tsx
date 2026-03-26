'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut, Menu, X } from 'lucide-react';
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
    active: pathname === item.href || pathname.startsWith(item.href),
  }));

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-accent text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 z-30',
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                SmartPrep
              </h2>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                  item.active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <span className="w-5 h-5">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            <div className="px-4 py-3 bg-sidebar-accent rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content Offset */}
      <div className="hidden md:block w-64" />
    </>
  );
}
