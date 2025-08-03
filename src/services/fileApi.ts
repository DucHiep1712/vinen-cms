import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuration class equivalent to AWSS3StorageConfig
class AWSS3StorageConfig {
  static ACCESS_KEY_ID = import.meta.env.VITE_AWS_S3_KEY_ID;
  static ACCESS_KEY_SECRET = import.meta.env.VITE_AWS_S3_KEY_SECRET;
  static REGION = import.meta.env.VITE_AWS_S3_REGION;
  static BUCKET = import.meta.env.VITE_AWS_S3_BUCKET;
  static ENDPOINT = `https://${this.REGION}.digitaloceanspaces.com`;
  
  static FILE_URL(filepath: string): string {
    return encodeURI(
      `https://${this.BUCKET}.${this.REGION}.digitaloceanspaces.com/${filepath}`
    );
  }
}

// S3 Client initialization
const s3Client = new S3Client({
  endpoint: AWSS3StorageConfig.ENDPOINT,
  region: AWSS3StorageConfig.REGION,
  credentials: {
    accessKeyId: AWSS3StorageConfig.ACCESS_KEY_ID!,
    secretAccessKey: AWSS3StorageConfig.ACCESS_KEY_SECRET!,
  },
  forcePathStyle: false, // Use virtual addressing style
  // Add request configuration to handle CORS
  requestHandler: {
    httpOptions: {
      timeout: 30000, // 30 seconds timeout
    },
  },
});

const specialTreatmentHost = ["batdongsan.com.vn"];
const rootFolder = "new";

// Utility functions
function createDateFolderName(): string {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  return vietnamTime.toISOString().slice(0, 10).replace(/-/g, '');
}

function getMimeType(filename: string): { type: string; folder: string } {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
  };

  const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
  const folder = contentType.split('/')[0];
  
  return { type: contentType, folder };
}

// Simple HTTP request function
async function bareRequest(url: string, timeout: number = 10000): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    clearTimeout(timeoutId);
    return arrayBuffer;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Special image download for specific hosts
async function specialImageDownload(url: string): Promise<ArrayBuffer | null> {
  if (specialTreatmentHost.some(host => url.includes(host))) {
    try {
      // For special hosts, you might need a different approach
      // This is a placeholder - you may need to implement specific logic
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        return await response.arrayBuffer();
      }
    } catch (error) {
      console.error('Special image download failed:', error);
    }
  }
  return null;
}

// Image validation function
async function validateImage(content: ArrayBuffer, minWidth: number = 500, minHeight: number = 500): Promise<boolean> {
  try {
    const blob = new Blob([content]);
    const imageUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(img.width >= minWidth && img.height >= minHeight);
      };
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(false);
      };
      img.src = imageUrl;
    });
  } catch (error) {
    return false;
  }
}

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// CORS-friendly upload function
async function uploadWithCORSHandling(filename: string, content: ArrayBuffer, stable: boolean = false): Promise<string | null> {
  try {
    // Try direct S3 upload first
    return await saveToCloudDirect(filename, content, stable);
  } catch (error) {
    console.warn('Direct S3 upload failed, trying alternative method:', error);
    
    // Fallback: Use a proxy or different approach
    return await saveToCloudFallback(filename, content, stable);
  }
}

// Direct S3 upload (original method)
async function saveToCloudDirect(filename: string, content: ArrayBuffer, stable: boolean = false): Promise<string | null> {
  if (!content || content.byteLength === 0 || !filename) {
    console.error('Invalid content or filename');
    return null;
  }

  // Validate AWS configuration
  if (!AWSS3StorageConfig.ACCESS_KEY_ID || !AWSS3StorageConfig.ACCESS_KEY_SECRET || 
      !AWSS3StorageConfig.REGION || !AWSS3StorageConfig.BUCKET) {
    console.error('AWS S3 configuration is incomplete');
    throw new Error('AWS S3 configuration is incomplete. Please check your environment variables.');
  }

  const subFolder = stable ? "stable" : createDateFolderName();
  const { type: contentType, folder } = getMimeType(filename);
  const objectKey = `${rootFolder}/${folder}/${subFolder}/${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: AWSS3StorageConfig.BUCKET,
      Key: objectKey,
      Body: new Uint8Array(content),
      ACL: 'public-read',
      ContentType: contentType,
    });

    const response = await s3Client.send(command);
    
    if (response.$metadata.httpStatusCode === 200) {
      return AWSS3StorageConfig.FILE_URL(objectKey);
    }
    
    console.error('Upload failed with status:', response.$metadata.httpStatusCode);
    return null;
  } catch (error) {
    console.error('Save to cloud failed:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        throw new Error('AWS credentials are invalid. Please check your access key and secret.');
      } else if (error.message.includes('bucket')) {
        throw new Error('AWS bucket not found or access denied. Please check your bucket name and permissions.');
      } else if (error.message.includes('region')) {
        throw new Error('AWS region is invalid. Please check your region configuration.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      }
    }
    
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fallback upload method using FormData (if available)
async function saveToCloudFallback(filename: string, content: ArrayBuffer, stable: boolean = false): Promise<string | null> {
  try {
    // Create a blob from the content
    const blob = new Blob([content], { type: getMimeType(filename).type });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('stable', stable.toString());
    
    // You would need to implement a server-side endpoint for this
    // For now, we'll throw an error to indicate the fallback isn't implemented
    throw new Error('Fallback upload method not implemented. Please check your S3 configuration.');
  } catch (error) {
    console.error('Fallback upload failed:', error);
    return null;
  }
}

// Import proxy functions
import { uploadFileWithCloudinary, uploadBlobWithCloudinary } from './cloudinaryFileApi';

// Main API functions - use proxy by default to avoid CORS issues
export async function saveToCloud(filename: string, content: ArrayBuffer, stable: boolean = false): Promise<string | null> {
  try {
    // Convert ArrayBuffer to Blob
    const blob = new Blob([content], { type: getMimeType(filename).type });
    return await uploadBlobWithCloudinary(blob, filename, stable);
  } catch (error) {
    console.error('Proxy upload failed, falling back to direct upload:', error);
    // Fallback to direct upload if proxy fails
    return uploadWithCORSHandling(filename, content, stable);
  }
}

export async function downloadToCloud(url: string, stable: boolean = false): Promise<string | null> {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];

    if (!filename || filename.length === 0) {
      return null;
    }

    const subFolder = stable ? "stable" : createDateFolderName();
    const { type: contentType, folder } = getMimeType(filename);

    let content: ArrayBuffer;
    
    try {
      content = await bareRequest(url, 6000);
    } catch (error) {
      content = await specialImageDownload(url) || new ArrayBuffer(0);
    }

    if (!content || content.byteLength === 0) {
      return null;
    }

    // Validate image if it's an image file
    if (folder === "image") {
      const isValid = await validateImage(content);
      if (!isValid) {
        return null;
      }
    }

    let cdnUrl: string | null = null;
    let attempts = 1;

    while (attempts <= 10) {
      try {
        const objectKey = `${rootFolder}/${folder}/${subFolder}/${generateUUID()}.jpg`;
        cdnUrl = AWSS3StorageConfig.FILE_URL(objectKey);

                        const command = new PutObjectCommand({
                  Bucket: AWSS3StorageConfig.BUCKET,
                  Key: objectKey,
                  Body: new Uint8Array(content),
                  ACL: 'public-read',
                  ContentType: contentType,
                });

        const response = await s3Client.send(command);
        
        if (response.$metadata.httpStatusCode !== 200) {
          throw new Error("Upload failed");
        }

        // Test the uploaded file
        const testContent = await bareRequest(cdnUrl, 30000);
        if (!testContent) {
          throw new Error("Upload verification failed");
        }

        break;
      } catch (error) {
        cdnUrl = null;
        attempts++;
        if (attempts > 10) {
          console.error('Download to cloud failed after 10 attempts:', error);
          return null;
        }
      }
    }

    return cdnUrl;
  } catch (error) {
    console.error('Download to cloud failed:', error);
    return null;
  }
}

export async function concurrentDownloadToCloud(urls: string[]): Promise<(string | null)[]> {
  if (urls.length === 0) {
    return [];
  }

  const maxConcurrent = Math.min(5, urls.length);
  const results: (string | null)[] = [];

  // Process URLs in batches
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(url => downloadToCloud(url));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

// Helper function to upload file from input
export async function uploadFileFromInput(file: File, stable: boolean = false): Promise<string | null> {
  try {
    // Use proxy upload for files
    return await uploadFileWithCloudinary(file, stable);
  } catch (error) {
    console.error('Upload file failed:', error);
    return null;
  }
}

// --- Session cache for uploaded blobs ---
const blobUploadCache = new Map<string, string>(); // hash -> CDN URL

// Helper to hash a blob (using base64 for simplicity)
async function hashBlob(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  // Use base64 as a quick hash (not cryptographically secure, but fine for session deduplication)
  return arrayBufferToBase64(arrayBuffer);
}

// Generalized upload for Blob/File with deduplication
export async function uploadBlobToCloud(blob: Blob, filename: string, stable: boolean = false): Promise<string | null> {
  const hash = await hashBlob(blob);
  if (blobUploadCache.has(hash)) {
    return blobUploadCache.get(hash)!;
  }
  // Use proxy upload for blobs
      const url = await uploadBlobWithCloudinary(blob, filename, stable);
  if (url) {
    blobUploadCache.set(hash, url);
  }
  return url;
}

// Helper function to convert base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper function to convert ArrayBuffer to base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
} 