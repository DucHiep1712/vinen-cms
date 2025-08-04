# Cloudinary Setup Guide

## 🚀 Quick Setup

### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. Log into your Cloudinary dashboard
2. Go to **Settings** → **Access Keys**
3. Copy your **Cloud name**, **API Key**, and **API Secret**

### Step 3: Set Environment Variable
In your Vercel dashboard, set this environment variable:

```
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>
```

**Example:**
```
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnop@dwut3psxb
```

## 🔧 Configuration

The API function uses the `CLOUDINARY_URL` format as recommended by Cloudinary's official documentation. This single environment variable contains all the necessary credentials.

## 📁 File Structure

```
api/
└── upload-cloudinary.cjs    # Uses CLOUDINARY_URL environment variable
```

## ✅ Benefits

- ✅ **Official Format**: Uses Cloudinary's recommended URL format
- ✅ **Single Variable**: Only one environment variable needed
- ✅ **Secure**: Credentials are properly encoded
- ✅ **Easy Setup**: Copy-paste from Cloudinary dashboard

## 🚨 Troubleshooting

### Issue: "Missing CLOUDINARY_URL environment variable"
**Solution**: Set the `CLOUDINARY_URL` environment variable in Vercel dashboard

### Issue: "Invalid credentials"
**Solution**: Double-check your API key, secret, and cloud name in the URL format

### Issue: "Upload failed"
**Solution**: Verify your Cloudinary account has upload permissions enabled 