# SAVIS Web App

Connect needs to the nearest helpers in Kenya.

This is the first real web version of SAVIS (Consumer + Provider).

## What works in this version

- Role selection (Consumer / Provider)
- Sign up with email + password
- Log in
- Consumer home with sample listings
- Provider dashboard (availability, stats placeholders)
- Log out

## What comes later

- Real job requests between users
- Professional / Seller / Agent roles
- ID verification
- M-Pesa payments
- Messaging and maps

---

## Setup (for the founder)

### 1. Supabase keys

1. Open your SAVIS project on https://supabase.com
2. Go to **Project Settings** → **API**
3. Copy:
   - Project URL
   - `anon` `public` key

Create a file named `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=paste-your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

### 2. Create the profiles table

In Supabase go to **SQL Editor** → New query → paste this and click **Run**:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text check (role in ('consumer', 'provider', 'professional', 'seller', 'agent')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

### 3. Auth email settings

In Supabase → **Authentication** → **Providers** → Email: keep enabled.

### 4. Deploy on Vercel

1. Push this code to your GitHub `savis` repository
2. Go to https://vercel.com → Add New Project → Import the `savis` repo
3. Add the same two environment variables
4. Deploy

You will get a public link like `https://savis-xxxx.vercel.app`

---

Built step by step with AI assistance for learning and shipping.
