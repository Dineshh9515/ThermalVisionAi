# Quick Verification - Run These Tests NOW

## 🧪 Test 1: Backend Health (Copy & Paste in Terminal)

```bash
curl https://thermalvisionai-xhcc.onrender.com/health
```

**Expected:** `{"status":"ok","model_loaded":true,"model_mode":"pytorch"}`

**Copy your result here:**
```
[PASTE YOUR RESULT]
```

---

## 🧪 Test 2: Check Supabase Settings

Go to: https://app.supabase.com

1. Select project `cajemieaeqkynlxkzkjw`
2. Go to: **Authentication → URL Configuration**
3. Take a screenshot or note:
   - **Site URL**: ________________
   - **Redirect URLs**: List them below:
     - ________________
     - ________________
     - ________________

---

## 🧪 Test 3: Check Render Environment Variables

### Frontend Service:
1. Go to Render dashboard → Frontend service
2. Click **Settings** → **Environment**
3. Check if these 3 variables exist (Y/N):
   - [ ] VITE_API_URL
   - [ ] VITE_SUPABASE_URL
   - [ ] VITE_SUPABASE_PUBLISHABLE_KEY

If any missing: **ADD THEM NOW**

### Backend Service:
1. Go to Render dashboard → Backend service
2. Click **Settings** → **Environment**
3. Check if these 2 variables exist (Y/N):
   - [ ] FLASK_ENV (should be `production`)
   - [ ] FLASK_DEBUG (should be `false`)

If any missing: **ADD THEM NOW**

---

## 🧪 Test 4: Frontend Console Test

1. Go to: https://thermalvisionai-2.onrender.com
2. Press **F12** (Developer Tools)
3. Click **Console** tab
4. Paste this code:

```javascript
const baseUrl = 'https://thermalvisionai-xhcc.onrender.com';
fetch(baseUrl + '/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend responding:', d))
  .catch(e => console.log('❌ Backend error:', e));
```

5. Press Enter
6. **What do you see?** (Copy the output)

```
[PASTE YOUR CONSOLE OUTPUT]
```

---

## 🧪 Test 5: Supabase User Table

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **SQL Editor** (left sidebar)
4. Run this query:
   ```sql
   SELECT * FROM auth.users;
   ```
5. **How many users are there?** ______
6. **Can you see the email addresses you tried to sign up with?**

---

## 📝 Answers Checklist

Once you complete the tests above, tell me:

- [ ] Test 1 (backend health) - Success or Failure?
- [ ] Test 2 (Supabase settings) - Site URL correct?
- [ ] Test 3 (Render env vars) - All set?
- [ ] Test 4 (frontend console) - What error/message?
- [ ] Test 5 (Supabase users) - Any users in table?

---

## 🚨 If You Find Issues

**Backend health fails:**
- Backend is down or crashed
- Check Render logs

**CORS errors in console:**
- Backend not accepting frontend URL
- Server.py needs CORS fix
- Backend needs redeploy

**Supabase Site URL wrong:**
- Change it to: `https://thermalvisionai-2.onrender.com`
- Add redirect URLs

**No users in Supabase table:**
- Signup never completed
- Email not working
- Supabase auth failed

---

## ✅ Once All Tests Pass

1. Go to: https://thermalvisionai-2.onrender.com
2. Click "Go to Login"
3. Sign up with email
4. Check email (including spam)
5. Click confirmation link
6. Should redirect to /detect
7. Upload thermal image
8. Click "Run Detection"
9. Should see results!

---

**Run these tests and share the results. I'll help fix any issues!**
