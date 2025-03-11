'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CodeEditor } from '@/components/editor/code-editor';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPIRATION_OPTIONS } from '@/lib/constants';
import { CreatePasteInput } from '@/lib/validations';
import { detectLanguage } from '@/lib/utils/language-detector';

export function PasteForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [expiration, setExpiration] = useState('never');
  const [password, setPassword] = useState('');

  // Automatically detect language when content changes
  useEffect(() => {
    if (content.trim().length > 5) {
      const detectedLang = detectLanguage(content);
      setLanguage(detectedLang);
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsSubmitting(true);

    try {
      const pasteData: CreatePasteInput = {
        content,
        language,
        expiration: expiration as 'never' | '1h' | '1d' | '7d' | '30d',
        password: password || undefined,
      };

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pasteData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create paste');
      }

      const paste = await response.json();

      toast.success('Paste created successfully!');

      router.push(`/${paste.id}`);
    } catch (error) {
      console.error('Error creating paste:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create paste');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col" suppressHydrationWarning>
      {/* Form Controls */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-4">
          <div>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger id="expiration" className="w-40">
                <SelectValue placeholder="Expiration" />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border-input bg-background h-10 w-40 rounded-md border px-3 py-2 text-sm"
              placeholder="Password (optional)"
              suppressHydrationWarning
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Paste'
          )}
        </Button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto p-4 pb-8">
        <div className="flex h-full min-h-[300px] flex-col overflow-auto rounded-md border">
          <CodeEditor
            value={content}
            onChange={setContent}
            language={language}
            height="100%"
            showSyntaxHighlighting={false}
            placeholder="Paste or type your code here..."
          />
        </div>
      </div>
    </form>
  );
}
