'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { Brain, Target, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    const passwordErrors = [
      password.length < 8 ? 'at least 8 characters' : null,
      !/[A-Z]/.test(password) ? 'one uppercase letter' : null,
      !/[0-9]/.test(password) ? 'one number' : null,
      !/[^A-Za-z0-9]/.test(password) ? 'one special character' : null,
    ].filter(Boolean);
    if (passwordErrors.length > 0) { setError(`Password must include ${passwordErrors.join(', ')}`); return; }
    try {
      const result = await register(name, email, password);
      setSuccess(result.message || 'Account created. Please verify your email before signing in.');
      setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  const stats = [
    { icon: Target, value: '95%', label: 'Success Rate' },
    { icon: CheckCircle2, value: '50K+', label: 'Questions' },
    { icon: Trophy, value: '10K+', label: 'Students' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-slate-950 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SmartPrep <span className="text-indigo-400">AI</span></span>
          </Link>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start your exam<br />
            <span className="gradient-text">preparation today</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">Join thousands of students acing their exams with AI-powered learning.</p>
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center p-4 rounded-xl bg-white/5 border border-white/8">
                <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">Smart learning for JEE · NEET · UPSC · and more</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">SmartPrep AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">Sign up free — email verification required before login.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm mb-4">
              {success}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</label>
              <Input id="name" type="text" placeholder="John Doe" value={name}
                onChange={(e) => setName(e.target.value)} disabled={isLoading}
                className="h-11 bg-background border-border" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                className="h-11 bg-background border-border" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
              <Input id="password" type="password" placeholder="Min 8 chars, uppercase, number & symbol" value={password}
                onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                className="h-11 bg-background border-border" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm Password</label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading}
                className="h-11 bg-background border-border" />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
              {isLoading ? 'Creating account…' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href={ROUTES.LOGIN} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
