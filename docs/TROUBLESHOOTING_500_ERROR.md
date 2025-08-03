# Troubleshooting 500 Upload Error

## Problem
Getting "Upload failed with status 500" when trying to upload files after deploying to Vercel.

## Quick Diagnosis Steps

### Step 1: Test API Endpoints
Test these endpoints on your deployed Vercel app:

1. **Basic API test:**
   ```bash
   curl https://your-vercel-app.vercel.app/api/test
   ```

2. **Upload API test:**
   ```bash
   curl https://your-vercel-app.vercel.app/api/test-upload
   ```

3. **Cloudinary API test:**
   ```bash
   curl https://your-vercel-app.vercel.app/api/upload-cloudinary
   ```

### Step 2: Check Environment Variables in Vercel

1. **Go to Vercel Dashboard**
2. **Navigate to your project**
3. **Click "Settings" tab**
4. **Go to "Environment Variables"**
5. **Verify these variables are set:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Check Vercel Function Logs

1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Go to "Functions" tab**
4. **Click on `/api/upload-cloudinary`**
5. **Check the logs for detailed error messages**

## Common Issues and Solutions

### Issue 1: Missing Environment Variables
**Symptoms:** Logs show "Missing Cloudinary environment variables"
**Solution:** 
1. Set all three Cloudinary environment variables in Vercel dashboard
2. Redeploy the project after adding variables

### Issue 2: Cloudinary Credentials Invalid
**Symptoms:** S3 upload fails with authentication error
**Solution:** 
1. Verify your Cloudinary credentials are correct
2. Check that the cloud name, API key, and API secret match your Cloudinary dashboard
3. Ensure the credentials have proper permissions

### Issue 3: Function Not Deployed
**Symptoms:** 404 error when calling API endpoints
**Solution:**
1. Check that all API function files are in the `/api` folder
2. Verify `vercel.json` includes all functions
3. Redeploy the project

### Issue 4: Cloudinary Package Not Installed
**Symptoms:** Import errors in function logs
**Solution:**
1. Ensure `cloudinary` package is in `package.json`
2. Redeploy to install dependencies

### Issue 5: Function Timeout
**Symptoms:** Function times out after 10 seconds
**Solution:**
1. Reduce file size (max 10MB)
2. Check function execution time in Vercel logs
3. Optimize the upload process

## Step-by-Step Fix

### Step 1: Verify Environment Variables
1. **Go to Vercel Dashboard → Your Project → Settings → Environment Variables**
2. **Add/verify these variables:**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. **Click "Save"**

### Step 2: Redeploy
```bash
vercel --prod
```

### Step 3: Test the API
1. **Test basic endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/test-upload
   ```
2. **Check response for environment variable status**

### Step 4: Test File Upload
1. **Go to your deployed app**
2. **Try uploading a small image (< 1MB)**
3. **Check browser network tab for API calls**
4. **Check Vercel function logs for errors**

## Debugging Commands

### Check Function Status
```bash
# List all functions
vercel functions ls

# Check function logs
vercel logs --function=api/upload-cloudinary
```

### Test Environment Variables
```bash
# Test environment variables locally
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"
```

### Check Deployment Status
```bash
# Check deployment status
vercel ls

# Get deployment URL
vercel inspect
```

## Emergency Workaround

If the issue persists, you can temporarily use mock uploads:

1. **Add this environment variable in Vercel:**
   ```
   VITE_USE_MOCK_API=true
   ```

2. **Redeploy:**
   ```bash
   vercel --prod
   ```

3. **This will use mock uploads** instead of real Cloudinary uploads

## Prevention

To prevent future 500 errors:

1. **Always test locally first** with `vercel dev`
2. **Set environment variables before deploying**
3. **Check function logs after deployment**
4. **Use smaller files for testing**
5. **Monitor Vercel function execution times**

## Getting Help

If none of the above solutions work:

1. **Collect Vercel function logs**
2. **Screenshot the error from browser console**
3. **Document the steps to reproduce**
4. **Check if the issue is intermittent or consistent**
5. **Contact Vercel support with logs and error details** 