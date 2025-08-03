# Vercel Deployment Guide

## Overview

This guide explains how to deploy the CMS app on Vercel with CORS-free file uploads using Vercel's serverless functions.

## Benefits of Vercel Deployment

- ✅ **No CORS issues** - File uploads go through Vercel's serverless functions
- ✅ **Automatic HTTPS** - Vercel provides SSL certificates
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Easy deployment** - Connect your GitHub repository
- ✅ **Environment variables** - Secure configuration management

## Step 1: Prepare Your Repository

Make sure your repository includes:
- `vercel.json` - Vercel configuration
- `api/upload-file.ts` - Serverless function for file uploads
- `package.json` - With Node.js 18.x specified in engines
- `.nvmrc` - Node.js version specification
- All frontend files

**Important:** This project requires Node.js 18.x. Make sure your Vercel project is set to use Node.js 18.x in the project settings.

## Step 2: Set Environment Variables in Vercel

In your Vercel dashboard, go to your project settings and add these environment variables:

```env
DO_SPACES_KEY=your_digitalocean_spaces_key
DO_SPACES_SECRET=your_digitalocean_spaces_secret
DO_SPACES_REGION=sgp1
DO_SPACES_BUCKET=your_bucket_name
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TINYMCE_API_KEY=your_tinymce_api_key
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Using GitHub Integration
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push
3. Set environment variables in the Vercel dashboard

## Step 4: Verify Deployment

After deployment, test the file upload functionality:
1. Go to your deployed app URL
2. Try uploading an image in any form
3. Check that the image appears correctly

## File Upload Flow

```
Frontend → Vercel API (/api/upload-file) → DigitalOcean Spaces
```

1. **Frontend** sends file to `/api/upload-file`
2. **Vercel serverless function** processes the file
3. **DigitalOcean Spaces** stores the file
4. **Public URL** is returned to frontend

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Check Vercel dashboard for missing variables
   - Redeploy after adding variables

2. **File Upload Fails**
   - Check Vercel function logs
   - Verify DigitalOcean credentials
   - Ensure bucket permissions are correct

3. **Build Errors**
   - Check TypeScript compilation
   - Verify all dependencies are installed

4. **Node.js Version Error: "Found invalid Node.js Version: 22.x"**
   - Ensure Vercel project is set to Node.js 18.x
   - Check that `package.json` has `"engines": { "node": "18.x" }`
   - Verify `.nvmrc` file contains `18`
   - Redeploy after changing Node.js version in Vercel settings

4. **MIME Type Error: "Expected a JavaScript module script but the server responded with a MIME type of text/html"**
   - This usually means the API route is not being served correctly
   - Ensure `vercel.json` has the correct configuration
   - Check that the API function is in the correct location (`api/upload-file.ts`)
   - Verify the function exports correctly
   - Try redeploying the function specifically

### Checking Logs

In Vercel dashboard:
1. Go to your project
2. Click on "Functions" tab
3. Check logs for `/api/upload-file`

## Security Considerations

- ✅ **File size limits** - 10MB maximum
- ✅ **File type validation** - Only allowed MIME types
- ✅ **Environment variables** - Secure credential storage
- ✅ **CORS headers** - Properly configured

## Performance

- **Cold starts** - First request may be slower
- **File size** - Large files may timeout (10MB limit)
- **CDN** - Files served from DigitalOcean's global CDN

## Migration from Supabase Edge Functions

If you were using Supabase Edge Functions:
1. Remove `supabase/functions/upload-file/`
2. Update frontend to use Vercel API
3. Set environment variables in Vercel
4. Deploy and test

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure analytics
3. Set up monitoring
4. Test all functionality thoroughly 