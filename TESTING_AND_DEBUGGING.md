# Complete Testing & Troubleshooting Guide

## 🔍 Step-by-Step Verification

### TEST 1: Backend is Running & Responsive

**Test in Browser or Terminal:**

```bash
curl https://thermalvisionai-xhcc.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_mode": "pytorch"
}
```

**If this fails:**
- Backend is not running
- Check Render dashboard → Backend service → Logs
- Check if it says "Build failed" or "Deploy failed"

---

### TEST 2: Frontend Can Reach Backend

**1. Open Frontend in Browser:**
- Visit: https://thermalvisionai-2.onrender.com

**2. Open Developer Tools (F12):**
- Click **Console** tab
- Look for any errors

**3. Check Console for Messages:**
```javascript
// You should see something like:
// "Checking backend at: https://thermalvisionai-xhcc.onrender.com"
// If you see CORS errors, backend is not accepting frontend URL
```

**4. Test API Call in Console:**
Copy and paste this in the Console:
```javascript
fetch('https://thermalvisionai-xhcc.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Backend response:', d))
  .catch(e => console.log('Backend error:', e))
```

**Expected:**
- Should see: `Backend response: {status: "ok", ...}`

**If you see CORS error:**
- Backend CORS is not configured for frontend domain
- Backend server.py needs update
- Or backend hasn't redeployed with CORS fix

---

### TEST 3: Supabase Environment Variables

**On Render Dashboard:**

1. Go to **Frontend Service**
2. Click **Settings** → **Environment**
3. Verify all three variables exist:
   ```
   VITE_API_URL=https://thermalvisionai-xhcc.onrender.com
   VITE_SUPABASE_URL=https://cajemieaeqkynlxkzkjw.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**If missing:**
- Add them manually
- Click "Save" (will trigger redeploy)

---

### TEST 4: Supabase is Connected

**1. On Frontend, Go to Login:**
- Visit: https://thermalvisionai-2.onrender.com/login

**2. Open Browser Console (F12):**
```
Look for messages about Supabase
Should see something like:
"Supabase client initialized"
```

**3. Check if Auth UI Appears:**
- Should see email/password form
- Should see "Sign up" and "Sign in" tabs

**4. Try to Sign Up (Don't actually submit yet):**
- If form doesn't appear → Supabase not configured
- If form appears → Supabase is connected

---

### TEST 5: Check Why Login Might Be Failing

**In Browser Console, run:**
```javascript
// Check Supabase client
import { supabase } from '@/integrations/supabase/client'
supabase.auth.getSession()
  .then(({data}) => console.log('Session:', data))
  .catch(e => console.log('Auth error:', e))
```

**Or manually:**

1. Go to https://thermalvisionai-2.onrender.com/login
2. F12 → Network tab
3. Try to sign up
4. Look for network request to `https://cajemieaeqkynlxkzkjw.supabase.co`
5. Click on it, check response
6. If error: note the error message

---

## 🚨 Common Issues & Solutions

### Issue 1: "Redirect URL not allowed"

**Problem:** Supabase is rejecting your login

**Solution:**
1. Go to: https://app.supabase.com
2. Select project: `cajemieaeqkynlxkzkjw`
3. Settings → Authentication → URL Configuration
4. Add to **Redirect URLs**:
   ```
   https://thermalvisionai-2.onrender.com
   https://thermalvisionai-2.onrender.com/login
   https://thermalvisionai-2.onrender.com/detect
   ```
5. Set **Site URL** to: `https://thermalvisionai-2.onrender.com`
6. Save

---

### Issue 2: CORS Error (Backend & Frontend)

**Error in Console:** `Access to XMLHttpRequest blocked by CORS policy`

**Problem:** Backend doesn't accept requests from frontend

**Solution - Check Backend:**

1. Go to Render dashboard → Backend service
2. Check if recent deploy succeeded
3. If yes, check logs for errors
4. If "Build failed", check what failed:
   - Missing dependencies?
   - Syntax error in server.py?

**Solution - Verify CORS Code:**

Your `server.py` should have:
```python
from flask_cors import CORS

# Configure CORS
cors_config = {
    "origins": [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "https://*.onrender.com"  # This allows all Render domains
    ]
}
CORS(app, resources={r"/*": cors_config})
```

If not there, backend needs redeploy.

---

### Issue 3: Data Not Storing in Supabase

**Problem:** You signed up but data not in tables

**Possible Reasons:**

1. **Supabase Tables Don't Exist:**
   - Go to: https://app.supabase.com
   - Select project
   - Go to **SQL Editor** or **Tables**
   - Check if `auth.users` table exists (should auto-exist)
   - Check if you created custom tables

2. **Auth Tables Not Created:**
   - Supabase automatically creates `auth.users` table
   - If signup works, user should appear there

3. **Custom Tables Missing:**
   - If you created custom tables (like `detections`), they won't auto-populate
   - You need to manually insert data via frontend code

**Solution:**

Check Supabase directly:
1. Go to: https://app.supabase.com
2. Select your project
3. Go to **Table Editor**
4. Look for `auth.users` table
5. Should show users who signed up
6. If empty → signup didn't work (Supabase auth failed)

---

### Issue 4: Frontend Stuck on Localhost

**Problem:** Frontend still trying to use `http://localhost:5000`

**Cause:** Vite is using `.env.development` instead of `.env.production`

**Solution:**

Check which env file Render is using:
1. Go to Frontend service on Render
2. Settings → Environment
3. Verify `VITE_API_URL=https://thermalvisionai-xhcc.onrender.com` is set
4. If set, Render will use it (overrides .env files)
5. Click "Save" to trigger redeploy

---

## ✅ Full Connection Test Checklist

Run these tests in order:

- [ ] **Test 1:** `curl https://thermalvisionai-xhcc.onrender.com/health` returns OK
- [ ] **Test 2:** Frontend loads without JavaScript errors
- [ ] **Test 3:** Copy console test code, runs without error
- [ ] **Test 4:** Environment variables visible in Render dashboard
- [ ] **Test 5:** Supabase Auth UI appears on login page
- [ ] **Test 6:** Can click "Sign up" without CORS errors
- [ ] **Test 7:** After signup, check Supabase `auth.users` table for new user
- [ ] **Test 8:** Can login and see `/detect` page
- [ ] **Test 9:** Can upload image and see detection results

---

## 🔧 Quick Fixes to Try

### Fix 1: Clear Cache & Redeploy

Frontend service on Render:
1. Click **Deployments**
2. Find latest deploy
3. Click **... (three dots)**
4. Click **Redeploy**
5. Wait for redeploy to finish
6. Clear browser cache (Ctrl+Shift+Delete)
7. Refresh frontend URL

### Fix 2: Verify All Env Variables

Frontend service:
1. Settings → Environment
2. Make sure you have **exactly** these 3 variables:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. If any missing, add them
4. Click Save

Backend service:
1. Settings → Environment
2. Make sure you have **exactly** these 2 variables:
   - `FLASK_ENV=production`
   - `FLASK_DEBUG=false`
3. If any missing, add them
4. Click Save

### Fix 3: Check Backend Logs

1. Go to Backend service
2. Click **Logs** tab
3. Scroll through recent logs
4. Look for:
   - `Error`
   - `Failed`
   - `Exception`
5. Note any errors and check troubleshooting below

---

## 📊 What Should Happen Step-by-Step

### Local Development (for reference):
```
User visits http://localhost:8080
  ↓
Frontend loads from Vite (port 8080)
  ↓
User clicks Login
  ↓
Auth UI appears (Supabase connected)
  ↓
User signs up
  ↓
Supabase sends email
  ↓
User clicks email link
  ↓
Redirects to: http://localhost:8080/detect
  ↓
Frontend checks session (user is logged in)
  ↓
Shows Detect page
  ↓
User uploads image
  ↓
Frontend calls: http://localhost:5000/detect (backend API)
  ↓
Backend processes image
  ↓
Returns results
  ↓
Shows detection results on page
```

### On Render (should be same):
```
User visits https://thermalvisionai-2.onrender.com
  ↓
Frontend loads from Render (static site)
  ↓
User clicks Login
  ↓
Auth UI appears (Supabase connected)
  ↓
User signs up
  ↓
Supabase sends email
  ↓
User clicks email link
  ↓
Redirects to: https://thermalvisionai-2.onrender.com/detect
  ↓
Frontend checks session (user is logged in)
  ↓
Shows Detect page
  ↓
User uploads image
  ↓
Frontend calls: https://thermalvisionai-xhcc.onrender.com/detect (backend API)
  ↓
Backend processes image
  ↓
Returns results
  ↓
Shows detection results on page
```

---

## 📝 Debug Script to Run in Browser Console

Go to Frontend, press F12, paste this:

```javascript
console.log('=== Frontend Connection Test ===');

// Test 1: Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const backendUrl = import.meta.env.VITE_API_URL;
console.log('Backend URL:', backendUrl);
console.log('Supabase URL:', supabaseUrl);

// Test 2: Backend health
fetch(`${backendUrl}/health`)
  .then(r => r.json())
  .then(d => console.log('✅ Backend healthy:', d))
  .catch(e => console.log('❌ Backend error:', e.message));

// Test 3: Auth status
import { supabase } from '@/integrations/supabase/client';
supabase.auth.getSession()
  .then(({data: {session}}) => {
    if (session) {
      console.log('✅ User logged in:', session.user.email);
    } else {
      console.log('⚠️ No user logged in');
    }
  })
  .catch(e => console.log('❌ Auth error:', e.message));

console.log('=== End Test ===');
```

---

## 🎯 Next: Tell Me

1. Run **Test 1** (curl command) - does it work?
2. Run **Test 2** (browser fetch) - any errors?
3. Go to Supabase - is there an `auth.users` table? Any users?
4. Go to Supabase URL Config - what's the Site URL?
5. Share any errors from browser console (F12)

Once I know these, I can tell you exactly what to fix!

