# Troubleshooting 500 Errors in Vercel Deployment

## 🚨 Common Issues and Solutions

### 1. TypeScript Module Not Found
**Error**: `Cannot find module 'typescript'`

**Cause**: TypeScript is in `devDependencies` but Vercel needs it in `dependencies`

**Solution**:
```bash
# Move TypeScript to dependencies in package.json
# Move @types/node to dependencies in package.json
```

**Updated package.json**:
```json
{
  "dependencies": {
    // ... other dependencies
    "@types/node": "^24.1.0",
    "typescript": "~5.8.3"
  },
  "devDependencies": {
    // ... other devDependencies
    // Remove typescript and @types/node from here
  }
}
```

### 2. CommonJS Module Error
**Error**: `ReferenceError: exports is not defined in ES module scope`

**Cause**: Cloudinary package uses CommonJS syntax in ES module environment

**Solution**:
1. Rename upload function to `.cjs` extension
2. Use CommonJS syntax (`require`, `module.exports`)
3. Remove duplicate files

**Fixed Files**:
- `api/upload-cloudinary.cjs` (CommonJS)
- Removed `api/upload-cloudinary.ts`
- Removed `api/test.cjs`
- Removed `api/upload-file.ts`

### 3. Missing Environment Variables
**Error**: `Cloudinary configuration is incomplete`

**Cause**: Missing Cloudinary environment variables in Vercel

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 4. File Upload Issues
**Error**: `Upload failed with status 500`

**Cause**: Various issues with file upload processing

**Solution**:
1. Check Vercel function logs: `vercel logs --function=api/upload-cloudinary`
2. Verify file size (max 10MB)
3. Check content-type is `multipart/form-data`
4. Ensure Cloudinary credentials are correct

### 5. CORS Issues
**Error**: `Access to fetch at '...' has been blocked by CORS policy`

**Cause**: CORS headers not set properly

**Solution**:
1. All API functions now include proper CORS headers
2. Check that `vercel.json` has correct headers configuration

## 🔧 Debugging Steps

### Step 1: Check Function Logs
```bash
vercel logs --function=api/upload-cloudinary
```

### Step 2: Test API Endpoints
```bash
# Test basic API
curl https://your-app.vercel.app/api/hello

# Test environment variables
curl https://your-app.vercel.app/api/test

# Test upload setup
curl https://your-app.vercel.app/api/test-upload
```

### Step 3: Check Environment Variables
```bash
# In Vercel Dashboard
Settings → Environment Variables
```

### Step 4: Verify File Structure
```
api/
├── hello.ts              # Basic test function
├── test.ts               # Environment test function
├── test-upload.ts        # Upload API test function
└── upload-cloudinary.cjs # File upload function (CommonJS)
```

## 📋 Pre-Deployment Checklist

- [ ] TypeScript is in `dependencies` (not `devDependencies`)
- [ ] `@types/node` is in `dependencies`
- [ ] No duplicate files in `/api` directory
- [ ] `vercel.json` references correct files
- [ ] Cloudinary environment variables are set
- [ ] All API functions have proper CORS headers
- [ ] Build passes locally: `npm run build`

## 🚀 Deployment Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View function logs
vercel logs --function=api/upload-cloudinary
```

## 📝 Notes

1. **TypeScript Dependencies**: Vercel serverless functions need TypeScript in `dependencies`
2. **CommonJS for Cloudinary**: Upload function uses `.cjs` extension
3. **Environment Variables**: Must be set in Vercel dashboard
4. **File Conflicts**: Ensure no duplicate files with same name
5. **CORS Headers**: All functions include proper CORS configuration

## ✅ Success Indicators

Your deployment is working if:
- All test endpoints return 200 status
- Environment variables are detected correctly
- Cloudinary can be imported without errors
- File uploads work successfully
- No CORS errors in browser console 