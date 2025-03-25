import exifReader from 'exif-reader';
import sharp from 'sharp';

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

interface ProcessedExifData {
  camera?: CameraInfo;
  photo?: PhotoInfo;
  location?: LocationInfo;
  [key: string]: unknown;
}

export async function extractExifData(buffer: Buffer): Promise<ProcessedExifData | null> {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.exif) {
      return null;
    }

    let exifData;
    try {
      exifData = exifReader(metadata.exif);
    } catch {
      return null;
    }

    if (!exifData) {
      return null;
    }

    const processedData = processExifData(exifData);
    return processedData;
  } catch {
    return null;
  }
}

function processExifData(exifData: unknown): ProcessedExifData {
  if (typeof exifData !== 'object' || exifData === null) {
    return {};
  }

  const processed: ProcessedExifData = {};

  const data = exifData as Record<string, unknown>;

  const getNestedValue = <T>(obj: Record<string, unknown>, path: string[]): T | null => {
    try {
      let current: unknown = obj;
      for (const key of path) {
        if (current === null || current === undefined || typeof current !== 'object') {
          return null;
        }
        current = (current as Record<string, unknown>)[key];
      }
      return current === undefined ? null : (current as T);
    } catch {
      return null;
    }
  };

  const make =
    getNestedValue<string>(data, ['image', 'Make']) ||
    getNestedValue<string>(data, ['Image', 'Make']) ||
    getNestedValue<string>(data, ['Make']) ||
    getNestedValue<string>(data, ['IFD0', 'Make']);

  const model =
    getNestedValue<string>(data, ['image', 'Model']) ||
    getNestedValue<string>(data, ['Image', 'Model']) ||
    getNestedValue<string>(data, ['Model']) ||
    getNestedValue<string>(data, ['IFD0', 'Model']);

  const software =
    getNestedValue<string>(data, ['image', 'Software']) ||
    getNestedValue<string>(data, ['Image', 'Software']) ||
    getNestedValue<string>(data, ['Software']) ||
    getNestedValue<string>(data, ['IFD0', 'Software']);

  const pixelWidth = getNestedValue<number>(data, ['Photo', 'PixelXDimension']);
  const pixelHeight = getNestedValue<number>(data, ['Photo', 'PixelYDimension']);
  const colorSpace = getNestedValue<number>(data, ['Photo', 'ColorSpace']);

  if (make || model || software || pixelWidth || pixelHeight) {
    processed.camera = {
      make: make || null,
      model: model || null,
      software: software || null,
    };

    if (pixelWidth && pixelHeight) {
      processed.camera.dimensions = `${pixelWidth} × ${pixelHeight}`;
    }

    if (colorSpace !== null && colorSpace !== undefined) {
      processed.camera.colorSpace = colorSpace === 1 ? 'sRGB' : `ColorSpace: ${colorSpace}`;
    }
  }

  const dateTaken =
    getNestedValue<string>(data, ['exif', 'DateTimeOriginal']) ||
    getNestedValue<string>(data, ['exif', 'DateTime']) ||
    getNestedValue<string>(data, ['Exif', 'DateTimeOriginal']) ||
    getNestedValue<string>(data, ['Exif', 'DateTime']) ||
    getNestedValue<string>(data, ['Photo', 'DateTimeOriginal']) ||
    getNestedValue<string>(data, ['Photo', 'DateTime']) ||
    getNestedValue<string>(data, ['DateTimeOriginal']) ||
    getNestedValue<string>(data, ['DateTime']);

  const orientation =
    getNestedValue<number>(data, ['exif', 'Orientation']) ||
    getNestedValue<number>(data, ['Exif', 'Orientation']) ||
    getNestedValue<number>(data, ['Photo', 'Orientation']) ||
    getNestedValue<number>(data, ['IFD0', 'Orientation']) ||
    getNestedValue<number>(data, ['Orientation']);

  const exposureTime =
    getNestedValue<number>(data, ['exif', 'ExposureTime']) ||
    getNestedValue<number>(data, ['Exif', 'ExposureTime']) ||
    getNestedValue<number>(data, ['Photo', 'ExposureTime']) ||
    getNestedValue<number>(data, ['ExposureTime']);

  const fNumber =
    getNestedValue<number>(data, ['exif', 'FNumber']) ||
    getNestedValue<number>(data, ['Exif', 'FNumber']) ||
    getNestedValue<number>(data, ['Photo', 'FNumber']) ||
    getNestedValue<number>(data, ['FNumber']);

  const iso =
    getNestedValue<number>(data, ['exif', 'ISO']) ||
    getNestedValue<number>(data, ['Exif', 'ISO']) ||
    getNestedValue<number>(data, ['Photo', 'ISO']) ||
    getNestedValue<number>(data, ['ISO']) ||
    getNestedValue<number>(data, ['exif', 'ISOSpeedRatings']) ||
    getNestedValue<number>(data, ['Exif', 'ISOSpeedRatings']) ||
    getNestedValue<number>(data, ['Photo', 'ISOSpeedRatings']) ||
    getNestedValue<number>(data, ['ISOSpeedRatings']);

  const focalLength =
    getNestedValue<number>(data, ['exif', 'FocalLength']) ||
    getNestedValue<number>(data, ['Exif', 'FocalLength']) ||
    getNestedValue<number>(data, ['Photo', 'FocalLength']) ||
    getNestedValue<number>(data, ['FocalLength']);

  if (
    dateTaken ||
    orientation ||
    exposureTime ||
    fNumber ||
    iso ||
    focalLength ||
    (pixelWidth && pixelHeight && !processed.camera) ||
    (colorSpace !== null && colorSpace !== undefined && !processed.camera)
  ) {
    processed.photo = {
      dateTaken: dateTaken || null,
      orientation: orientation || null,
      exposureTime: exposureTime || null,
      fNumber: fNumber || null,
      iso: iso || null,
      focalLength: focalLength || null,
    };

    if (!processed.camera?.dimensions && pixelWidth && pixelHeight) {
      processed.photo.dimensions = `${pixelWidth} × ${pixelHeight}`;
    }

    if (!processed.camera?.colorSpace && colorSpace !== null && colorSpace !== undefined) {
      processed.photo.colorSpace = colorSpace === 1 ? 'sRGB' : `ColorSpace: ${colorSpace}`;
    }
  }

  const gpsData =
    getNestedValue<Record<string, unknown>>(data, ['gps']) ||
    getNestedValue<Record<string, unknown>>(data, ['GPS']) ||
    getNestedValue<Record<string, unknown>>(data, ['GPSInfo']);

  if (gpsData) {
    let latitude: number | null = null;
    let longitude: number | null = null;

    const gpsLatitude = getNestedValue<number[]>(gpsData, ['GPSLatitude']);
    const gpsLatitudeRef = getNestedValue<string>(gpsData, ['GPSLatitudeRef']);
    const gpsLongitude = getNestedValue<number[]>(gpsData, ['GPSLongitude']);
    const gpsLongitudeRef = getNestedValue<string>(gpsData, ['GPSLongitudeRef']);

    if (gpsLatitude && gpsLatitudeRef && Array.isArray(gpsLatitude) && gpsLatitude.length === 3) {
      const [degrees, minutes, seconds] = gpsLatitude;
      latitude = degrees + minutes / 60 + seconds / 3600;
      if (gpsLatitudeRef === 'S') {
        latitude = -latitude;
      }
    }

    if (
      gpsLongitude &&
      gpsLongitudeRef &&
      Array.isArray(gpsLongitude) &&
      gpsLongitude.length === 3
    ) {
      const [degrees, minutes, seconds] = gpsLongitude;
      longitude = degrees + minutes / 60 + seconds / 3600;
      if (gpsLongitudeRef === 'W') {
        longitude = -longitude;
      }
    }

    if (latitude !== null && longitude !== null) {
      latitude = Math.round(latitude * 100) / 100;
      longitude = Math.round(longitude * 100) / 100;
    }

    if (latitude !== null || longitude !== null) {
      processed.location = {
        latitude,
        longitude,
        altitude: getNestedValue<number>(gpsData, ['GPSAltitude']) || null,
        timestamp: getNestedValue<unknown>(gpsData, ['GPSTimeStamp']) || null,
        datestamp: getNestedValue<string>(gpsData, ['GPSDateStamp']) || null,
      };
    }
  }

  return processed;
}
