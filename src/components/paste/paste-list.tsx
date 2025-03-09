'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/helpers';
import { CodeIcon, ClockIcon, EyeIcon } from 'lucide-react';

interface Paste {
  id: string;
  language: string;
  createdAt: string | Date;
  views: number;
}

export function PasteList() {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastes = async () => {
      try {
        const response = await fetch('/api/pastes?limit=10');
        
        if (!response.ok) {
          throw new Error('Failed to fetch pastes');
        }
        
        const data = await response.json();
        setPastes(data.pastes);
      } catch (error) {
        console.error('Error fetching pastes:', error);
        setError('Failed to load recent pastes');
        toast.error('Failed to load recent pastes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastes();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Pastes</CardTitle>
          <CardDescription>Loading recent pastes...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <svg className="h-8 w-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Pastes</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6 text-muted-foreground">
          <p>Unable to load pastes. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (pastes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Pastes</CardTitle>
          <CardDescription>Recently created public pastes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CodeIcon className="mb-2 h-10 w-10 text-muted-foreground/60" />
          <p className="mb-1 text-lg font-medium">No pastes found</p>
          <p className="text-sm text-muted-foreground">
            Be the first to create one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Pastes</CardTitle>
        <CardDescription>Recently created public pastes</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {pastes.map((paste) => (
            <li key={paste.id} className="overflow-hidden rounded-lg border border-border transition-all hover:border-border/80 hover:shadow-sm">
              <Link href={`/${paste.id}`} className="block p-3">
                <div className="mb-1 font-medium">
                  {paste.language.charAt(0).toUpperCase() + paste.language.slice(1)} Paste
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary flex items-center gap-1">
                    <CodeIcon className="h-3 w-3" />
                    <span>{paste.language.charAt(0).toUpperCase() + paste.language.slice(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>{formatDate(paste.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span>{paste.views} view{paste.views !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
