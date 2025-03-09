import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';
import { CodeIcon, GithubIcon } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 text-xs font-medium">
            <CodeIcon className="h-3 w-3 text-primary" />
            <span className="hidden sm:inline">{SITE_NAME}</span>
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-2">
            <Link
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
          </nav>
          <Link
            href="https://github.com/yourusername/dustebin"
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
