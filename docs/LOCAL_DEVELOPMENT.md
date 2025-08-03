# Local Development Guide

## Testing the App Locally

You can test the app locally using different methods depending on your needs.

## Prerequisites

1. **Node.js 18.x** installed
2. **Vercel CLI** installed globally (optional)
3. **Cloudinary account** set up (optional for mock testing)

## Option 1: Frontend Only Testing (Recommended for Windows)

This is the easiest way to test the app locally, especially on Windows where Vercel dev might have issues.

### Step 1: Start Frontend Development Server

```bash
# Start only the frontend (Vite dev server)
npm run dev
```

This will:
- Start the frontend on `http://localhost:5173`
- Use **mock file uploads** (no real uploads, but UI works)
- No environment variables needed for basic testing

### Step 2: Test the Application

1. **Open your browser** and go to `http://localhost:5173`
2. **Test authentication** - Login/register should work (if Supabase is configured)
3. **Test file uploads** - Will show mock placeholder images
4. **Test CRUD operations** - Create, edit, delete events/news/products

### What Works with Mock API:
- ✅ **All UI functionality** - Forms, tables, navigation
- ✅ **File upload UI** - Shows upload progress and mock images
- ✅ **Rich text editor** - TinyMCE works normally
- ✅ **CRUD operations** - All database operations work
- ❌ **Real file uploads** - Uses placeholder images instead

## Option 2: Full Local Testing with Vercel Dev

For full functionality including real file uploads.

### Step 1: Set Up Environment Variables

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

# Force real API (optional)
VITE_USE_REAL_API=true
```

### Step 2: Start Vercel Development Server

```bash
# Start Vercel dev server (runs both frontend and API functions)
vercel dev
```

This will:
- Start the frontend on `http://localhost:3000`
- Start API functions on `http://localhost:3000/api/*`
- Watch for file changes and reload automatically

### Step 3: Test Full Functionality

1. **Open your browser** and go to `http://localhost:3000`
2. **Test authentication** - Login/register should work
3. **Test file uploads** - Real uploads to Cloudinary
4. **Test CRUD operations** - Create, edit, delete events/news/products

## Option 3: Force Real API with Frontend Only

If you want to test real uploads without Vercel dev:

1. **Set up environment variables** in `.env.local`
2. **Add `VITE_USE_REAL_API=true`** to force real API calls
3. **Run `npm run dev`** - Will use real Cloudinary API

## Troubleshooting

### Issue: "vercel dev" not found
**Solution:** Install Vercel CLI globally:
```bash
npm install -g vercel
```

### Issue: Permission errors on Windows
**Solution:** Use frontend-only testing with `npm run dev`

### Issue: Environment variables not loaded
**Solution:** 
1. Make sure `.env.local` exists in project root
2. Restart the dev server after adding variables
3. Check that variable names match exactly

### Issue: Mock uploads not working
**Solution:** Check browser console for any JavaScript errors

### Issue: Real uploads fail
**Solution:**
1. Verify Cloudinary credentials in `.env.local`
2. Check browser network tab for API calls
3. Ensure `VITE_USE_REAL_API=true` is set

## Development Workflow

### For UI Development:
1. **Start frontend server:**
   ```bash
   npm run dev
   ```
2. **Make changes** to your code
3. **Test UI** in browser at `http://localhost:5173`
4. **Use mock uploads** for testing file upload UI

### For Full Testing:
1. **Set up environment variables** in `.env.local`
2. **Start Vercel dev server:**
   ```bash
   vercel dev
   ```
3. **Test everything** in browser at `http://localhost:3000`
4. **Deploy when ready:**
   ```bash
   vercel --prod
   ```

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLOUDINARY_CLOUD_NAME` | For real uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For real uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For real uploads | Cloudinary API secret |
| `VITE_SUPABASE_URL` | For database | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For database | Supabase anonymous key |
| `VITE_TINYMCE_API_KEY` | For editor | TinyMCE API key |
| `VITE_USE_REAL_API` | Optional | Force real API instead of mock |

## Tips for Local Development

1. **Start with mock API** - Use `npm run dev` for quick UI testing
2. **Use `.env.local`** for local environment variables (not committed to git)
3. **Check browser console** for any errors
4. **Test file uploads** with different file types and sizes
5. **Monitor network tab** to see API calls and responses
6. **Use real API sparingly** - Only when testing actual upload functionality 