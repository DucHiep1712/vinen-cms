# Setting Node.js Version in Vercel

## Problem
Vercel is trying to use Node.js 22.x but the project requires Node.js 18.x.

## Solution

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Click on "Settings" tab

2. **Find Node.js Version Setting:**
   - Scroll down to "Build & Development Settings"
   - Look for "Node.js Version"
   - Change from "22.x" to "18.x"

3. **Save and Redeploy:**
   - Click "Save"
   - Redeploy your project

### Method 2: Project Configuration Files

The project now includes these files to specify Node.js 18.x:

1. **`package.json`** - Contains engines specification:
   ```json
   {
     "engines": {
       "node": "18.x"
     }
   }
   ```

2. **`.nvmrc`** - Contains Node.js version:
   ```
   18
   ```

3. **`vercel.json`** - Contains build environment:
   ```json
   {
     "build": {
       "env": {
         "NODE_VERSION": "18"
       }
     }
   }
   ```

### Method 3: Vercel CLI

If using Vercel CLI, you can specify the Node.js version:

```bash
vercel --build-env NODE_VERSION=18
```

## Verification

After setting the Node.js version:

1. **Check Vercel Dashboard:**
   - Go to project settings
   - Verify Node.js version shows "18.x"

2. **Redeploy:**
   - Trigger a new deployment
   - Check build logs for Node.js version

3. **Test:**
   - Verify the app works correctly
   - Check that file uploads function properly

## Troubleshooting

### If Node.js Version Still Shows 22.x:

1. **Clear Vercel Cache:**
   - Go to project settings
   - Find "Build & Development Settings"
   - Click "Clear Build Cache"

2. **Force Redeploy:**
   ```bash
   vercel --force
   ```

3. **Check All Configuration Files:**
   - Ensure `package.json` has correct engines
   - Verify `.nvmrc` contains `18`
   - Check `vercel.json` has NODE_VERSION=18

### If Build Still Fails:

1. **Check Vercel Logs:**
   - Go to project dashboard
   - Click on latest deployment
   - Check build logs for errors

2. **Contact Vercel Support:**
   - If the issue persists
   - Provide build logs and configuration files 