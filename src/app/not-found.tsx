import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestionIcon, HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <FileQuestionIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link href="/" className="flex items-center gap-2">
          <HomeIcon className="h-4 w-4" />
          Return Home
        </Link>
      </Button>
    </div>
  );
}
