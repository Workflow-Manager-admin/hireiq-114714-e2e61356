# Supabase Integration Guide for HireIQ Frontend

## Overview

This project uses [Supabase](https://supabase.com/) as the backend for authentication and, optionally, user profile data.
Role-based authentication (Admin, Recruiter, Candidate) will be managed through Supabase Auth and its database capabilities.

---

## 1. Supabase Project Setup

If you are a maintainer:

1. [Create a Supabase Project](https://app.supabase.com)
2. Note your **Project URL** (e.g. `https://<your-project-id>.supabase.co`)
3. Go to **Project Settings > API** in the Supabase Dashboard.
4. Copy the **anon/public API Key**

---

## 2. Required Environment Variables

Add the following variables to your frontend environment (`.env.local` file or as system vars):

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Never commit secrets to source control.*

---

## 3. Integration Instructions

After creating the Supabase project and adding env vars, follow these steps:

1. **Install Supabase JS Client:**
   ```
   npm install @supabase/supabase-js
   ```

2. **Initialize the Supabase client:**
   Import and set up in your auth provider file:
   ```js
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
   const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

3. **Replace Local Auth with Supabase Auth:**
   Update your logic so user signup, login, logout, and role assignment use Supabase Auth APIs.

4. **Role Management:**
   - Supabase Auth supports custom user metadata (e.g., roles). 
   - You can add a table called `profiles` to store user roles (`Admin`, `Recruiter`, `Candidate`).
   - Use Row Level Security (RLS) for fine-grained authorization.

---

## 4. Documentation Update

Update this file with:
- Project URL and API Key (do **not** commit secrets)
- Any special configuration (Social login, RLS policies, etc.)
- Database schema (if expanded beyond authentication)

---

## 5. References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Managing User Roles - Example](https://supabase.com/docs/guides/auth/managing-user-data)

---

_Last updated: [INITIAL-SCFAFFOLD - Awaiting project credentials and implementation steps]_
