# ImgBB Setup Guide

## 🚀 Quick Setup

### Step 1: Create ImgBB Account
1. Go to [imgbb.com](https://imgbb.com)
2. Click "Create Account" or "Sign Up"
3. Verify your email

### Step 2: Get Your API Key
1. Log into your ImgBB account
2. Go to **API** section in your dashboard
3. Copy your **API Key**

### Step 3: Set Environment Variable
In your Vercel dashboard, set this environment variable:

```
IMGBB_API_KEY=your_api_key_here
```

**Example:**
```
IMGBB_API_KEY=1234567890abcdef1234567890abcdef
```

## 🔧 Configuration

The API function uses the ImgBB API to upload images. This is a simple, free image hosting service.

## 📁 File Structure

```
api/
└── upload-imgbb.cjs   # Uses IMGBB_API_KEY environment variable
```

## ✅ Benefits

- ✅ **Free Service**: No cost for basic usage
- ✅ **Simple Setup**: Only one API key needed
- ✅ **No CORS Issues**: Designed for web uploads
- ✅ **Direct URLs**: Get direct image URLs immediately
- ✅ **Multiple Formats**: Supports various image formats

## 🚨 Troubleshooting

### Issue: "Missing IMGBB_API_KEY environment variable"
**Solution**: Set the `IMGBB_API_KEY` environment variable in Vercel dashboard

### Issue: "Invalid API key"
**Solution**: Double-check your API key from ImgBB dashboard

### Issue: "Upload failed"
**Solution**: Verify your ImgBB account is active and has upload permissions

### Issue: "File too large"
**Solution**: ImgBB has a 32MB limit per image. Reduce file size if needed.

## 📊 Usage Limits

- **Free Tier**: 32MB per image
- **File Types**: JPG, PNG, GIF, BMP, TIFF, WebP
- **No bandwidth limits** for basic usage

## 🔗 API Endpoints

- **Upload**: `POST /api/upload-imgbb`
- **Response**: Returns direct image URL and metadata 