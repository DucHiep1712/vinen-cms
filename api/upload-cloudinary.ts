import { VercelRequest, VercelResponse } from '@vercel/node';

// Dynamic import for Cloudinary to avoid CommonJS issues
let cloudinary: any;

async function initCloudinary() {
  if (!cloudinary) {
    try {
      const cloudinaryModule = await import('cloudinary');
      cloudinary = cloudinaryModule.v2;
      
      // Configure Cloudinary
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    } catch (error) {
      console.error('Failed to import cloudinary:', error);
      throw error;
    }
  }
  return cloudinary;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Cloudinary API function called:', req.method, req.url);
  
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
    console.log('Starting Cloudinary upload process');
    
    // Initialize Cloudinary
    const cloudinaryInstance = await initCloudinary();
    
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

    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Environment variables check:', {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      cloudName: cloudName
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Cloudinary configuration is incomplete',
        missing: {
          cloudName: !cloudName,
          apiKey: !apiKey,
          apiSecret: !apiSecret
        }
      });
    }

    console.log('Uploading to Cloudinary...');
    
    // Convert buffer to base64
    const base64File = file.toString('base64');
    const dataURI = `data:${mimeType};base64,${base64File}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinaryInstance.uploader.upload(
        dataURI,
        {
          folder: stable ? 'stable' : 'uploads',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result);
            resolve(result);
          }
        }
      );
    });

    console.log('Upload completed successfully');
    return res.status(200).json({
      success: true,
      url: (uploadResult as any).secure_url,
      filename: (uploadResult as any).public_id,
      size: file.length,
      type: mimeType,
      cloudinary: {
        publicId: (uploadResult as any).public_id,
        format: (uploadResult as any).format,
        width: (uploadResult as any).width,
        height: (uploadResult as any).height
      }
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