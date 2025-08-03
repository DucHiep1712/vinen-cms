# Vercel API Function Verification Guide

## ✅ Function Signatures Are Correct

All API functions follow the correct Vercel signature using CommonJS:

```javascript
const { VercelRequest, VercelResponse } = require('@vercel/node');

module.exports = async function handler(req, res) {
  // Function logic here
}
```

## 📋 API Functions Overview

### 1. `/api/hello` - Basic Test
- **Purpose**: Minimal test to verify Vercel API routes work
- **Method**: GET
- **Response**: Simple JSON with timestamp
- **File**: `api/hello.js`

### 2. `/api/test` - Environment Test
- **Purpose**: Check environment variables and basic setup
- **Method**: GET
- **Response**: Environment variable status
- **File**: `api/test.js`

### 3. `/api/test-upload` - Upload API Test
- **Purpose**: Test Cloudinary import and configuration
- **Method**: GET
- **Response**: Cloudinary setup status
- **File**: `api/test-upload.js`

### 4. `/api/upload-cloudinary` - File Upload
- **Purpose**: Handle file uploads to Cloudinary
- **Method**: POST
- **Request**: multipart/form-data
- **Response**: Uploaded file URL
- **File**: `api/upload-cloudinary.cjs`

## 🔍 Verification Steps

### Step 1: Test Basic API
```bash
curl https://your-app.vercel.app/api/hello
```

**Expected Response:**
```json
{
  "message": "Hello from Vercel API!",
  "method": "GET",
  "url": "/api/hello",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 2: Test Environment Variables
```bash
curl https://your-app.vercel.app/api/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is working",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "DO_SPACES_KEY": false,
    "DO_SPACES_SECRET": false,
    "DO_SPACES_REGION": null,
    "DO_SPACES_BUCKET": null,
    "NODE_ENV": "production"
  }
}
```

### Step 3: Test Upload API Setup
```bash
curl https://your-app.vercel.app/api/test-upload
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Upload test endpoint is working",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "CLOUDINARY_CLOUD_NAME": true,
    "CLOUDINARY_API_KEY": true,
    "CLOUDINARY_API_SECRET": true,
    "NODE_ENV": "production",
    "VERCEL_ENV": "production"
  },
  "cloudinaryImport": true,
  "note": "This endpoint tests if the upload API can be reached and configured"
}
```

### Step 4: Test File Upload
```bash
# Create a test file
echo "test" > test.txt

# Upload to your app
curl -X POST \
  -F "file=@test.txt" \
  -F "stable=false" \
  https://your-app.vercel.app/api/upload-cloudinary
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/uploads/test.txt",
  "filename": "uploads/test",
  "size": 4,
  "type": "text/plain",
  "cloudinary": {
    "publicId": "uploads/test",
    "format": "txt",
    "width": null,
    "height": null
  }
}
```

## 🚨 Troubleshooting

### Issue: 404 Error
**Cause**: Function not deployed or wrong URL
**Solution**: 
1. Check that function files exist in `/api` folder
2. Verify `vercel.json` includes the function
3. Redeploy: `vercel --prod`

### Issue: 500 Error
**Cause**: Function error or missing dependencies
**Solution**:
1. Check Vercel function logs
2. Verify environment variables are set
3. Check that all dependencies are installed

### Issue: TypeScript Module Error (RESOLVED)
**Cause**: Vercel couldn't find TypeScript for serverless functions
**Solution**:
1. ✅ **FIXED**: Converted all API files to JavaScript (`.js` and `.cjs`)
2. ✅ **FIXED**: Using CommonJS syntax (`require`, `module.exports`)
3. ✅ **FIXED**: No TypeScript compilation needed for API functions

### Issue: CommonJS Module Error (RESOLVED)
**Cause**: Cloudinary package uses CommonJS syntax
**Solution**:
1. ✅ **FIXED**: Upload function uses `.cjs` extension
2. ✅ **FIXED**: Uses `require()` instead of `import()`
3. ✅ **FIXED**: Uses `module.exports` instead of `export default`

### Issue: File Conflict Error (RESOLVED)
**Cause**: Duplicate files with same name but different extensions
**Solution**:
1. ✅ **FIXED**: Removed all duplicate files
2. ✅ **FIXED**: Clean API directory structure
3. ✅ **FIXED**: Updated `vercel.json` to reference correct files

### Issue: Import Error
**Cause**: Missing dependency
**Solution**:
1. Ensure `cloudinary` package is in `package.json`
2. Redeploy to install dependencies
3. Check Vercel build logs

## 📊 Function Status Checklist

- [ ] `/api/hello` - Returns 200 with JSON
- [ ] `/api/test` - Returns environment variables
- [ ] `/api/test-upload` - Returns Cloudinary status
- [ ] `/api/upload-cloudinary` - Accepts file uploads
- [ ] All functions handle CORS correctly
- [ ] All functions handle OPTIONS requests
- [ ] Error handling works properly

## 🔧 Debugging Commands

### Check Function Logs
```bash
vercel logs --function=api/upload-cloudinary
```

### List All Functions
```bash
vercel functions ls
```

### Check Deployment Status
```bash
vercel ls
```

### Test Locally
```bash
vercel dev
```

## 📝 Notes

1. **JavaScript API Functions**: All API functions now use JavaScript to avoid TypeScript compilation issues
2. **CommonJS Syntax**: All functions use `require()` and `module.exports`
3. **CORS Headers**: All functions set proper CORS headers
4. **Error Handling**: All functions include try-catch blocks
5. **Environment Variables**: Functions check for required environment variables
6. **Clean Structure**: No TypeScript compilation needed for API functions

## ✅ Success Criteria

Your API functions are working correctly if:
- All test endpoints return 200 status
- Environment variables are properly detected
- Cloudinary can be imported successfully using CommonJS
- File uploads work without errors
- CORS headers are set correctly
- Error messages are descriptive and helpful

## 🎯 Key Changes Made

1. **Converted**: All TypeScript API files to JavaScript
2. **Updated**: All functions to use CommonJS syntax (`require`, `module.exports`)
3. **Fixed**: TypeScript module not found error
4. **Updated**: Vercel configuration to reference JavaScript files
5. **Resolved**: All module compatibility issues
6. **Simplified**: No TypeScript compilation needed for API functions

## 📁 Current API Directory Structure

```
api/
├── hello.js                    # Basic test function
├── test.js                     # Environment test function
├── test-upload.js              # Upload API test function
└── upload-cloudinary.cjs       # File upload function (CommonJS)
``` 