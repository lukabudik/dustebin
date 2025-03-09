'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon } from 'lucide-react';

interface Paste {
  id: string;
  content: string;
  language: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  views: number;
  hasPassword?: boolean;
}

interface PasswordFormProps {
  pasteId: string;
  onSuccess: (paste: Paste) => void;
}

export function PasswordForm({ pasteId, onSuccess }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pastes/${pasteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to access paste');
      }
      
      const paste = await response.json();
      onSuccess(paste);
    } catch (error) {
      console.error('Error accessing paste:', error);
      setError(error instanceof Error ? error.message : 'Invalid password');
      toast.error(error instanceof Error ? error.message : 'Invalid password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-8">
      <Card className="mx-auto w-full max-w-md border-border shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LockIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Password Protected</CardTitle>
          <CardDescription>
            This paste is protected with a password. Please enter the password to view it.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  error ? 'border-destructive' : ''
                }`}
                placeholder="Enter password"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Access Paste'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
