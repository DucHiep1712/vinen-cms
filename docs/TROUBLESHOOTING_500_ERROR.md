# Troubleshooting 500 Upload Error

## Problem
Getting "Upload failed with status 500" when trying to upload files.

## Step-by-Step Diagnosis

### 1. Test API Endpoint
First, test if the API is working at all:

```bash
curl https://your-vercel-app.vercel.app/api/test
```

This should return:
```json
{
  "success": true,
  "message": "API is working",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "DO_SPACES_KEY": true,
    "DO_SPACES_SECRET": true,
    "DO_SPACES_REGION": "sgp1",
    "DO_SPACES_BUCKET": "your-bucket",
    "NODE_ENV": "production"
  }
}
```

### 2. Check Environment Variables
If the test endpoint shows missing environment variables:

1. **Go to Vercel Dashboard**
2. **Navigate to your project**
3. **Click "Settings" tab**
4. **Go to "Environment Variables"**
5. **Add/verify these variables:**
   ```
   DO_SPACES_KEY=your_digitalocean_spaces_key
   DO_SPACES_SECRET=your_digitalocean_spaces_secret
   DO_SPACES_REGION=sgp1
   DO_SPACES_BUCKET=your_bucket_name
   ```

### 3. Check Vercel Function Logs
1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Go to "Functions" tab**
4. **Click on `/api/upload-file`**
5. **Check the logs for detailed error messages**

### 4. Common Issues and Solutions

#### Issue: Missing Environment Variables
**Symptoms:** Logs show "Missing environment variables"
**Solution:** Set all required environment variables in Vercel dashboard

#### Issue: DigitalOcean Credentials Invalid
**Symptoms:** S3 upload fails with authentication error
**Solution:** 
1. Verify your DigitalOcean Spaces credentials
2. Check that the bucket exists and is accessible
3. Ensure the access key has proper permissions

#### Issue: File Too Large
**Symptoms:** Logs show "File too large"
**Solution:** Reduce file size to under 10MB

#### Issue: Formidable Parse Error
**Symptoms:** Logs show "Formidable parse error"
**Solution:** 
1. Check that the file is being sent correctly
2. Verify the form data structure
3. Try with a smaller file first

#### Issue: File System Error
**Symptoms:** Logs show file system errors
**Solution:** 
1. Check that the temporary file path is accessible
2. Verify file permissions
3. Try redeploying the function

### 5. Debugging Steps

#### Step 1: Check Browser Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try uploading a file
4. Look for the `/api/upload-file` request
5. Check the response for detailed error messages

#### Step 2: Test with Different Files
1. Try uploading a small image (< 1MB)
2. Try different file types (JPG, PNG, etc.)
3. Check if the issue is file-specific

#### Step 3: Check DigitalOcean Spaces
1. Verify your bucket exists
2. Check bucket permissions
3. Test uploading directly to DigitalOcean Spaces
4. Verify the region is correct

### 6. Advanced Debugging

#### Enable Detailed Logging
The API function now includes detailed logging. Check Vercel function logs for:
- Environment variable status
- File parsing details
- S3 client initialization
- Upload progress
- Error stack traces

#### Test Locally (if possible)
1. Set up environment variables locally
2. Test the API function with a local server
3. Use tools like Postman to test the endpoint

### 7. Emergency Workaround

If the issue persists, you can temporarily use direct upload:

1. **Update `src/services/fileApi.ts`**
2. **Comment out the Vercel API calls**
3. **Use direct DigitalOcean upload** (may have CORS issues)

### 8. Contact Support

If none of the above solutions work:

1. **Collect logs** from Vercel function
2. **Screenshot** the error from browser console
3. **Document** the steps to reproduce
4. **Check** if the issue is intermittent or consistent

## Prevention

To prevent future 500 errors:

1. **Monitor function logs** regularly
2. **Set up alerts** for function failures
3. **Test uploads** after any deployment
4. **Keep environment variables** up to date
5. **Use proper error handling** in frontend code 