# 🚀 Deployment Guide

Deploy your Amazon Price Tracker to production with Netlify (frontend) and Render (backend).

---

## 📋 Prerequisites

- GitHub account with your code pushed
- Netlify account (free tier)
- Render account (free tier)
- Clerk account for authentication
- Gmail account with App Password

---

## 🔐 Step 1: Prepare Clerk Authentication

### 1.1 Update Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **Configure** → **Environment Variables**
4. Note down:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

### 1.2 Add Production URLs to Clerk

1. In Clerk Dashboard → **Configure** → **Domains**
2. Add your production domains:
   - Frontend: `https://your-app.netlify.app`
   - Backend: `https://your-backend.onrender.com`
3. In **Configure** → **Session & Security**
   - Add both URLs to **Allowed Origins**

---

## 🗄️ Step 2: Deploy Backend to Render

### 2.1 Prepare Backend for Deployment

1. **Create `package.json` start script** (already configured):
   ```json
   "scripts": {
     "start": "node src/server.js",
     "dev": "nodemon src/server.js"
   }
   ```

2. **Verify `.gitignore`** excludes:
   - `.env` files
   - `database.db`
   - `node_modules/`

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### 2.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `amazon-price-tracker-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 2.3 Add Environment Variables on Render

In Render dashboard → **Environment** tab, add:

```env
PORT=5000
NODE_ENV=production
CLERK_SECRET_KEY=sk_live_your_actual_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
DATABASE_PATH=./database.db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rishabh10d58@gmail.com
SMTP_PASSWORD=cjzt gnmm qqqb kpbm
FRONTEND_URL=https://your-app-name.netlify.app
```

**Important Notes:**
- Replace `FRONTEND_URL` with your actual Netlify URL (get this after frontend deployment)
- Keep your actual Gmail credentials
- Use Clerk **LIVE** keys (not test keys)

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Copy your backend URL: `https://your-backend.onrender.com`
4. Test health endpoint: `https://your-backend.onrender.com/health`

---

## 🎨 Step 3: Deploy Frontend to Netlify

### 3.1 Prepare Frontend for Deployment

1. **Update API URL** in `frontend/.env`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key
   VITE_API_URL=https://your-backend.onrender.com
   ```

2. **Create `netlify.toml`** in project root:
   ```toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

### 3.2 Deploy on Netlify

#### Option A: Using Netlify UI

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and select your repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **Show advanced** → **Add environment variable**:
   - `VITE_CLERK_PUBLISHABLE_KEY` = `pk_live_your_key`
   - `VITE_API_URL` = `https://your-backend.onrender.com`
6. Click **Deploy site**

#### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from frontend directory
cd frontend
netlify init
netlify deploy --prod
```

### 3.3 Configure Custom Domain (Optional)

1. In Netlify → **Domain settings**
2. Add custom domain or use provided: `your-app.netlify.app`
3. Copy the URL

---

## 🔄 Step 4: Update Cross-Origin Settings

### 4.1 Update Backend FRONTEND_URL

1. Go to Render Dashboard → Your Backend Service
2. **Environment** tab
3. Update `FRONTEND_URL` with your Netlify URL
4. Save and redeploy

### 4.2 Update Clerk Allowed Origins

1. Clerk Dashboard → **Configure** → **Domains**
2. Add production URLs:
   - `https://your-app.netlify.app`
   - `https://your-backend.onrender.com`

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

```bash
# Health check
curl https://your-backend.onrender.com/health

# Expected response:
{"status":"OK","timestamp":"...","uptime":123}
```

### 5.2 Test Frontend

1. Visit `https://your-app.netlify.app`
2. Click **Sign In**
3. Sign in with Clerk
4. Check browser console for any errors
5. Try adding a product

### 5.3 Test Email Notifications

1. Add a product with target price higher than current price
2. Wait for scheduled check (7:15 PM IST) or trigger manually
3. Check Gmail for notification

---

## 🛠️ Step 6: Database Persistence (Render)

**Important:** Render's free tier has ephemeral storage, meaning your SQLite database will reset on:
- Service restarts
- Redeployments
- After 15 minutes of inactivity

### Solutions:

#### Option A: Upgrade to Paid Plan ($7/month)
- Persistent disk storage
- Better for production use

#### Option B: Use PostgreSQL (Free on Render)

1. Create PostgreSQL database on Render
2. Update `backend/src/models/database.js` to use PostgreSQL
3. Install `pg` package: `npm install pg`

**For now**, the free tier works for testing, but users will need to re-add products after restarts.

---

## 🔐 Security Checklist

Before going live, verify:

- [ ] All `.env` files are in `.gitignore`
- [ ] No secrets committed to GitHub
- [ ] Clerk CORS origins configured
- [ ] SMTP credentials are App Password (not main password)
- [ ] Backend API only accepts requests from your frontend domain
- [ ] Database file not committed to GitHub

---

## 📊 Monitoring & Logs

### Render Logs
- Dashboard → Your Service → **Logs** tab
- See real-time backend logs
- Check for errors

### Netlify Logs
- Dashboard → Your Site → **Deploys** tab
- Check build logs
- Function logs (if used)

### Clerk Logs
- Dashboard → **Users & Authentication** → **Sessions**
- Monitor user sign-ins
- Check for auth errors

---

## 🐛 Common Issues & Fixes

### Issue 1: CORS Error
**Error:** `Access-Control-Allow-Origin` error in browser console

**Fix:**
- Verify `FRONTEND_URL` in Render matches your Netlify URL exactly
- Add URL to Clerk allowed origins
- Redeploy backend

### Issue 2: Unauthenticated Errors
**Error:** Backend returns 401 errors

**Fix:**
- Verify using Clerk **LIVE** keys (not test keys)
- Check frontend has correct `VITE_CLERK_PUBLISHABLE_KEY`
- Clear browser cache and sign out/in again

### Issue 3: Database Resets
**Error:** Products disappear after backend restart

**Fix:**
- Expected on Render free tier
- Upgrade to paid plan or use PostgreSQL
- Data persists between requests, only resets on restart

### Issue 4: Email Not Sending
**Error:** No emails received

**Fix:**
- Run `node backend/fix-emails.js` to update user emails
- Verify SMTP credentials in Render environment variables
- Check Gmail's "Less secure app access" is OFF (use App Password)
- Check spam folder

### Issue 5: Build Failed on Netlify
**Error:** Build command fails

**Fix:**
- Check `package.json` has `"build": "vite build"`
- Verify Node version compatibility
- Check build logs for missing dependencies
- Ensure all imports use correct paths

---

## 🔄 Update Deployment

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys on push
```

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Netlify auto-deploys on push
```

### Manual Trigger
- **Render**: Dashboard → **Manual Deploy** → **Deploy latest commit**
- **Netlify**: Dashboard → **Deploys** → **Trigger deploy**

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)
- **Netlify**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **Clerk**: Free (10,000 MAUs)
- **Gmail SMTP**: Free

**Total: $0/month** ✅

### Paid Tier (For Production)
- **Netlify Pro**: $19/month (unlimited builds, better analytics)
- **Render Starter**: $7/month (persistent disk, no sleep)
- **Clerk Pro**: $25/month (unlimited MAUs, better features)

**Total: ~$51/month** (optional, only if needed)

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
PORT=5000
NODE_ENV=production
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
DATABASE_PATH=./database.db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rishabh10d58@gmail.com
SMTP_PASSWORD=cjzt gnmm qqqb kpbm
FRONTEND_URL=https://your-app.netlify.app
```

### Frontend (Netlify)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🎉 You're Live!

Your Amazon Price Tracker is now deployed!

- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://your-backend.onrender.com`
- **Scheduler**: Runs daily at 7:15 PM IST
- **Emails**: Sent to registered user's Gmail

### Share with Others:
1. Send them your Netlify URL
2. They sign up with Clerk (OAuth)
3. They add their Amazon products
4. They receive daily price alerts!

---

## 📚 Additional Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Render Docs](https://render.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

**Need Help?** Check the logs first:
- Render: Service → Logs
- Netlify: Site → Deploys → Deploy log
- Browser: F12 → Console tab
