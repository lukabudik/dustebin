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
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:opacity-90">
            <CodeIcon className="text-primary h-5 w-5" />
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!isHomePage && (
            <Button asChild variant="default" size="sm" className="h-9 px-2 sm:px-3">
              <Link href="/">
                <PlusIcon className="mr-1 h-4 w-4" />
                <span className="xs:inline hidden">New Paste</span>
                <span className="xs:hidden">New</span>
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="h-9 px-2 sm:px-3">
            <Link
              href="https://github.com/lukabudik/dustebin"
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
