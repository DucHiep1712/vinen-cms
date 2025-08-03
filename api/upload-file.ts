import { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

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
    
    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    console.log('Parsing form data...');
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        } else {
          console.log('Form data parsed successfully');
          console.log('Fields:', Object.keys(fields));
          console.log('Files:', Object.keys(files));
          resolve([fields, files]);
        }
      });
    });

    const fileArray = files.file as formidable.File[];
    const file = fileArray?.[0];
    const stable = Array.isArray(fields.stable) ? fields.stable[0] === 'true' : fields.stable === 'true';

    console.log('File info:', {
      hasFile: !!file,
      fileName: file?.originalFilename,
      fileSize: file?.size,
      mimeType: file?.mimetype,
      stable: stable
    });

    if (!file) {
      console.log('No file provided');
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
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
    const fileExtension = file.originalFilename?.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${uuid}.${fileExtension}`;

    // Determine folder structure
    const rootFolder = "new";
    const subFolder = stable ? "stable" : timestamp;
    const mimeType = file.mimetype || 'application/octet-stream';
    const folder = mimeType.split('/')[0]; // 'image', 'video', etc.
    const objectKey = `${rootFolder}/${folder}/${subFolder}/${filename}`;

    console.log('File details:', {
      filename,
      objectKey,
      mimeType,
      folder,
      rootFolder,
      subFolder
    });

    console.log('Reading file buffer...');
    // Read file buffer
    const fileBuffer = await fs.readFile(file.filepath);
    console.log('File buffer size:', fileBuffer.length);

    console.log('Uploading to DigitalOcean Spaces...');
    // Upload to DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: fileBuffer,
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

    console.log('Cleaning up temporary file...');
    // Clean up temporary file
    await fs.unlink(file.filepath);
    console.log('Temporary file cleaned up');

    console.log('Upload completed successfully');
    return res.status(200).json({
      success: true,
      url: url,
      filename: filename,
      size: file.size,
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