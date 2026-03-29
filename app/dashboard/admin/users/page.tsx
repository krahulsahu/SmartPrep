'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/client-api';
import { Search, Users, UserCheck, UserX, Download } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
  isVerified?: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<{ data: User[] }>('/api/users');
        setUsers(payload.data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }), [users, search, roleFilter]);

  const handleExport = () => {
    const csv = ['Name,Email,Role,Joined', ...filtered.map((u) => `"${u.name}","${u.email}",${u.role},${new Date(u.createdAt).toLocaleDateString()}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Students', value: users.filter((u) => u.role === 'student').length, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, icon: UserX, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">User Management</h1>
          <p className="text-muted-foreground">Search, filter, and manage all registered accounts.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'student', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    roleFilter === r
                      ? 'bg-accent text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <CardTitle className="text-sm text-muted-foreground font-medium mt-2">
            {filtered.length} of {users.length} users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 px-4"><div className="h-3 w-32 skeleton" /></td>
                        <td className="py-3 px-4"><div className="h-3 w-48 skeleton" /></td>
                        <td className="py-3 px-4"><div className="h-5 w-16 skeleton rounded-full" /></td>
                        <td className="py-3 px-4"><div className="h-3 w-20 skeleton" /></td>
                      </tr>
                    ))
                  : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No users match your search.</p>
                      </td>
                    </tr>
                  )
                  : filtered.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {user.role === 'admin' ? '⬥ Admin' : '● Student'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
