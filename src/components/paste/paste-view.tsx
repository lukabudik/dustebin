'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CodeEditor } from '@/components/editor/code-editor';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/helpers';
import { ExifViewer } from '@/components/paste/exif-viewer';
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  DownloadIcon,
  FlameIcon,
  ImageIcon,
} from 'lucide-react';

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
    hasImage?: boolean;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    originalFormat?: string;
    originalMimeType?: string;
    pasteType?: string;
    exifData?: Record<string, unknown> | null;
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

  useEffect(() => {
    if (isLoadingMetadata) {
      const checkMetadataStatus = async () => {
        try {
          const response = await fetch(`/api/pastes/${paste.id}`);
          if (response.ok) {
            const data = await response.json();

            if (data.aiGenerationStatus === 'COMPLETED') {
              setPaste(prev => ({
                ...prev,
                title: data.title,
                description: data.description,
                aiGenerationStatus: 'COMPLETED',
              }));
              setIsLoadingMetadata(false);
              return true;
            } else if (data.aiGenerationStatus === 'FAILED') {
              setIsLoadingMetadata(false);
              return true;
            }
          }
          return false;
        } catch {
          return false;
        }
      };

      checkMetadataStatus().then(isComplete => {
        if (!isComplete) {
          const eventSource = new EventSource(`/api/pastes/${paste.id}/metadata`);

          eventSource.onmessage = event => {
            try {
              const data = JSON.parse(event.data);

              if (data.status === 'completed') {
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
                setIsLoadingMetadata(false);
                eventSource.close();
              }
            } catch {}
          };

          eventSource.onerror = () => {
            const fallbackTimeout = setTimeout(() => {
              checkMetadataStatus().then(isComplete => {
                if (isComplete) {
                  eventSource.close();
                }
              });
            }, 5000);

            return () => {
              clearTimeout(fallbackTimeout);
            };
          };

          const fallbackTimeout = setTimeout(() => {
            checkMetadataStatus().then(isComplete => {
              if (isComplete) {
                eventSource.close();
              } else {
                setIsLoadingMetadata(false);
                eventSource.close();
              }
            });
          }, 10000);

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
      setShowContent(true);
      toast.success('Paste has been burned - this is your only chance to view it');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to burn paste');
    } finally {
      setIsBurning(false);
    }
  };

  const [showContent, setShowContent] = useState(!paste.burnAfterRead);
  const [formatOptions, setFormatOptions] = useState<
    Array<{
      id: string;
      name: string;
      size: string;
      extension: string;
    }>
  >([
    {
      id: 'original',
      name: 'Original Format',
      size: 'Calculating...',
      extension: paste.originalFormat || 'jpeg',
    },
    {
      id: 'jpg',
      name: 'JPEG',
      size: 'Calculating...',
      extension: 'jpg',
    },
    {
      id: 'png',
      name: 'PNG',
      size: 'Calculating...',
      extension: 'png',
    },
    {
      id: 'webp',
      name: 'WebP',
      size: 'Calculating...',
      extension: 'webp',
    },
  ]);
  const [isLoadingFormats, setIsLoadingFormats] = useState(true);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paste.burnAfterRead && !hasBeenBurned) {
      setShowContent(false);
    }
  }, [paste.burnAfterRead, hasBeenBurned]);

  useEffect(() => {
    if (paste.hasImage) {
      const fetchFormats = async () => {
        setIsLoadingFormats(true);
        try {
          const response = await fetch(`/api/pastes/${paste.id}/formats`);
          if (response.ok) {
            const data = await response.json();
            setFormatOptions(data.formats);
          }
        } catch {
        } finally {
          setIsLoadingFormats(false);
        }
      };

      fetchFormats();
    }
  }, [paste.id, paste.hasImage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasExifData = paste.exifData && Object.keys(paste.exifData).length > 0;

  return (
    <div className="flex h-full flex-col">
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
              {paste.imageWidth &&
                paste.imageHeight &&
                ` • ${paste.imageWidth} × ${paste.imageHeight}`}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {paste.pasteType === 'image' || paste.hasImage ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (paste.imageUrl) {
                    window.open(paste.imageUrl, '_blank');
                  }
                }}
              >
                <ImageIcon className="mr-1 h-4 w-4" />
                View Original
              </Button>

              {hasExifData && <ExifViewer exifData={paste.exifData} displayMode="button" />}

              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                >
                  {isLoadingFormats ? (
                    <>
                      <svg
                        className="mr-1 h-4 w-4 animate-spin"
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
                      Calculating...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="mr-1 h-4 w-4" />
                      Download
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>

                {showFormatDropdown && formatOptions.length > 0 && (
                  <div className="ring-opacity-5 absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
                    <div className="py-1">
                      {formatOptions.map(format => (
                        <button
                          key={format.id}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100"
                          onClick={() => {
                            window.open(
                              `/api/pastes/${paste.id}/download?format=${format.id}`,
                              '_blank'
                            );
                            setShowFormatDropdown(false);
                          }}
                        >
                          <span>{format.name}</span>
                          <span className="text-muted-foreground text-xs">{format.size}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

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

        {paste.pasteType === 'image' || paste.hasImage ? (
          <div className="flex flex-col items-center">
            <div className="overflow-hidden rounded-md border">
              <img
                src={paste.imageUrl}
                alt=""
                className="max-h-[600px] w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <div className="flex items-center justify-between border-t p-4">
        <div className="flex items-center">
          {paste.pasteType === 'image' || paste.hasImage ? (
            <>
              <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                Image
              </div>
              <div className="text-muted-foreground ml-2 text-sm">
                {paste.originalFormat ? paste.originalFormat.toUpperCase() : 'WebP'} format
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                {paste.language.charAt(0).toUpperCase() + paste.language.slice(1)}
              </div>
              <div className="text-muted-foreground ml-2 text-sm">Auto-detected language</div>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          New Paste
        </Button>
      </div>
    </div>
  );
}
