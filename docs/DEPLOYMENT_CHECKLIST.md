# Vercel + Cloudinary Deployment Checklist

## Pre-Deployment

- [ ] **Cloudinary Account Setup:**
  - [ ] Create Cloudinary account at [cloudinary.com](https://cloudinary.com)
  - [ ] Get Cloud Name, API Key, and API Secret from dashboard
  - [ ] Note down your free tier limits (25GB storage, 25GB bandwidth/month)

- [ ] **Environment Variables Set in Vercel Dashboard:**
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_TINYMCE_API_KEY`

- [ ] **Files Present:**
  - [ ] `vercel.json` - Vercel configuration
  - [ ] `api/upload-cloudinary.ts` - Cloudinary serverless function
  - [ ] `src/services/cloudinaryFileApi.ts` - Frontend API functions
  - [ ] All React components and pages

- [ ] **Build Test:**
  - [ ] `npm run build` completes successfully
  - [ ] No TypeScript errors
  - [ ] All dependencies installed
  - [ ] Node.js version is 18.x (check with `node --version`)

- [ ] **Node.js Version Configuration:**
  - [ ] `package.json` has `"engines": { "node": "18.x" }`
  - [ ] `.nvmrc` file contains `18`
  - [ ] Vercel project settings set to Node.js 18.x

## Deployment Steps

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## Post-Deployment Verification

- [ ] **App Loads Correctly:**
  - [ ] Homepage loads without errors
  - [ ] No console errors in browser
  - [ ] Navigation works

- [ ] **Authentication Works:**
  - [ ] Login form loads
  - [ ] Can authenticate with Supabase
  - [ ] Protected routes work

- [ ] **File Uploads Work:**
  - [ ] Try uploading an image in any form
  - [ ] Check browser network tab for `/api/upload-cloudinary` calls
  - [ ] Verify images appear after upload
  - [ ] No CORS errors in console
  - [ ] Test `/api/test` endpoint for environment variables
  - [ ] Check Vercel function logs for detailed error messages

- [ ] **All CRUD Operations:**
  - [ ] Create new events/news/products
  - [ ] Edit existing items
  - [ ] Delete items
  - [ ] Search functionality works

## Troubleshooting

### If MIME Type Error Occurs:
1. Check Vercel function logs
2. Verify `vercel.json` configuration
3. Ensure API function exports correctly
4. Try redeploying specific function

### If File Uploads Fail:
1. Check Cloudinary environment variables in Vercel dashboard
2. Verify Cloudinary API credentials
3. Check function logs for errors
4. Test with smaller files first

### If Build Fails:
1. Check TypeScript compilation locally
2. Verify all dependencies are in `package.json`
3. Check for syntax errors in code

### If CommonJS Module Error:
1. Ensure all imports use ES module syntax
2. Check that no CommonJS modules are being used
3. Verify `package.json` has `"type": "module"`

### If Cloudinary Upload Fails:
1. Verify Cloudinary credentials are correct
2. Check file size (max 10MB)
3. Ensure file format is supported (JPG, PNG, GIF, WebP, SVG)
4. Check Vercel function logs for detailed errors

## Monitoring

- [ ] Set up Vercel analytics
- [ ] Monitor function execution times
- [ ] Check error logs regularly
- [ ] Monitor file upload success rates
- [ ] Check Cloudinary dashboard for usage and storage
- [ ] Monitor bandwidth usage

## Cloudinary Benefits

- ✅ **No CORS issues** - Designed for web uploads
- ✅ **Free tier** - 25GB storage, 25GB bandwidth/month
- ✅ **Image optimization** - Automatic compression and format conversion
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Secure URLs** - HTTPS by default 