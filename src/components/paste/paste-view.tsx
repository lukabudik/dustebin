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
    title?: string;
    description?: string;
    createdAt: string | Date;
    expiresAt?: string | Date | null;
    views: number;
    burnAfterRead?: boolean;
    aiGenerationStatus?: string;
  };
}

export function PasteView({ paste: initialPaste }: PasteViewProps) {
  const router = useRouter();
  const [paste, setPaste] = useState(initialPaste);
  const [isBurning, setIsBurning] = useState(false);
  const [hasBeenBurned, setHasBeenBurned] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(
    initialPaste.description === 'Generating description...' &&
      initialPaste.aiGenerationStatus === 'PENDING'
  );

  // Initial check for metadata status
  useEffect(() => {
    // Only check if we're still loading metadata
    if (isLoadingMetadata) {
      // First, check the current status immediately
      const checkMetadataStatus = async () => {
        try {
          const response = await fetch(`/api/pastes/${paste.id}`);
          if (response.ok) {
            const data = await response.json();

            // If metadata is already generated, update the UI
            if (data.aiGenerationStatus === 'COMPLETED') {
              setPaste(prev => ({
                ...prev,
                title: data.title,
                description: data.description,
                aiGenerationStatus: 'COMPLETED',
              }));
              setIsLoadingMetadata(false);
              return true; // Metadata is already available
            } else if (data.aiGenerationStatus === 'FAILED') {
              setIsLoadingMetadata(false);
              return true; // No need for SSE, generation failed
            }
          }
          return false; // Need to set up SSE for updates
        } catch (error) {
          console.error('Error checking metadata status:', error);
          return false;
        }
      };

      // Check status and set up SSE if needed
      checkMetadataStatus().then(isComplete => {
        if (!isComplete) {
          // Set up SSE for real-time updates
          const eventSource = new EventSource(`/api/pastes/${paste.id}/metadata`);

          eventSource.onmessage = event => {
            try {
              const data = JSON.parse(event.data);
              console.warn('SSE message received:', data);

              if (data.status === 'completed') {
                // Update the UI with the generated metadata
                setPaste(prev => ({
                  ...prev,
                  title: data.title,
                  description: data.description,
                  aiGenerationStatus: 'COMPLETED',
                }));
                setIsLoadingMetadata(false);
                eventSource.close();
              } else if (
                data.status === 'failed' ||
                data.status === 'error' ||
                data.status === 'timeout'
              ) {
                // Handle failure gracefully
                console.warn('Metadata generation failed or timed out');
                setIsLoadingMetadata(false);
                eventSource.close();
              }
            } catch (error) {
              console.error('Error processing SSE message:', error);
            }
          };

          eventSource.onerror = error => {
            console.error('SSE connection error:', error);

            // Set up a fallback timeout to check again after a delay
            const fallbackTimeout = setTimeout(() => {
              checkMetadataStatus().then(isComplete => {
                if (isComplete) {
                  eventSource.close();
                }
              });
            }, 5000); // Check again after 5 seconds

            return () => {
              clearTimeout(fallbackTimeout);
            };
          };

          // Set up a fallback timeout to check again after a delay
          const fallbackTimeout = setTimeout(() => {
            checkMetadataStatus().then(isComplete => {
              if (isComplete) {
                eventSource.close();
              } else {
                // If still not complete after timeout, just stop loading
                setIsLoadingMetadata(false);
                eventSource.close();
              }
            });
          }, 10000); // 10 second timeout

          return () => {
            clearTimeout(fallbackTimeout);
            eventSource.close();
          };
        }
      });
    }
  }, [paste.id, isLoadingMetadata]);

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

  // Track if content should be shown (hidden for burn-after-reading pastes)
  const [showContent, setShowContent] = useState(!paste.burnAfterRead);

  // Initialize content visibility based on burn status
  useEffect(() => {
    if (paste.burnAfterRead && !hasBeenBurned) {
      setShowContent(false);
    }
  }, [paste.burnAfterRead, hasBeenBurned]);

  return (
    <div className="flex h-full flex-col">
      {/* Paste Info and Actions */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {paste.title ||
                `${paste.language.charAt(0).toUpperCase() + paste.language.slice(1)} Paste`}
            </span>
            {isLoadingMetadata ? (
              <div className="text-muted-foreground mb-1 flex items-center text-xs">
                <svg
                  className="mr-2 h-3 w-3 animate-spin"
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
                Generating AI description...
              </div>
            ) : (
              paste.description && (
                <span className="text-muted-foreground mb-1 text-xs">{paste.description}</span>
              )
            )}
            <span className="text-muted-foreground text-xs">
              Created {formatDate(paste.createdAt)} • {paste.views} view
              {paste.views !== 1 ? 's' : ''}
              {paste.expiresAt && ` • Expires ${formatDate(paste.expiresAt)}`}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyContent}>
            Copy Content
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/api/pastes/${paste.id}/raw`, '_blank')}
          >
            View Raw
          </Button>
          {/* Delete button removed for security reasons */}
        </div>
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-auto p-4 pb-8">
        {paste.burnAfterRead && (
          <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3">
            <div className="flex items-center">
              <AlertTriangleIcon className="mr-2 h-5 w-5" />
              <span className="font-medium">Warning:</span>
              <span className="ml-1">
                This paste will be permanently deleted after you view it.
              </span>
            </div>
          </div>
        )}
        <div className="flex h-full min-h-[300px] flex-col overflow-auto rounded-md border">
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
            <div className="flex h-full flex-col items-center justify-center">
              <div className="p-8 text-center">
                <FlameIcon className="text-destructive mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">Content Hidden</h3>
                <p className="text-muted-foreground mb-4">
                  This paste will be permanently deleted after viewing. This action cannot be
                  undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleBurn}
                  disabled={isBurning}
                  className="mt-4"
                >
                  {isBurning ? (
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
      <div className="flex items-center justify-between border-t p-4">
        <div className="flex items-center">
          <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
            {paste.language.charAt(0).toUpperCase() + paste.language.slice(1)}
          </div>
          <div className="text-muted-foreground ml-2 text-sm">Auto-detected language</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          New Paste
        </Button>
      </div>
    </div>
  );
}
