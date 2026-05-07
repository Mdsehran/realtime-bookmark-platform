# Folio — Smart Bookmark App

A real-time bookmark manager with Google OAuth, built with Next.js 14 + Supabase.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your Supabase credentials
cp .env.local.example .env.local

# 3. Run Supabase SQL setup (see below)

# 4. Start dev server
npm run dev
```

---

## Supabase Setup

### Step 1 — Create Project
Go to [supabase.com](https://supabase.com), create a project, and copy your **Project URL** and **Anon key** into `.env.local`.

### Step 2 — Run SQL (Supabase Dashboard → SQL Editor)

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url        TEXT NOT NULL,
  title      TEXT NOT NULL,
  favicon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT — users can only read their own rows
CREATE POLICY "users_select_own"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: INSERT — users can only insert rows where user_id = their own id
CREATE POLICY "users_insert_own"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE — users can only delete their own rows
CREATE POLICY "users_delete_own"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

**Why RLS is correct:** Every policy uses `auth.uid() = user_id`. This means PostgreSQL enforces the filter on *every* query — even if someone obtained a valid anon key and tried to query directly via REST/PostgREST, they'd only ever see (or modify) rows where `user_id` matches their JWT's `sub` claim. There is no frontend-only gate that can be bypassed.

### Step 3 — Enable Google OAuth
1. Supabase Dashboard → **Authentication → Providers → Google**
2. Enable Google provider
3. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
4. Create an **OAuth 2.0 Client ID** (Web application)
5. Add Authorized redirect URIs:
   - `https://<your-project>.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
6. Paste **Client ID** and **Client Secret** back into Supabase

---

## How Real-Time Sync Works

Supabase Realtime listens to PostgreSQL's logical replication stream via the `supabase_realtime` publication. When a row is inserted or deleted in `bookmarks`, Supabase broadcasts the change over a WebSocket channel.

In `BookmarkManager.tsx`:

```ts
const channel = supabase
  .channel('bookmarks-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookmarks',
    filter: `user_id=eq.${user.id}`,   // ← server-side filter
  }, (payload) => {
    setBookmarks(prev => {
      if (prev.some(b => b.id === payload.new.id)) return prev  // deduplicate
      return [payload.new as Bookmark, ...prev]
    })
  })
  // ... DELETE handler
  .subscribe()

// Cleanup on unmount
return () => supabase.removeChannel(channel)
```

- The `filter` param tells Supabase to only send events for this user's rows (server-side — not just filtered on the client).
- On INSERT, we deduplicate against optimistic state (the UI adds the bookmark immediately on save without waiting for the realtime event).
- On component unmount the channel is removed, preventing memory leaks and ghost subscriptions.
- **Open two tabs** → add a bookmark in one → it appears in the other instantly.

---

## Bonus Feature — Auto Title Fetch

When the user pastes a URL in the Add Bookmark modal, after a 600ms debounce the app calls `/api/metadata?url=…`. The Next.js route handler fetches the page server-side (avoiding CORS) and extracts the `og:title` or `<title>` tag, pre-filling the title input.

**Why I chose this:** Typing a title manually after pasting a URL is friction. The best bookmark managers (Raindrop, Pinboard) auto-fetch metadata. It makes saving a bookmark a one-step action — paste URL, title appears, hit Save.

---

## Problems & Solutions

| Problem | Solution |
|---|---|
| Supabase cookies in Next.js App Router | Used `@supabase/ssr` with `createServerClient` and `createBrowserClient`, middleware refreshes sessions |
| Real-time causing duplicate cards | Checked `prev.some(b => b.id === incoming.id)` before inserting optimistic + realtime events |
| CORS on metadata fetch | Moved fetch to a Next.js API Route handler (server-side) — no CORS issues |
| Google OAuth redirect on Vercel | Used `x-forwarded-host` header detection in `/auth/callback` to build the correct redirect URL |

---

## If I Had More Time

I'd add **collections / folders** — a simple `tags` column (text[]) on bookmarks and a sidebar to filter by tag. Bookmarks grow fast; organization is the next UX problem after saving.

---

## Deployment (Vercel)

```bash
# Push to GitHub, then:
# 1. Import repo in Vercel
# 2. Add env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# 3. Deploy

# Add your Vercel URL to Google OAuth redirect URIs:
# https://your-app.vercel.app/auth/callback
# Add it in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
```
