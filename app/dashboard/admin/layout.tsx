'use client';

import { useAuth } from '@/lib/auth-context';
import { SidebarNav } from '@/components/sidebar-nav';
import { ROUTES } from '@/lib/constants';
import {
  Users,
  Settings,
  BarChart3,
  Home,
  FileQuestion,
  ClipboardList,
  BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (!isLoading && user?.role !== 'admin') {
      router.push(ROUTES.STUDENT_DASHBOARD);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      label: 'Overview',
      href: ROUTES.ADMIN_DASHBOARD,
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Student View',
      href: ROUTES.STUDENT_DASHBOARD,
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: 'Questions',
      href: ROUTES.ADMIN_QUESTIONS,
      icon: <FileQuestion className="w-5 h-5" />,
    },
    {
      label: 'Tests',
      href: ROUTES.ADMIN_TESTS,
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      label: 'User Management',
      href: ROUTES.ADMIN_USERS,
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Content Moderation',
      href: ROUTES.ADMIN_CONTENT,
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: 'Analytics',
      href: ROUTES.ADMIN_ANALYTICS,
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav
        items={navItems}
        userRole="Administrator"
        userName={user.name}
      />
      <main className="flex-1 ml-0 md:ml-0">
        {children}
      </main>
    </div>
  );
}
