import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check environment variables
    const envCheck = {
      DO_SPACES_KEY: !!process.env.DO_SPACES_KEY,
      DO_SPACES_SECRET: !!process.env.DO_SPACES_SECRET,
      DO_SPACES_REGION: process.env.DO_SPACES_REGION,
      DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
      NODE_ENV: process.env.NODE_ENV,
    };

    return res.status(200).json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      environment: envCheck,
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
    });
  }
} 