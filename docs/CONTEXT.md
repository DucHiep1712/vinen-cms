# Productivity App – Project Context & Reference

## Overview
The Productivity App is a secure, user-friendly platform designed to help individuals and teams manage events, news, and products efficiently. With a focus on single-task productivity, it integrates a robust Content Management System (CMS), OTP-based authentication, and real-time content embedding for external use. The app is ideal for organizations or users who need streamlined workflows, centralized content control, and easy sharing of information across devices and platforms.

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

## Tech stack
- Frontend: ReactJS
- Backend/Database: Supabase
- UI Frameword: Shadcn, TailwindCSS
- CMS: PayloadCMS

## Purpose
- **Single-task focus:** App guides users to work on one goal at a time.
- **Content Management:** Built-in CMS for events, news, and products.
- **Secure Access:** Phone number + OTP authentication.

---

## Core Architecture
- **Main Sections:**
  - Events
  - News
  - Products
- **CMS:** Centralized editing, versioning, and media management for all content types.
- **Authentication:** Username/password authentication.
- **Embedding:** Generate HTML snippets for external use of content.

---

## Key Workflows

### Authentication
- **Register/Login:**
  - Enter username and password → Access granted
- **Security:** Only authenticated users can manage content.

### Navigation & App Flow
1. **Launch:** Prompt for login/registration.
2. **Dashboard:** Access Events, News, Products.
3. **Section Pages:**
   - List, create, update, delete content.
   - Link to CMS for advanced editing/media.
4. **CMS:**
   - Edit text/media, manage versions, generate embed codes.

---

## CRUD Operations (All Sections)
- **Create:**
  - Form input, required field validation.
- **Read:**
  - List/detail views, pagination/infinite scroll.
- **Update:**
  - Pre-filled forms, edit text/media.
- **Delete:**
  - Soft delete (restorable), direct from list.

---

## CMS Features
- **Content Editing:** Text, images, media for all content types.
- **Version Control:** Track/revert changes.
- **Media Management:** Upload/manage images, videos, etc.
- **Embedding:** Generate HTML codes for external sites.

---

## Additional Features
- **Notifications:** Push alerts for events/news/products.
- **Search:** Filter content in each section.
- **Responsive Design:** Mobile & desktop support.
- **Permissions:** Role-based access for content management.
- **File Uploads:** CORS-free uploads via Vercel serverless functions.

## Deployment

### Vercel Deployment
The app is configured for deployment on Vercel with:
- **Serverless Functions:** File uploads handled by `/api/upload-file`
- **CORS-Free:** No cross-origin issues
- **Environment Variables:** Secure configuration management
- **Global CDN:** Fast loading worldwide

See `docs/VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

---

## Design Principles
- **Simplicity:** Minimal, intuitive UI—only essential features exposed.
- **Real-time Sync:** Updates propagate instantly across devices.
- **Security:** Username/password login, authenticated access, soft deletion.

---

## Quick Reference
- **Events:** Manage event details, embed externally.
- **News:** Publish/edit articles, support rich media.
- **Products:** Catalog management, pricing, images, embed support.
- **CMS:** Central hub for all content, versioning, and media.
- **Authentication:** Username + Password, secure access.

---

*Use this file as a high-level reference for architecture, flows, and responsibilities when developing or maintaining the Productivity App.*

---

## Database Schema

> **WARNING:** This schema is for context only and is not meant to be run. Table order and constraints may not be valid for execution.

### users
- id: uuid (PK, default: gen_random_uuid())
- username: text (unique, not null)
- password_hash: text (not null)

### members
- id: text (PK)
- is_member: boolean
- username: text
- phone_number: text
- dob: date
- org: text
- title: text
- org_location: text
- referrer_info: text

### events
- id: bigint (PK, identity)
- title: text (not null)
- image: text
- occurence_timestamp: bigint (not null)
- sale_end_timestamp: bigint (not null)
- location: text (not null)
- organizer: text (not null)
- price: int8 (not null, currency: VNĐ)
- description: text
- is_hot: boolean (not null)

### news_tags
- tags: text (JSON array of tag strings, contains all available news tags)

### product_tags
- tags: text (JSON array of tag strings, contains all available product tags)

### news
- id: bigint (PK, identity)
- title: text (not null)
- image: text
- posted_timestamp: text (not null)
- description: text (not null)
- view_count: integer (default: 0)
- is_hot: boolean (default: false)
- tags: text (JSON array of tag strings, selected from news_tags)

### products
- id: bigint (PK, identity)
- image: text
- title: text (not null)
- price: double precision
- description: text (not null)
- form_fields: text (JSON object for customer form fields)
- tags: text (JSON array of tag strings, selected from product_tags)

### status_enum
- id: integer (PK)
- label: text (not null)

#### Notes
- **Centralized Tag Management**: Tags for news and products are now managed through separate `news_tags` and `product_tags` tables, each containing a single row with a JSON array of all available tags.
- **Tag Selection**: The `tags` columns in `news` and `products` tables now store arrays of tags selected from the respective tag management tables, ensuring consistency and preventing duplicate/invalid tags.
- **Form Fields**: The products table includes a `form_fields` column to store customer information requirements as a JSON object.

---

## Recommended Folder Structure

```
vinen-cms/
│
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/               # Page-level components (Events, News, Products, CMS, Auth)
│   ├── features/            # Feature-specific logic (events, news, products, auth, cms)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── services/            # API and Supabase service logic
│   ├── styles/              # Tailwind and custom CSS
│   └── App.tsx              # Main app component
│
├── cms/                     # PayloadCMS configuration and collections
│
├── docs/                    # Documentation (CONTEXT.md, etc.)
│
├── .env                     # Environment variables (Supabase keys, etc.)
├── package.json
├── tailwind.config.js
├── README.md
└── ...
```
