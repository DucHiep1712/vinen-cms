# Local Development Guide

## Testing the App Locally

You can test the app locally using Vercel's development server, which will run both the frontend and API functions locally.

## Prerequisites

1. **Node.js 18.x** installed
2. **Vercel CLI** installed globally
3. **Cloudinary account** set up

## Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
# Cloudinary (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Supabase (Required for database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# TinyMCE (Required for rich text editor)
VITE_TINYMCE_API_KEY=your_tinymce_api_key
```

## Step 2: Start Local Development Server

```bash
# Start Vercel dev server (runs both frontend and API functions)
vercel dev
```

This will:
- Start the frontend on `http://localhost:3000`
- Start API functions on `http://localhost:3000/api/*`
- Watch for file changes and reload automatically

## Step 3: Test the Application

1. **Open your browser** and go to `http://localhost:3000`
2. **Test authentication** - Login/register should work
3. **Test file uploads** - Try uploading images in any form
4. **Test CRUD operations** - Create, edit, delete events/news/products

## Alternative: Frontend Only Development

If you want to test just the frontend without API functions:

```bash
# Start only the frontend (Vite dev server)
npm run dev
```

This will start the frontend on `http://localhost:5173`, but file uploads won't work since there's no API server.

## Testing File Uploads Locally

### Option 1: Use Vercel Dev (Recommended)
```bash
vercel dev
```
- ✅ Full functionality including file uploads
- ✅ API functions work locally
- ✅ Environment variables loaded from `.env.local`

### Option 2: Mock Uploads for Frontend Testing
If you want to test the frontend without setting up Cloudinary:

1. **Comment out the Cloudinary API calls** in `src/services/fileApi.ts`
2. **Add mock responses** for testing UI
3. **Use `npm run dev`** for frontend-only testing

## Troubleshooting

### Issue: "vercel dev" not found
**Solution:** Install Vercel CLI globally:
```bash
npm install -g vercel
```

### Issue: Environment variables not loaded
**Solution:** 
1. Make sure `.env.local` exists in project root
2. Restart the dev server after adding variables
3. Check that variable names match exactly

### Issue: API functions not working
**Solution:**
1. Check that `.env.local` has Cloudinary credentials
2. Verify the API function files exist in `/api` folder
3. Check Vercel dev server logs for errors

### Issue: File uploads fail locally
**Solution:**
1. Verify Cloudinary credentials in `.env.local`
2. Check browser network tab for API calls
3. Check Vercel dev server logs for detailed errors

## Development Workflow

1. **Start development server:**
   ```bash
   vercel dev
   ```

2. **Make changes** to your code

3. **Test changes** in browser at `http://localhost:3000`

4. **Check logs** in terminal for any errors

5. **Deploy when ready:**
   ```bash
   vercel --prod
   ```

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `VITE_TINYMCE_API_KEY` | ✅ | TinyMCE API key |

## Tips for Local Development

1. **Use `.env.local`** for local environment variables (not committed to git)
2. **Check Vercel dev logs** for API function errors
3. **Use browser dev tools** to debug frontend issues
4. **Test file uploads** with different file types and sizes
5. **Monitor network tab** to see API calls and responses 