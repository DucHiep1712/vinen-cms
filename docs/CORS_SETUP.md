# CORS Setup for DigitalOcean Spaces

## Overview
This guide helps you configure CORS (Cross-Origin Resource Sharing) for DigitalOcean Spaces to allow file uploads from your web application.

## The Problem
When uploading files directly from the browser to DigitalOcean Spaces, you may encounter CORS errors like:
```
Access to fetch at 'https://your-space.digitaloceanspaces.com/...' from origin 'https://your-app.com' has been blocked by CORS policy
```

## Solution 1: Configure CORS on DigitalOcean Spaces

### Using DigitalOcean CLI (doctl)

1. **Install doctl** if you haven't already:
   ```bash
   # macOS
   brew install doctl
   
   # Windows
   # Download from https://github.com/digitalocean/doctl/releases
   ```

2. **Authenticate with DigitalOcean**:
   ```bash
   doctl auth init
   ```

3. **Create a CORS configuration file** (`cors.json`):
   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": [
           "https://your-app-domain.com",
           "http://localhost:5173",
           "http://localhost:3000"
         ],
         "AllowedMethods": [
           "GET",
           "PUT",
           "POST",
           "DELETE",
           "HEAD"
         ],
         "AllowedHeaders": [
           "*"
         ],
         "ExposeHeaders": [
           "ETag"
         ],
         "MaxAgeSeconds": 3000
       }
     ]
   }
   ```

4. **Apply the CORS configuration**:
   ```bash
   doctl spaces cors set your-space-name cors.json
   ```

### Using AWS CLI (Alternative)

1. **Install AWS CLI**:
   ```bash
   # macOS
   brew install awscli
   
   # Windows
   # Download from https://aws.amazon.com/cli/
   ```

2. **Configure AWS CLI for DigitalOcean**:
   ```bash
   aws configure
   # AWS Access Key ID: your_digitalocean_spaces_key
   # AWS Secret Access Key: your_digitalocean_spaces_secret
   # Default region name: sgp1 (or your region)
   # Default output format: json
   ```

3. **Create and apply CORS configuration**:
   ```bash
   aws s3api put-bucket-cors --bucket your-space-name --cors-configuration file://cors.json --endpoint=https://sgp1.digitaloceanspaces.com
   ```

## Solution 2: Server-Side Upload Proxy

If CORS configuration doesn't work, create a server-side upload proxy:

### Using Supabase Edge Functions

1. **Create a new Edge Function** (`supabase/functions/upload-file/index.ts`):
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3"

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const formData = await req.formData()
       const file = formData.get('file') as File
       
       if (!file) {
         throw new Error('No file provided')
       }

       const s3Client = new S3Client({
         endpoint: `https://${Deno.env.get('DO_SPACES_REGION')}.digitaloceanspaces.com`,
         region: Deno.env.get('DO_SPACES_REGION'),
         credentials: {
           accessKeyId: Deno.env.get('DO_SPACES_KEY')!,
           secretAccessKey: Deno.env.get('DO_SPACES_SECRET')!,
         },
       })

       const filename = `${Date.now()}-${file.name}`
       const command = new PutObjectCommand({
         Bucket: Deno.env.get('DO_SPACES_BUCKET'),
         Key: filename,
         Body: await file.arrayBuffer(),
         ACL: 'public-read',
         ContentType: file.type,
       })

       await s3Client.send(command)
       
       const url = `https://${Deno.env.get('DO_SPACES_BUCKET')}.${Deno.env.get('DO_SPACES_REGION')}.digitaloceanspaces.com/${filename}`
       
       return new Response(
         JSON.stringify({ url }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   })
   ```

2. **Deploy the function**:
   ```bash
   supabase functions deploy upload-file
   ```

3. **Update your frontend code** to use the proxy:
   ```typescript
   export async function uploadFileWithProxy(file: File): Promise<string | null> {
     try {
       const formData = new FormData()
       formData.append('file', file)
       
       const response = await fetch('/functions/v1/upload-file', {
         method: 'POST',
         body: formData,
       })
       
       const result = await response.json()
       return result.url || null
     } catch (error) {
       console.error('Upload failed:', error)
       return null
     }
   }
   ```

## Solution 3: Environment-Specific Configuration

### Development vs Production

For development, you might want to allow all origins temporarily:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

For production, restrict to your specific domain:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-production-domain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **CORS still blocking after configuration**:
   - Clear browser cache
   - Check that the CORS configuration was applied correctly
   - Verify the origin URL matches exactly (including protocol)

2. **Preflight requests failing**:
   - Ensure `OPTIONS` method is included in `AllowedMethods`
   - Check that `AllowedHeaders` includes the headers your app sends

3. **Upload timeout**:
   - Increase timeout in your S3 client configuration
   - Consider using chunked uploads for large files

### Testing CORS Configuration

You can test your CORS configuration using curl:

```bash
curl -X OPTIONS \
  -H "Origin: https://your-app-domain.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type" \
  https://your-space.digitaloceanspaces.com/test-file
```

If CORS is configured correctly, you should see the appropriate headers in the response.

## Security Considerations

- **Never use `"*"` for `AllowedOrigins` in production**
- **Limit `AllowedMethods` to only what you need**
- **Consider using signed URLs for sensitive uploads**
- **Implement file size and type validation on the server side** 