import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';
import { CodeIcon, GithubIcon } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 text-xs font-medium">
            <CodeIcon className="text-primary h-3 w-3" />
            <span className="hidden sm:inline">{SITE_NAME}</span>
          </Link>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-2">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground hidden text-xs sm:inline"
            >
              About
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground hidden text-xs sm:inline"
            >
              Privacy
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground hidden text-xs sm:inline"
            >
              Terms
            </Link>
            <div className="sm:hidden">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground mr-1 text-xs"
              >
                About
              </Link>
            </div>
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
