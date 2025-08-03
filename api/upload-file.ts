import { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import { randomUUID } from 'node:crypto';

// Simple multipart parser for file uploads
async function parseMultipartFormData(req: VercelRequest): Promise<{ file: Buffer; filename: string; mimeType: string; stable: boolean }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let boundary = '';
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';
        boundary = contentType.split('boundary=')[1];
        
        if (!boundary) {
          reject(new Error('No boundary found in content-type'));
          return;
        }

        // Parse multipart data
        const parts = body.toString('binary').split(`--${boundary}`);
        
        for (const part of parts) {
          if (part.includes('Content-Disposition: form-data')) {
            const lines = part.split('\r\n');
            let filename = '';
            let mimeType = 'application/octet-stream';
            let stable = false;
            let fileData = '';

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              
              if (line.includes('name="file"')) {
                // Extract filename
                const filenameMatch = line.match(/filename="([^"]+)"/);
                if (filenameMatch) {
                  filename = filenameMatch[1];
                }
                
                // Get content type
                if (i + 1 < lines.length && lines[i + 1].includes('Content-Type:')) {
                  mimeType = lines[i + 1].split(': ')[1];
                }
                
                // Get file data (everything after the headers)
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                fileData = part.substring(dataStart);
                break;
              } else if (line.includes('name="stable"')) {
                // Extract stable value
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const stableValue = part.substring(dataStart).replace(/\r\n/g, '');
                stable = stableValue === 'true';
              }
            }

            if (filename && fileData) {
              const fileBuffer = Buffer.from(fileData, 'binary');
              resolve({ file: fileBuffer, filename, mimeType, stable });
              return;
            }
          }
        }
        
        reject(new Error('No file found in form data'));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API function called:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Starting file upload process');
    
    // Check if request has content-type multipart/form-data
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      console.log('Invalid content type:', contentType);
      return res.status(400).json({ success: false, error: 'Content-Type must be multipart/form-data' });
    }

    // Parse the multipart form data
    console.log('Parsing multipart form data...');
    const { file, filename, mimeType, stable } = await parseMultipartFormData(req);
    
    console.log('File info:', {
      filename,
      size: file.length,
      mimeType,
      stable
    });

    // Validate file size (10MB limit)
    if (file.length > 10 * 1024 * 1024) {
      console.log('File too large:', file.length);
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
    }

    // Get environment variables
    const accessKeyId = process.env.DO_SPACES_KEY;
    const secretAccessKey = process.env.DO_SPACES_SECRET;
    const region = process.env.DO_SPACES_REGION;
    const bucket = process.env.DO_SPACES_BUCKET;

    console.log('Environment variables check:', {
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      hasRegion: !!region,
      hasBucket: !!bucket,
      region: region,
      bucket: bucket
    });

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      console.error('Missing environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'DigitalOcean Spaces configuration is incomplete',
        missing: {
          accessKey: !accessKeyId,
          secretKey: !secretAccessKey,
          region: !region,
          bucket: !bucket
        }
      });
    }

    console.log('Initializing S3 client...');
    // Initialize S3 client for DigitalOcean Spaces
    const s3Client = new S3Client({
      endpoint: `https://${region}.digitaloceanspaces.com`,
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // Generate filename with timestamp and UUID
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uuid = randomUUID();
    const fileExtension = filename.split('.').pop() || 'jpg';
    const newFilename = `${timestamp}-${uuid}.${fileExtension}`;

    // Determine folder structure
    const rootFolder = "new";
    const subFolder = stable ? "stable" : timestamp;
    const folder = mimeType.split('/')[0]; // 'image', 'video', etc.
    const objectKey = `${rootFolder}/${folder}/${subFolder}/${newFilename}`;

    console.log('File details:', {
      newFilename,
      objectKey,
      mimeType,
      folder,
      rootFolder,
      subFolder
    });

    console.log('Uploading to DigitalOcean Spaces...');
    // Upload to DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: file,
      ACL: 'public-read',
      ContentType: mimeType,
    });

    const response = await s3Client.send(command);
    console.log('Upload response:', response.$metadata);

    if (response.$metadata.httpStatusCode !== 200) {
      console.error('Upload failed with status:', response.$metadata.httpStatusCode);
      return res.status(500).json({ success: false, error: 'Upload failed' });
    }

    // Generate the public URL
    const url = `https://${bucket}.${region}.digitaloceanspaces.com/${objectKey}`;
    console.log('Generated URL:', url);

    console.log('Upload completed successfully');
    return res.status(200).json({
      success: true,
      url: url,
      filename: newFilename,
      size: file.length,
      type: mimeType,
    });

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 