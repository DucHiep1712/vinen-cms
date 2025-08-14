# Productivity App – Project Context & Reference

## Overview
The Productivity App is a secure, user-friendly platform designed to help individuals and teams manage events, news, and products efficiently. With a focus on single-task productivity, it integrates a robust Content Management System (CMS), username/password authentication with session timeout, and real-time content embedding for external use. The app is ideal for organizations or users who need streamlined workflows, centralized content control, and easy sharing of information across devices and platforms.

---

## Project Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the project root with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

---

## Tech Stack
- **Frontend:** ReactJS with TypeScript
- **Backend/Database:** Supabase
- **UI Framework:** Shadcn/ui, TailwindCSS
- **State Management:** React Context API
- **Routing:** React Router DOM
- **File Uploads:** Vercel serverless functions
- **Notifications:** React Hot Toast

## Purpose
- **Single-task focus:** App guides users to work on one goal at a time.
- **Content Management:** Built-in CMS for events, news, and products.
- **Secure Access:** Username/password authentication with automatic session timeout.
- **Session Security:** Automatic logout after configurable session expiration.

---

## Core Architecture

### **Main Sections:**
- **Events:** Manage event details, embed externally
- **News:** Publish/edit articles, support rich media  
- **Products:** Catalog management, pricing, images, embed support
- **Members:** User management and organization
- **Product Requests:** Customer inquiry management

### **CMS Features:**
- Centralized editing, versioning, and media management for all content types
- Tag management for news and products
- Form field customization for products

### **Authentication & Security:**
- Username/password authentication
- **Session Management:** Configurable timeout (currently set to 1 minute for testing)
- **Automatic Logout:** Session expires automatically, user redirected to login
- **Protected Routes:** All content management requires valid session
- **Navigation Guards:** Real-time session validation on route changes

---

## Session Management System

### **Key Features:**
- **Configurable Timeout:** Currently set to 1 minute for testing (configurable in `authApi.ts`)
- **Real-time Validation:** Session checked on every navigation and route render
- **Automatic Cleanup:** Expired sessions automatically logged out
- **No Warnings:** Simple approach - user logged out immediately when session expires

### **Implementation Details:**
- **Storage:** Session data stored in `localStorage` with expiration timestamp
- **Validation:** `isLoggedIn()` function checks actual session validity from storage
- **Navigation Guard:** `NavigationGuard` component validates session on every route change
- **Protected Routes:** `ProtectedRoute` component provides additional security layer
- **Context Management:** `AuthContext` manages authentication state and session countdown

### **Session Flow:**
1. **Login:** User authenticates, session created with expiration timestamp
2. **Active Session:** Countdown timer shows remaining time, user can access all features
3. **Expiration:** Session automatically expires, user logged out
4. **Re-authentication:** User must login again to continue

### **Security Features:**
- **Double Protection:** Both navigation-level and route-level session validation
- **Real-time Checks:** Session validated against `localStorage` on every interaction
- **Immediate Response:** No delay between expiration detection and logout
- **Centralized Logout:** Single logout process prevents duplicate notifications

---

## Key Workflows

### **Authentication Flow:**
1. **Login:** Enter username and password → Session created with expiration
2. **Active Session:** Access granted to all protected routes
3. **Session Expiration:** Automatic logout, redirect to login page
4. **Re-login:** New session created, access restored

### **Navigation & App Flow:**
1. **Launch:** Prompt for login/registration
2. **Dashboard:** Access Events, News, Products, Members, Product Requests
3. **Section Pages:**
   - List, create, update, delete content
   - Tag management for news and products
   - Form field customization for products
4. **Session Management:** Real-time countdown and automatic expiration handling

---

## CRUD Operations (All Sections)
- **Create:** Form input with required field validation
- **Read:** List/detail views with pagination
- **Update:** Pre-filled forms for editing content and media
- **Delete:** Soft delete (restorable) from list views

---

## File Upload System

### **Architecture:**
- **Vercel Serverless:** `/api/upload-file` handles file uploads
- **CORS-Free:** No cross-origin issues
- **Multiple Providers:** Support for ImgBB, AWS S3, and proxy uploads
- **Image Optimization:** Automatic resizing and format conversion

### **Supported Providers:**
- **ImgBB:** Direct image hosting with API key
- **AWS S3:** Scalable cloud storage
- **Proxy Upload:** Fallback option for development

---

## Additional Features
- **Notifications:** Toast notifications for success/error feedback
- **Search & Filtering:** Content filtering in each section
- **Responsive Design:** Mobile & desktop optimized
- **Tag System:** Centralized tag management for news and products
- **Form Customization:** Dynamic form fields for product requests

---

## Deployment

### **Vercel Deployment**
The app is configured for deployment on Vercel with:
- **Serverless Functions:** File uploads handled by `/api/upload-file`
- **CORS-Free:** No cross-origin issues
- **Environment Variables:** Secure configuration management
- **Global CDN:** Fast loading worldwide

See `docs/VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

---

## Design Principles
- **Simplicity:** Minimal, intuitive UI with only essential features exposed
- **Security First:** Robust session management and authentication
- **Real-time Sync:** Updates propagate instantly across devices
- **User Experience:** Clean, responsive interface with clear feedback

---

## Quick Reference
- **Events:** Manage event details, embed externally
- **News:** Publish/edit articles, support rich media
- **Products:** Catalog management, pricing, images, embed support
- **Members:** User and organization management
- **Product Requests:** Customer inquiry handling
- **Tags:** Centralized tag management for news and products
- **Authentication:** Username + Password with automatic session timeout
- **Session:** 1-minute timeout (configurable), automatic logout

---

## Database Schema

> **WARNING:** This schema is for context only and is not meant to be run. Table order and constraints may not be valid for execution.

### **users**
- `id`: uuid (PK, default: gen_random_uuid())
- `username`: text (unique, not null)
- `password_hash`: text (not null)

### **members**
- `id`: text (PK)
- `is_member`: boolean
- `username`: text
- `phone_number`: text
- `dob`: date
- `org`: text
- `title`: text
- `org_location`: text
- `referrer_info`: text

### **events**
- `id`: bigint (PK, identity)
- `title`: text (not null)
- `image`: text
- `occurence_timestamp`: bigint (not null)
- `sale_end_timestamp`: bigint (not null)
- `location`: text (not null)
- `organizer`: text (not null)
- `price`: int8 (not null, currency: VNĐ)
- `description`: text
- `is_hot`: boolean (not null)

### **news_tags**
- `tags`: text (JSON array of tag strings, contains all available news tags)

### **product_tags**
- `tags`: text (JSON array of tag strings, contains all available product tags)

### **news**
- `id`: bigint (PK, identity)
- `title`: text (not null)
- `image`: text
- `posted_timestamp`: text (not null)
- `description`: text (not null)
- `view_count`: integer (default: 0)
- `is_hot`: boolean (default: false)
- `tags`: text (JSON array of tag strings, selected from news_tags)

### **products**
- `id`: bigint (PK, identity)
- `image`: text
- `title`: text (not null)
- `price`: double precision
- `description`: text (not null)
- `form_fields`: text (JSON object for customer form fields)
- `tags`: text (JSON array of tag strings, selected from product_tags)

### **status_enum**
- `id`: integer (PK)
- `label`: text (not null)

#### **Schema Notes**
- **Centralized Tag Management**: Tags for news and products are managed through separate `news_tags` and `product_tags` tables, each containing a single row with a JSON array of all available tags.
- **Tag Selection**: The `tags` columns in `news` and `products` tables store arrays of tags selected from the respective tag management tables, ensuring consistency and preventing duplicate/invalid tags.
- **Form Fields**: The products table includes a `form_fields` column to store customer information requirements as a JSON object.

---

## Recommended Folder Structure

```
vinen-cms/
│
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── ...             # Custom components
│   ├── pages/               # Page-level components (Events, News, Products, Auth)
│   │   ├── events/          # Event management pages
│   │   ├── news/            # News management pages
│   │   ├── products/        # Product management pages
│   │   └── ...              # Other page components
│   ├── features/            # Feature-specific logic (events, news, products, auth)
│   ├── contexts/            # React Context providers (AuthContext)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── services/            # API and Supabase service logic
│   ├── styles/              # Tailwind and custom CSS
│   └── App.tsx              # Main app component with routing
│
├── api/                     # Vercel serverless functions
├── docs/                    # Documentation (CONTEXT.md, etc.)
├── supabase/                # Database migrations and functions
├── .env                     # Environment variables (Supabase keys, etc.)
├── package.json
├── tailwind.config.js
├── README.md
└── ...
```

---

## Recent Updates & Changes

### **Session Management (Latest)**
- ✅ **Session Timeout**: Configurable timeout (currently 1 minute for testing)
- ✅ **Navigation Guards**: Real-time session validation on every route change
- ✅ **Protected Routes**: Double-layer security with session checks
- ✅ **Automatic Logout**: Immediate logout when session expires
- ✅ **Clean Architecture**: Removed warning dialogs, simplified to direct logout
- ✅ **Performance**: Efficient session validation without unnecessary re-renders

### **Security Improvements**
- ✅ **Real-time Validation**: Session checked against `localStorage` on every interaction
- ✅ **Centralized Logout**: Single logout process prevents duplicate notifications
- ✅ **Route Protection**: All content management routes require valid session
- ✅ **Session Cleanup**: Automatic cleanup of expired sessions

### **User Experience**
- ✅ **Toast Notifications**: Clean feedback using react-hot-toast
- ✅ **Countdown Timer**: Real-time display of session time remaining
- ✅ **Immediate Feedback**: Clear indication when session expires
- ✅ **Seamless Re-authentication**: Easy login process after expiration

---

*Use this file as a high-level reference for architecture, flows, and responsibilities when developing or maintaining the Productivity App. The session management system is now fully integrated and provides robust security with excellent user experience.*
