'use client';

import { useEffect, useState } from 'react';

type DbHealth = {
  success: boolean;
  data: {
    connected: boolean;
    message: string;
    checkedAt: string;
  };
};

export function DbStatus() {
  const [status, setStatus] = useState<DbHealth['data'] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/health/db', {
          cache: 'no-store',
        });
        const payload = (await response.json()) as DbHealth;
        setStatus(payload.data);
      } catch {
        setStatus({
          connected: false,
          message: 'Unable to check database status',
          checkedAt: new Date().toISOString(),
        });
      }
    };

    void load();
  }, []);

  if (!status) {
    return (
      <div className="border-b border-border bg-card px-4 py-2 text-sm text-muted-foreground">
        Checking database connection...
      </div>
    );
  }

  return (
    <div
      className={`border-b px-4 py-2 text-sm ${
        status.connected
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <strong>DB:</strong> {status.connected ? 'Connected' : 'Disconnected'} | {status.message}
    </div>
  );
}
