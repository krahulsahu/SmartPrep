'use client';

import { useAuth } from '@/lib/auth-context';
import { SidebarNav } from '@/components/sidebar-nav';
import { ROUTES } from '@/lib/constants';
import {
  BookOpen,
  BarChart3,
  Clock,
  Home,
  Shield,
  Users,
  FileQuestion,
  ClipboardList,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
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
      href: ROUTES.STUDENT_DASHBOARD,
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Practice Tests',
      href: ROUTES.STUDENT_PRACTICE,
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: 'My Tests',
      href: ROUTES.STUDENT_TESTS,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: 'Analytics',
      href: ROUTES.STUDENT_ANALYTICS,
      icon: <BarChart3 className="w-5 h-5" />,
    },
    ...(user.role === 'admin'
      ? [
          {
            label: 'Admin Overview',
            href: ROUTES.ADMIN_DASHBOARD,
            icon: <Shield className="w-5 h-5" />,
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
            label: 'Users',
            href: ROUTES.ADMIN_USERS,
            icon: <Users className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav
        items={navItems}
        userRole={user.role === 'admin' ? 'Administrator' : 'Student'}
        userName={user.name}
      />
      <main className="flex-1 ml-0 md:ml-0">
        {children}
      </main>
    </div>
  );
}
