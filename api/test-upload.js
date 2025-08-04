const { VercelRequest, VercelResponse } = require('@vercel/node');

module.exports = async function handler(req, res) {
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
      IMGBB_API_KEY: !!process.env.IMGBB_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    // Test if we can import formidable
    let formidableImport = false;
    try {
      const formidable = require('formidable');
      formidableImport = true;
    } catch (error) {
      console.error('Formidable import failed:', error);
    }

    return res.status(200).json({
      success: true,
      message: 'Upload test endpoint is working',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      formidableImport,
      note: 'This endpoint tests if the upload API can be reached and configured'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
    });
  }
}; 