'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { Brain, ArrowLeft } from 'lucide-react';

// Must be a separate component because useSearchParams requires Suspense
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!token) { setError('Password reset link is invalid or expired.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setIsLoading(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      router.push(`${ROUTES.LOGIN}?message=${encodeURIComponent('Password reset successfully. You can now sign in.')}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">New Password</label>
        <Input
          id="password"
          type="password"
          placeholder="Min 8 chars, uppercase, number & symbol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="h-11 bg-background border-border"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm Password</label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="h-11 bg-background border-border"
        />
      </div>

      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? 'Resetting…' : 'Reset Password'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">SmartPrep AI</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Set new password</h1>
          <p className="text-muted-foreground">Choose a strong password you haven&apos;t used before.</p>
        </div>

        {/* Suspense wraps the component that uses useSearchParams */}
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-11 skeleton rounded-xl" />
            <div className="h-11 skeleton rounded-xl" />
            <div className="h-11 skeleton rounded-xl" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 text-center">
          <Link href={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
