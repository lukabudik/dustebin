'use client';

import { useState } from 'react';
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardCopyIcon,
  InfoIcon,
  MapPinIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExifViewerProps {
  exifData?: Record<string, unknown> | null;
  displayMode?: 'inline' | 'badge' | 'button';
}

interface CameraInfo {
  make: string | null;
  model: string | null;
  software: string | null;
  dimensions?: string;
  colorSpace?: string;
  [key: string]: unknown;
}

interface PhotoInfo {
  dateTaken: string | null;
  orientation: number | null;
  exposureTime: number | null;
  fNumber: number | null;
  iso: number | null;
  focalLength: number | null;
  dimensions?: string;
  colorSpace?: string;
  [key: string]: unknown;
}

interface LocationInfo {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  timestamp: unknown | null;
  datestamp: string | null;
  [key: string]: unknown;
}

export function ExifViewer({ exifData, displayMode = 'badge' }: ExifViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!exifData) {
    return null;
  }

  const camera = exifData.camera as CameraInfo | undefined;
  const photo = exifData.photo as PhotoInfo | undefined;
  const location = exifData.location as LocationInfo | undefined;

  const hasCamera = camera && Object.values(camera).some(v => v !== null);
  const hasPhoto = photo && Object.values(photo).some(v => v !== null);
  const hasLocation = location && location.latitude !== null && location.longitude !== null;

  if (!hasCamera && !hasPhoto && !hasLocation) {
    return null;
  }

  const formatDate = (dateStr: string): string => {
    const parts = dateStr.split(' ');
    if (parts.length !== 2) return dateStr;

    const datePart = parts[0].replace(/:/g, '-');
    return `${datePart} ${parts[1]}`;
  };

  const formatExposureTime = (exposure: number): string => {
    if (exposure >= 1) {
      return `${exposure}s`;
    } else {
      const denominator = Math.round(1 / exposure);
      return `1/${denominator}s`;
    }
  };

  const formatFNumber = (fNumber: number): string => {
    return `f/${fNumber}`;
  };

  const formatFocalLength = (focalLength: number): string => {
    return `${focalLength}mm`;
  };

  const copyExifData = () => {
    try {
      const exifText = JSON.stringify(exifData, null, 2);
      navigator.clipboard.writeText(exifText);
      toast.success('EXIF data copied to clipboard');
    } catch {
      toast.error('Failed to copy EXIF data');
    }
  };

  const getKeyInfo = (): string => {
    const parts = [];

    if (camera?.dimensions) {
      parts.push(camera.dimensions);
    }

    if (camera?.make) {
      parts.push(camera.make);
    } else if (camera?.colorSpace) {
      parts.push(camera.colorSpace);
    }

    if (photo?.dateTaken) {
      const date = formatDate(photo.dateTaken).split(' ')[0];
      parts.push(date);
    }

    return parts.length > 0 ? parts.join(' • ') : 'EXIF Data';
  };

  const renderExifContent = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {hasCamera && camera && (
        <div className="space-y-2">
          <div className="flex items-center">
            <CameraIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">Camera</span>
          </div>
          <div className="text-muted-foreground space-y-1 text-sm">
            {camera.make && (
              <div>
                <span className="font-medium">Make:</span> {camera.make}
              </div>
            )}
            {camera.model && (
              <div>
                <span className="font-medium">Model:</span> {camera.model}
              </div>
            )}
            {camera.software && (
              <div>
                <span className="font-medium">Software:</span> {camera.software}
              </div>
            )}
            {camera.dimensions && (
              <div>
                <span className="font-medium">Dimensions:</span> {camera.dimensions}
              </div>
            )}
            {camera.colorSpace && (
              <div>
                <span className="font-medium">Color Space:</span> {camera.colorSpace}
              </div>
            )}
          </div>
        </div>
      )}

      {hasPhoto && photo && (
        <div className="space-y-2">
          <div className="flex items-center">
            <InfoIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">Photo Details</span>
          </div>
          <div className="text-muted-foreground space-y-1 text-sm">
            {photo.dateTaken && (
              <div>
                <span className="font-medium">Date Taken:</span> {formatDate(photo.dateTaken)}
              </div>
            )}
            {photo.exposureTime && (
              <div>
                <span className="font-medium">Exposure:</span>{' '}
                {formatExposureTime(photo.exposureTime)}
              </div>
            )}
            {photo.fNumber && (
              <div>
                <span className="font-medium">Aperture:</span> {formatFNumber(photo.fNumber)}
              </div>
            )}
            {photo.iso && (
              <div>
                <span className="font-medium">ISO:</span> {photo.iso}
              </div>
            )}
            {photo.focalLength && (
              <div>
                <span className="font-medium">Focal Length:</span>{' '}
                {formatFocalLength(photo.focalLength)}
              </div>
            )}
            {photo.dimensions && !camera?.dimensions && (
              <div>
                <span className="font-medium">Dimensions:</span> {photo.dimensions}
              </div>
            )}
            {photo.colorSpace && !camera?.colorSpace && (
              <div>
                <span className="font-medium">Color Space:</span> {photo.colorSpace}
              </div>
            )}
          </div>
        </div>
      )}

      {hasLocation && location && (
        <div className="space-y-2">
          <div className="flex items-center">
            <MapPinIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">Location</span>
          </div>
          <div className="text-muted-foreground space-y-1 text-sm">
            {location.latitude !== null && location.longitude !== null && (
              <div>
                <span className="font-medium">Coordinates:</span> {location.latitude},{' '}
                {location.longitude}
              </div>
            )}
            {location.altitude !== null && (
              <div>
                <span className="font-medium">Altitude:</span> {location.altitude}m
              </div>
            )}
            {location.datestamp && (
              <div>
                <span className="font-medium">Date:</span> {location.datestamp}
              </div>
            )}
            {location.latitude !== null && location.longitude !== null && (
              <div className="mt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (displayMode === 'badge') {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="bg-primary/10 text-primary mt-4 inline-flex cursor-pointer items-center rounded-full px-3 py-1.5 text-xs font-medium">
            <InfoIcon className="mr-1.5 h-3.5 w-3.5" />
            {getKeyInfo()}
          </div>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto p-4 sm:max-h-[80vh] sm:max-w-2xl md:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <InfoIcon className="mr-2 h-5 w-5" />
              EXIF Information
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">{renderExifContent()}</div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={copyExifData}
              className="w-full sm:mr-2 sm:w-auto"
            >
              <ClipboardCopyIcon className="mr-1.5 h-4 w-4" />
              Copy EXIF Data
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (displayMode === 'button') {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
            <InfoIcon className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">View EXIF Data</span>
            <span className="sm:hidden">EXIF</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto p-4 sm:max-h-[80vh] sm:max-w-2xl md:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <InfoIcon className="mr-2 h-5 w-5" />
              EXIF Information
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">{renderExifContent()}</div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={copyExifData}
              className="w-full sm:mr-2 sm:w-auto"
            >
              <ClipboardCopyIcon className="mr-1.5 h-4 w-4" />
              Copy EXIF Data
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="mt-4 rounded-md border">
      <div
        className="flex w-full cursor-pointer items-center justify-between p-3 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="exif-content"
      >
        <div className="flex items-center">
          <InfoIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">EXIF Information</span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 h-8 w-8 p-0"
            onClick={e => {
              e.stopPropagation();
              copyExifData();
            }}
          >
            <ClipboardCopyIcon className="h-4 w-4" />
            <span className="sr-only">Copy EXIF data</span>
          </Button>
          <div className="flex h-8 w-8 items-center justify-center p-0">
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div id="exif-content" className="overflow-x-auto border-t p-3">
          <div className="min-w-[300px]">{renderExifContent()}</div>
        </div>
      )}
    </div>
  );
}
