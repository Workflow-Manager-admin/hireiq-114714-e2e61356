# Supabase Integration Guide for HireIQ Frontend

## Overview

This project uses [Supabase](https://supabase.com/) as the backend for authentication and, optionally, user profile data.
Role-based authentication (Admin, Recruiter, Candidate) will be managed through Supabase Auth and its database capabilities.

---

## 1. Supabase Project Setup

- Supabase Project URL: `https://rquvaaymanduddbwktxk.supabase.co`
- Anon/Public API Key is now configured via environment variables.

> **Do NOT commit API secrets into source control. All secrets must be managed via environment variables, NOT in committed files.**

---

## 2. Required Environment Variables

These variables are required in your React frontend (prefer `.env.local`):

```
REACT_APP_SUPABASE_URL=https://rquvaaymanduddbwktxk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdXZhYXltYW5kdWRkYndrdHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTkwOTcsImV4cCI6MjA2NjM5NTA5N30.iT_cuWebAjeMangmiYSbyutvYab4TlEBZU19QZhR0ss
```

- Place these in `hireiq_frontend/.env.local` and _never_ add that file to version control.

---

## 3. Integration Instructions

### 1. Install Supabase JS Client
```sh
npm install @supabase/supabase-js
```

### 2. Initialize Supabase Client in Code
Where you handle authentication (e.g., `AuthProvider.js`):

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Replace Demo Auth With Supabase
- Use Supabase methods for sign up, sign in, sign out
- Assign user roles using metadata or a roles table (e.g., `profiles` with `role` field)
- Use Row Level Security for authorization where needed

---

## 4. Documentation Update

- Supabase Project URL: `https://rquvaaymanduddbwktxk.supabase.co`
- Anon key is injected via env.
- Update this doc if you add social login, enable RLS, or change schema (e.g., user roles management).

---

## 5. References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Managing User Roles - Example](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

_Last updated: [2024-06 Supabase credentials applied, environment variables refreshed]_
