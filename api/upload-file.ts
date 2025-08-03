import { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import { promises as fs } from 'fs';

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file as formidable.File;
    const stable = fields.stable === 'true';

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
    }

    // Get environment variables
    const accessKeyId = process.env.DO_SPACES_KEY;
    const secretAccessKey = process.env.DO_SPACES_SECRET;
    const region = process.env.DO_SPACES_REGION;
    const bucket = process.env.DO_SPACES_BUCKET;

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      return res.status(500).json({ success: false, error: 'DigitalOcean Spaces configuration is incomplete' });
    }

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
    const uuid = require('crypto').randomUUID();
    const fileExtension = file.originalFilename?.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${uuid}.${fileExtension}`;

    // Determine folder structure
    const rootFolder = "new";
    const subFolder = stable ? "stable" : timestamp;
    const mimeType = file.mimetype || 'application/octet-stream';
    const folder = mimeType.split('/')[0]; // 'image', 'video', etc.
    const objectKey = `${rootFolder}/${folder}/${subFolder}/${filename}`;

    // Read file buffer
    const fileBuffer = await fs.readFile(file.filepath);

    // Upload to DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: mimeType,
    });

    const response = await s3Client.send(command);

    if (response.$metadata.httpStatusCode !== 200) {
      return res.status(500).json({ success: false, error: 'Upload failed' });
    }

    // Generate the public URL
    const url = `https://${bucket}.${region}.digitaloceanspaces.com/${objectKey}`;

    // Clean up temporary file
    await fs.unlink(file.filepath);

    return res.status(200).json({
      success: true,
      url: url,
      filename: filename,
      size: file.size,
      type: mimeType,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
} 