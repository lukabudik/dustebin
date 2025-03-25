import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export function generateImageKey(extension: string = 'webp'): string {
  const uuid = uuidv4();
  return `images/${uuid}.${extension}`;
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      throw new Error('R2 configuration is missing');
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      })
    );

    return `${R2_PUBLIC_URL}/${key}`;
  } catch {
    throw new Error('Failed to upload file to storage');
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    if (!R2_BUCKET_NAME) {
      throw new Error('R2 configuration is missing');
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch {
    throw new Error('Failed to delete file from storage');
  }
}

export async function getSignedR2Url(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    if (!R2_BUCKET_NAME) {
      throw new Error('R2 configuration is missing');
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch {
    throw new Error('Failed to generate access URL');
  }
}
