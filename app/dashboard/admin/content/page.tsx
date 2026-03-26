'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ContentPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Content Moderation</h1>
      <p className="text-muted-foreground mb-8">Reserved for future moderation workflows and review queues.</p>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Pending Review
          </CardTitle>
          <CardDescription>No moderation queue is implemented yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Questions and tests are currently managed directly by admins through their dedicated pages.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
