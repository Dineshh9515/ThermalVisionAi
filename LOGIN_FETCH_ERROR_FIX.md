# Fix: "Can't Fetch" Error During Login/Signup

## 🔴 The Problem
When trying to login/signup, you see: **"Can't fetch"** error

This is a **Supabase authentication issue**, NOT a backend issue.

## 🔍 Why It's Happening

The login/signup form talks to **Supabase**, not your backend. When you click "Sign Up/Login", it makes a request to:
```
https://cajemieaeqkynlxkzkjw.supabase.co/auth/v1/signup
```

The fetch error means one of these:
1. ❌ Supabase redirect URLs not configured for your frontend
2. ❌ CORS issue with Supabase
3. ❌ Network blocked by browser/firewall
4. ❌ Supabase URL or API key incorrect

## ✅ Solution: Configure Supabase Redirect URLs

### Step 1: Go to Supabase Dashboard
1. Open: https://app.supabase.com
2. Click your project: **cajemieaeqkynlxkzkjw**
3. Left sidebar → **Authentication**
4. Click **Providers** → **Email**

### Step 2: Add Redirect URLs

Look for section: **Site URL** and **Redirect URLs**

Set **Site URL** to:
```
https://thermalvisionai-2.onrender.com
```

Add these **Redirect URLs**:
```
https://thermalvisionai-2.onrender.com
https://thermalvisionai-2.onrender.com/
https://thermalvisionai-2.onrender.com/detect
https://thermalvisionai-2.onrender.com/login
http://localhost:5173
http://localhost:5173/detect
http://localhost:3000
http://localhost:3000/detect
```

Click **Save**

### Step 3: Verify Environment Variables

Go to: https://dashboard.render.com

1. Click your **Frontend service** (thermalvisionai-2)
2. Go to **Settings** → **Environment**
3. Verify these are set exactly:

```
VITE_SUPABASE_URL=https://cajemieaeqkynlxkzkjw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhamVtaWVhZXFreW5seGt6a2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzI2ODAsImV4cCI6MjA3OTMwODY4MH0.nSrcFRGqiodYjTPOWRhtnxT1CiNu7sfP2EQabLIcgt8
```

If wrong, update them.

### Step 4: Redeploy Frontend

In Render dashboard:
1. Frontend service → **Deployments**
2. Click **Manual Deploy** button
3. Wait for "Live" status

### Step 5: Clear Browser Cache

This is **very important**:
1. Open your frontend: https://thermalvisionai-2.onrender.com
2. Press: **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
3. Select **All time**
4. Check: **Cookies and other site data**
5. Check: **Cached images and files**
6. Click **Clear data**

### Step 6: Test Login Again

1. Go to: https://thermalvisionai-2.onrender.com/login
2. Try to sign up with email
3. Check if it works

## 🧪 Debug: Check Browser Console for Exact Error

1. Open: https://thermalvisionai-2.onrender.com/login
2. Press **F12** (or right-click → Inspect)
3. Click **Console** tab
4. Try signing up
5. Look for error messages
6. Take a screenshot or copy the exact error

**Common errors you might see:**

### Error: "Invalid API Key"
```
Supabase error: Invalid API Key
```
**Fix**: Your VITE_SUPABASE_PUBLISHABLE_KEY is wrong or not set
- Re-copy from: Supabase → Settings → API keys → `anon` key

### Error: "Redirect URL mismatch"
```
The redirect_uri is not allowed
```
**Fix**: You didn't add the URL to Supabase redirect list
- Follow Step 2 above

### Error: "CORS error" or "Network error"
```
Access to XMLHttpRequest at 'https://cajemieaeqkynlxkzkjw.supabase.co...' has been blocked by CORS policy
```
**Fix**: 
- Wait 5 minutes after adding redirect URLs (Supabase needs time to apply)
- Clear browser cache (Step 5)
- Try incognito window (Ctrl+Shift+N)

### Error: "Failed to fetch"
```
TypeError: Failed to fetch
```
**This is usually**: Redirect URL not configured
- Follow Step 2 above and wait 5 minutes

## 🚀 Testing Checklist

- [ ] Supabase Site URL set to: https://thermalvisionai-2.onrender.com
- [ ] All redirect URLs added to Supabase
- [ ] Environment variables verified on Render
- [ ] Frontend manually redeployed on Render
- [ ] Browser cache cleared
- [ ] Tried in incognito/private window
- [ ] Waited 5+ minutes after Supabase changes

## 📱 Test on Local Machine First (Optional)

If you want to test locally before Render:

```bash
# Terminal 1: Start frontend
cd frontend
npm install
npm run dev
# Visit: http://localhost:5173/login

# Terminal 2: Start backend (if needed)
cd ..
python server.py
# Runs on: http://localhost:5000
```

Then add `http://localhost:5173` to Supabase redirect URLs (already added above).

## If Still Not Working

1. **Check Render logs**:
   - Go to Frontend service → **Logs**
   - Look for any errors during deployment
   - Check if env vars are applied

2. **Check Supabase logs**:
   - Go to: https://app.supabase.com → your project
   - **Logs** section
   - Look for auth failures

3. **Test Supabase directly**:
   - Open browser console
   - Run:
   ```javascript
   import { supabase } from '@/integrations/supabase/client';
   console.log('URL:', supabase.supabaseUrl);
   console.log('Key:', supabase.supabaseClient.auth.session);
   ```

4. **Share exact error**:
   - Open browser console (F12)
   - Screenshot the exact error message
   - Tell me what it says

## What Happens After Fix

1. ✅ Click "Sign Up"
2. ✅ Enter email and password
3. ✅ See "Check your email for confirmation"
4. ✅ Get email with confirmation link
5. ✅ Click link (redirects to https://thermalvisionai-2.onrender.com/detect)
6. ✅ You're logged in!

---

**Next Steps:**
1. Configure Supabase redirect URLs (Step 2 above)
2. Redeploy frontend on Render
3. Clear browser cache
4. Test login again
