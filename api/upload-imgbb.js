import formidable from 'formidable';
import fs from 'fs';
import https from 'https';
import querystring from 'querystring';

// Parse multipart form data
async function parseMultipartFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
      filter: function ({ name, originalFilename, mimetype }) {
        // Only allow image files
        return mimetype && mimetype.includes('image');
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      // TinyMCE might send the file as 'file' or 'blobid' + index
      let file = files.file || files.blobid0 || files.image;
      
      // Check all possible file fields if the above don't exist
      if (!file) {
        const fileKeys = Object.keys(files);
        if (fileKeys.length > 0) {
          file = files[fileKeys[0]];
        }
      }

      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Handle both single file and array of files
      const fileData = Array.isArray(file) ? file[0] : file;

      resolve({
        file: fileData,
        filename: fileData.originalFilename,
        mimeType: fileData.mimetype,
        stable: Array.isArray(fields.stable) ? fields.stable[0] === 'true' : fields.stable === 'true'
      });
    });
  });
}

// Helper function to make HTTPS request
function makeHttpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    console.log('ImgBB upload request received');

    // Check environment variables
    const imgbbApiKey = process.env.IMGBB_API_KEY;

    console.log('Environment variables check:', {
      hasImgbbApiKey: !!imgbbApiKey
    });

    if (!imgbbApiKey) {
      console.error('Missing IMGBB_API_KEY environment variable');
      return res.status(500).json({ 
        success: false, 
        error: 'ImgBB configuration is incomplete. Please set IMGBB_API_KEY environment variable.'
      });
    }

    // Parse the multipart form data
    console.log('Parsing multipart form data...');
    console.log('Request headers:', req.headers);
    
    const { file, filename, mimeType, stable } = await parseMultipartFormData(req);
    
    console.log('File info:', {
      filename,
      size: file.size,
      mimeType,
      stable
    });

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
    }

    // Read file content
    const fileContent = fs.readFileSync(file.filepath);
    const base64Content = fileContent.toString('base64');

    console.log('Uploading to ImgBB...');
    
    // Upload to ImgBB using https module
    const postData = querystring.stringify({
      image: base64Content,
      name: filename || 'upload'
    });

    const imgbbResponse = await makeHttpsRequest(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });

    if (imgbbResponse.status !== 200) {
      console.error('ImgBB upload error:', imgbbResponse.data);
      throw new Error(`ImgBB upload failed: ${imgbbResponse.status} ${JSON.stringify(imgbbResponse.data)}`);
    }

    const imgbbResult = imgbbResponse.data;

    if (!imgbbResult.success) {
      console.error('ImgBB API error:', imgbbResult.error);
      throw new Error(`ImgBB API error: ${imgbbResult.error?.message || 'Unknown error'}`);
    }

    console.log('ImgBB upload success:', imgbbResult.data);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    console.log('Upload completed successfully');
    return res.status(200).json({
      location: imgbbResult.data.url, // Added for TinyMCE
      url: imgbbResult.data.url,      // Existing field
      success: true,
      filename: imgbbResult.data.title,
      size: file.size,
      type: mimeType,
      imgbb: {
        id: imgbbResult.data.id,
        deleteUrl: imgbbResult.data.delete_url,
        displayUrl: imgbbResult.data.display_url,
        thumbUrl: imgbbResult.data.thumb?.url,
        mediumUrl: imgbbResult.data.medium?.url
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
}