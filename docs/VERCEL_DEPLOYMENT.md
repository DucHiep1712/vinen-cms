# Vercel Deployment Guide

## 🚀 Quick Deploy

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [ ] All API functions are JavaScript (`.js` or `.cjs`)
- [ ] TypeScript is in `dependencies` (not `devDependencies`)
- [ ] `@types/node` is in `dependencies`
- [ ] `package.json` has `"engines": { "node": "18.x" }`
- [ ] `vercel.json` has correct function references
- [ ] No duplicate files in `/api` directory
- [ ] Build passes locally: `npm run build`

## 🔧 Configuration Files

### package.json
```json
{
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "typescript": "^5.8.3",
    "@types/node": "^24.1.0",
    "@vercel/node": "^5.3.10",
    "cloudinary": "^2.7.0"
  }
}
```

### vercel.json
```json
{
  "functions": {
    "api/upload-cloudinary.cjs": {
      "runtime": "@vercel/node@3.0.0"
    },
    "api/test.js": {
      "runtime": "@vercel/node@3.0.0"
    },
    "api/test-upload.js": {
      "runtime": "@vercel/node@3.0.0"
    },
    "api/hello.js": {
      "runtime": "@vercel/node@3.0.0"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": null
}
```

## 🌍 Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required for Cloudinary
```
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>
```

**Example:**
```
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnop@dwut3psxb
```

### Required for Supabase
```
VITE_SUPABASE_PROJECT_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 API Directory Structure

```
api/
├── hello.js                    # Basic test function
├── test.js                     # Environment test function
├── test-upload.js              # Upload API test function
└── upload-cloudinary.cjs       # File upload function (CommonJS)
```

## 🔍 Post-Deployment Verification

### Test API Endpoints
```bash
# Test basic API
curl https://your-app.vercel.app/api/hello

# Test environment variables
curl https://your-app.vercel.app/api/test

# Test upload setup
curl https://your-app.vercel.app/api/test-upload
```

### Check Function Logs
```bash
vercel logs --function=api/upload-cloudinary
```

## 🚨 Common Issues

### Issue: Schema Validation Error
**Error**: `should NOT have additional property 'nodeVersion'`
**Solution**: Remove `nodeVersion` from `vercel.json` - use `engines` in `package.json` instead

### Issue: TypeScript Module Not Found
**Error**: `Cannot find module 'typescript'`
**Solution**: Ensure TypeScript is in `dependencies` (not `devDependencies`)

### Issue: Function Not Found
**Error**: 404 on API endpoints
**Solution**: Check that all API files exist and `vercel.json` references correct files

## 📝 Notes

1. **Node.js Version**: Specified in `package.json` with `"engines": { "node": "18.x" }`
2. **JavaScript API Functions**: All API functions use JavaScript to avoid TypeScript compilation issues
3. **CommonJS Syntax**: All functions use `require()` and `module.exports`
4. **Environment Variables**: Must be set in Vercel dashboard
5. **CORS Headers**: All functions include proper CORS configuration

## ✅ Success Indicators

Your deployment is working if:
- All test endpoints return 200 status
- Environment variables are detected correctly
- Cloudinary can be imported without errors
- File uploads work successfully
- No CORS errors in browser console 