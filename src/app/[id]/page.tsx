'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { PasteView } from '@/components/paste/paste-view';
import { PasswordForm } from '@/components/paste/password-form';
import { AlertCircleIcon, FileIcon, LoaderIcon } from 'lucide-react';

interface Paste {
  id: string;
  content: string;
  title?: string | null;
  language: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  views: number;
  hasPassword?: boolean;
  requiresPassword?: boolean;
  burnAfterRead?: boolean;
}

export default function PastePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  
  // Track if we've already fetched the paste to prevent duplicate API calls
  // (especially important in React strict mode during development)
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Skip if we've already fetched this paste
    if (hasFetchedRef.current) return;
    
    const fetchPaste = async () => {
      try {
        hasFetchedRef.current = true;
        
        const response = await fetch(`/api/pastes/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch paste');
        }
        
        const data = await response.json();
        
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setIsLoading(false);
          return;
        }
        
        setPaste(data);
      } catch (error) {
        console.error('Error fetching paste:', error);
        setError(error instanceof Error ? error.message : 'Failed to load paste');
        toast.error(error instanceof Error ? error.message : 'Failed to load paste');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaste();
    
    // Reset fetch tracking when ID changes
    return () => {
      hasFetchedRef.current = false;
    };
  }, [id]);

  const handlePasswordSuccess = (pasteData: Paste) => {
    setPaste(pasteData);
    setRequiresPassword(false);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <LoaderIcon className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading paste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircleIcon className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="py-8">
        <PasswordForm pasteId={id} onSuccess={handlePasswordSuccess} />
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Paste Not Found</h1>
          <p className="text-muted-foreground">The paste you are looking for does not exist or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)]">
      <PasteView paste={paste} />
    </div>
  );
}
