# Cloudinary Setup Guide

## Why Cloudinary?

Cloudinary is a free, reliable CDN service that:
- ✅ **No CORS issues** - Designed for web uploads
- ✅ **Free tier** - 25GB storage, 25GB bandwidth/month
- ✅ **Easy setup** - Simple API keys
- ✅ **Image optimization** - Automatic compression and format conversion
- ✅ **Global CDN** - Fast loading worldwide

## Step 1: Create Cloudinary Account

1. **Go to [Cloudinary.com](https://cloudinary.com)**
2. **Click "Sign Up For Free"**
3. **Fill in your details** (email, password, etc.)
4. **Verify your email**

## Step 2: Get Your API Keys

1. **Login to Cloudinary Dashboard**
2. **Go to "Dashboard"**
3. **Copy these values:**
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnop`)

## Step 3: Set Environment Variables in Vercel

In your Vercel dashboard:

1. **Go to your project**
2. **Click "Settings" tab**
3. **Go to "Environment Variables"**
4. **Add these variables:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Deploy

```bash
vercel --prod
```

## Step 5: Test Upload

1. **Go to your deployed app**
2. **Try uploading an image**
3. **Check that it works without CORS errors**

## Benefits of Cloudinary

### 🚀 **Performance**
- **Automatic optimization** - Images are compressed and converted to optimal formats
- **Global CDN** - Images served from the nearest server
- **Responsive images** - Automatic resizing for different devices

### 🛡️ **Security**
- **No CORS issues** - Built for web applications
- **Secure URLs** - HTTPS by default
- **Access control** - Configurable permissions

### 💰 **Cost**
- **Free tier** - 25GB storage, 25GB bandwidth/month
- **Pay as you go** - Only pay for what you use
- **No hidden fees** - Transparent pricing

## File Upload Flow

```
Frontend → Vercel API (/api/upload-cloudinary) → Cloudinary CDN
```

1. **Frontend** sends file to `/api/upload-cloudinary`
2. **Vercel function** processes and uploads to Cloudinary
3. **Cloudinary** optimizes and stores the image
4. **CDN URL** is returned to frontend

## Troubleshooting

### Issue: "Missing Cloudinary environment variables"
**Solution:** Set all three environment variables in Vercel dashboard

### Issue: "Upload failed"
**Solution:** Check Vercel function logs for detailed error messages

### Issue: "File too large"
**Solution:** Reduce file size to under 10MB

### Issue: "Invalid file format"
**Solution:** Only JPG, PNG, GIF, WebP, SVG files are allowed

## Migration from DigitalOcean Spaces

If you were using DigitalOcean Spaces:

1. **Set up Cloudinary account** (follow steps above)
2. **Update environment variables** in Vercel
3. **Deploy the new API function**
4. **Test file uploads**
5. **Migrate existing files** (optional)

## Monitoring

- **Cloudinary Dashboard** - Monitor usage and storage
- **Vercel Function Logs** - Check for upload errors
- **Browser Network Tab** - Verify API calls

## Next Steps

After successful setup:

1. **Test with different file types**
2. **Monitor usage in Cloudinary dashboard**
3. **Set up image transformations** (optional)
4. **Configure backup strategy** (optional) 