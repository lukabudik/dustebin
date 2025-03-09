'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { SITE_NAME } from '@/lib/constants';
import { CodeIcon, GithubIcon, PlusIcon } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:opacity-90">
            <CodeIcon className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button asChild variant="default" size="sm" className="h-9">
              <Link href="/">
                <PlusIcon className="mr-1 h-4 w-4" />
                New Paste
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="h-9">
            <Link 
              href="https://github.com/yourusername/dustebin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <GithubIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
