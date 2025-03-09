'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CodeEditor } from '@/components/editor/code-editor';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/helpers';
import { AlertTriangleIcon, FlameIcon } from 'lucide-react';

interface PasteViewProps {
  paste: {
    id: string;
    content: string;
    language: string;
    createdAt: string | Date;
    expiresAt?: string | Date | null;
    views: number;
    burnAfterRead?: boolean;
  };
  onDelete?: () => void;
}

export function PasteView({ paste, onDelete }: PasteViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [hasBeenBurned, setHasBeenBurned] = useState(false);
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/${paste.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(paste.content);
    toast.success('Content copied to clipboard');
  };
  
  const handleBurn = async () => {
    if (hasBeenBurned) return;
    
    setIsBurning(true);
    
    try {
      const response = await fetch(`/api/pastes/${paste.id}/burn`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to burn paste');
      }
      
      setHasBeenBurned(true);
      setShowContent(true); // Show the content after burning
      toast.success('Paste has been burned - this is your only chance to view it');
      
    } catch (error) {
      console.error('Error burning paste:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to burn paste');
    } finally {
      setIsBurning(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this paste?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/pastes/${paste.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete paste');
      }
      
      toast.success('Paste deleted successfully');
      
      if (onDelete) {
        onDelete();
      }
      
      router.push('/');
    } catch (error) {
      console.error('Error deleting paste:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete paste');
    } finally {
      setIsDeleting(false);
    }
  };

  // Track if content should be shown (hidden for burn-after-reading pastes)
  const [showContent, setShowContent] = useState(!paste.burnAfterRead);
  
  // Initialize content visibility based on burn status
  useEffect(() => {
    if (paste.burnAfterRead && !hasBeenBurned) {
      setShowContent(false);
    }
  }, [paste.burnAfterRead, hasBeenBurned]);

  return (
    <div className="flex flex-col h-full">
      {/* Paste Info and Actions */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {paste.language.charAt(0).toUpperCase() + paste.language.slice(1)} Paste
            </span>
            <span className="text-xs text-muted-foreground">
              Created {formatDate(paste.createdAt)} • {paste.views} view{paste.views !== 1 ? 's' : ''}
              {paste.expiresAt && ` • Expires ${formatDate(paste.expiresAt)}`}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyContent}
          >
            Copy Content
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`/api/pastes/${paste.id}/raw`, '_blank')}
          >
            View Raw
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
      
      {/* Content Display */}
      <div className="flex-1 p-4 pb-8 overflow-auto">
        {paste.burnAfterRead && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Warning:</span>
              <span className="ml-1">
                This paste will be permanently deleted after you view it.
              </span>
            </div>
          </div>
        )}
        <div className="h-full min-h-[300px] border rounded-md overflow-auto flex flex-col">
          {showContent ? (
            <CodeEditor
              value={paste.content}
              onChange={() => {}}
              language={paste.language}
              readOnly={true}
              height="100%"
              showSyntaxHighlighting={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center p-8">
                <FlameIcon className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-medium mb-2">Content Hidden</h3>
                <p className="text-muted-foreground mb-4">
                  This paste will be permanently deleted after viewing.
                  This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleBurn}
                  disabled={isBurning}
                  className="mt-4"
                >
                  {isBurning ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Burning...
                    </>
                  ) : (
                    <>
                      <FlameIcon className="mr-2 h-4 w-4" />
                      View and Burn
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Language Info and New Paste Button */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center">
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {paste.language.charAt(0).toUpperCase() + paste.language.slice(1)}
          </div>
          <div className="ml-2 text-sm text-muted-foreground">
            Auto-detected language
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/')}
        >
          New Paste
        </Button>
      </div>
    </div>
  );
}
