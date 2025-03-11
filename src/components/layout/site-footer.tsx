import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';
import { CodeIcon, GithubIcon } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 text-xs font-medium">
            <CodeIcon className="text-primary h-3 w-3" />
            <span className="hidden sm:inline">{SITE_NAME}</span>
          </Link>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-2 sm:flex">
            <Link href="/about" className="text-muted-foreground hover:text-foreground text-xs">
              About
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-xs">
              Privacy
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground text-xs">
              Terms
            </Link>
          </nav>
          <Link
            href="https://github.com/lukabudik/dustebin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <GithubIcon className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
