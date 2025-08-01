bas# Upload Proxy Deployment Guide

## Overview
This guide helps you deploy the upload proxy Edge Function to Supabase to bypass CORS issues with DigitalOcean Spaces.

## Prerequisites

1. **Supabase CLI installed**:
   ```bash
   npm install -g supabase
   ```

2. **Supabase project initialized**:
   ```bash
   supabase init
   ```

3. **Logged into Supabase**:
   ```bash
   supabase login
   ```

## Step 1: Set Environment Variables

You need to set the DigitalOcean Spaces credentials in your Supabase project:

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add these environment variables:
   ```
   DO_SPACES_KEY=your_digitalocean_spaces_key
   DO_SPACES_SECRET=your_digitalocean_spaces_secret
   DO_SPACES_REGION=sgp1
   DO_SPACES_BUCKET=your_space_name
   ```

### Using Supabase CLI

```bash
supabase secrets set DO_SPACES_KEY=your_digitalocean_spaces_key
supabase secrets set DO_SPACES_SECRET=your_digitalocean_spaces_secret
supabase secrets set DO_SPACES_REGION=sgp1
supabase secrets set DO_SPACES_BUCKET=your_space_name
```

## Step 2: Deploy the Edge Function

```bash
# Deploy the upload-file function
supabase functions deploy upload-file

# Or deploy all functions
supabase functions deploy
```

## Step 3: Test the Function

You can test the function using curl:

```bash
# Test with a file
curl -X POST \
  -F "file=@test-image.jpg" \
  -F "stable=false" \
  https://your-project-ref.supabase.co/functions/v1/upload-file
```

## Step 4: Update Your Frontend

The frontend code has already been updated to use the proxy. Make sure your `.env` file includes:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Function Not Found
If you get a 404 error:
```bash
# Check if function exists
supabase functions list

# Redeploy if needed
supabase functions deploy upload-file
```

### Environment Variables Not Set
If you get "configuration is incomplete" error:
```bash
# Check current secrets
supabase secrets list

# Set missing variables
supabase secrets set DO_SPACES_KEY=your_key
```

### CORS Still Blocking
The Edge Function should handle CORS automatically. If you still get CORS errors:
1. Check that the function is deployed correctly
2. Verify the Supabase URL in your frontend
3. Check browser console for specific error messages

### File Size Limits
The function has a 10MB limit. For larger files:
1. Increase the limit in the Edge Function code
2. Consider chunked uploads for very large files

## Security Considerations

1. **Environment Variables**: Never commit your DigitalOcean credentials to version control
2. **File Validation**: The function validates file size and type
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Authentication**: You can add authentication to the function if needed

## Production Deployment

For production:

1. **Set proper CORS origins** in the Edge Function
2. **Add authentication** if required
3. **Monitor function usage** in Supabase dashboard
4. **Set up logging** for debugging

## Alternative: Local Development

For local development, you can run the function locally:

```bash
# Start local development
supabase start

# The function will be available at:
# http://localhost:54321/functions/v1/upload-file
```

## Monitoring

Check your function logs in the Supabase dashboard:
1. Go to **Edge Functions** → **upload-file**
2. Click on **Logs** to see function execution logs
3. Monitor for errors and performance issues 