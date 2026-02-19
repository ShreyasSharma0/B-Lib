# 📚 Bibliotheca — Smart Bookmark App

A production-ready bookmark manager built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- ✅ **Google OAuth** — Sign in with Google, no passwords
- ✅ **Private bookmarks** — Row Level Security ensures users only see their own data
- ✅ **Real-time sync** — Add a bookmark in one tab, see it instantly in another
- ✅ **Delete bookmarks** — With confirm prompt to prevent accidents
- ✅ **Auto-title extraction** — Title pre-filled from URL on input blur
- ✅ **Search** — Filter bookmarks by title, URL, or domain
- ✅ **Favicon display** — Pulls favicons from Google's favicon service
- ✅ **Optimistic UI** — Instant feedback, no loading spinners on delete

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth + DB + Realtime**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## 🚀 Deployment Guide

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from:
   - Settings → API → Project URL
   - Settings → API → Project API keys → `anon public`

### Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Paste the contents of `supabase/schema.sql` and run it
3. This creates the `bookmarks` table with Row Level Security policies

### Step 3: Enable Google OAuth

1. In Supabase dashboard → **Authentication → Providers → Google**
2. Toggle **Enable Google provider**
3. You'll need a **Google OAuth Client ID and Secret**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or select existing)
   - Enable the **Google+ API** or **People API**
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Add Authorized redirect URI: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret** back into Supabase
4. In Supabase, also add your Vercel deployment URL to **Authentication → URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Step 4: Enable Realtime

1. In Supabase dashboard → **Database → Replication**
2. Find the `bookmarks` table and toggle it to **enabled**
   - Or the SQL migration already handles this with `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;`

### Step 5: Deploy to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Click **Deploy**

### Step 6: Update OAuth Redirect URLs

After deploying to Vercel, update your Google OAuth and Supabase settings:

**In Google Cloud Console:**
- Add `https://your-app.vercel.app` to Authorized JavaScript origins
- The Supabase callback URL stays the same (it's Supabase's URL, not yours)

**In Supabase → Authentication → URL Configuration:**
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local development, also add to Supabase **Authentication → URL Configuration**:
- Redirect URLs: `http://localhost:3000/**`

---

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/callback/route.ts   # OAuth callback handler
│   ├── dashboard/page.tsx       # Protected dashboard (server component)
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.tsx               # Root layout with fonts
│   └── page.tsx                 # Login/landing page
├── components/
│   ├── AddBookmarkForm.tsx      # Form to add bookmarks
│   ├── BookmarkCard.tsx         # Individual bookmark row
│   ├── BookmarkDashboard.tsx    # Main dashboard (client, handles realtime)
│   ├── Header.tsx               # App header with user menu
│   └── LoginButton.tsx          # Google OAuth sign-in button
├── lib/supabase/
│   ├── client.ts                # Browser Supabase client
│   └── server.ts                # Server Supabase client
├── supabase/
│   └── schema.sql               # Database schema + RLS policies
├── types/
│   └── index.ts                 # TypeScript types
└── middleware.ts                # Session refresh + route protection
```

---

## 🔒 Security Notes

- **Row Level Security (RLS)** is enabled on the `bookmarks` table — users can only read/write/delete their OWN bookmarks, enforced at the database level
- The Supabase `anon` key is safe to expose client-side; RLS policies are the real security layer
- No passwords are stored — authentication is delegated entirely to Google via Supabase Auth
