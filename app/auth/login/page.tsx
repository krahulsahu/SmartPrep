'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { Brain, BookOpen, BarChart3, Zap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      const user = await login(email, password);
      window.location.href = user.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) { setError('Enter your email first to resend verification.'); return; }
    setError(''); setIsResending(true);
    try {
      const resp = await fetch('/api/auth/resend-verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json() as { message?: string };
      setNotice(data.message || 'Verification email sent.');
    } catch {
      setError('Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const features = [
    { icon: BookOpen, text: 'Thousands of practice questions' },
    { icon: BarChart3, text: 'Deep performance analytics' },
    { icon: Zap, text: 'AI-generated instant feedback' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-slate-950 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.2),transparent_60%)]" />
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
            Welcome back to<br />
            <span className="gradient-text">your success journey</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">Continue your preparation, track progress, and master your exam.</p>
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
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
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Sign in</h1>
            <p className="text-muted-foreground">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {notice && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm mb-4">
              {notice}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                className="h-11 bg-background border-border" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <Link href={ROUTES.FORGOT_PASSWORD} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                className="h-11 bg-background border-border" />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
              {isLoading ? 'Signing in…' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <button type="button" disabled={isResending || isLoading}
              onClick={() => void handleResendVerification()}
              className="w-full h-10 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 text-sm font-medium rounded-xl transition-colors">
              {isResending ? 'Sending…' : 'Resend Verification Email'}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href={ROUTES.REGISTER} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign up</Link>
            </p>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
