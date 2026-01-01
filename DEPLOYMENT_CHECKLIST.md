# 🚀 Quick Deployment Checklist

Use this checklist to deploy your app step-by-step.

## ✅ Before You Start

- [ ] Code pushed to GitHub
- [ ] `.env` files not committed (check `.gitignore`)
- [ ] Have Clerk account and keys ready
- [ ] Have Gmail App Password ready
- [ ] Netlify account created
- [ ] Render account created

---

## 📦 Backend Deployment (Render)

### Setup
- [ ] Go to [render.com](https://render.com)
- [ ] New → Web Service
- [ ] Connect GitHub repo
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

### Environment Variables
Add these in Render Environment tab:

- [ ] `PORT` = `5000`
- [ ] `NODE_ENV` = `production`
- [ ] `CLERK_SECRET_KEY` = `sk_live_...` (from Clerk)
- [ ] `CLERK_PUBLISHABLE_KEY` = `pk_live_...` (from Clerk)
- [ ] `DATABASE_PATH` = `./database.db`
- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USER` = `rishabh10d58@gmail.com`
- [ ] `SMTP_PASSWORD` = `cjzt gnmm qqqb kpbm`
- [ ] `FRONTEND_URL` = `https://your-app.netlify.app` (update later)

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Copy backend URL: `https://_____.onrender.com`
- [ ] Test: Visit `https://_____.onrender.com/health`

---

## 🎨 Frontend Deployment (Netlify)

### Setup
- [ ] Go to [netlify.com](https://netlify.com)
- [ ] New site from Git
- [ ] Connect GitHub repo
- [ ] Base directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/dist`

### Environment Variables
Add these in Netlify Build settings:

- [ ] `VITE_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (from Clerk)
- [ ] `VITE_API_URL` = `https://your-backend.onrender.com`

### Deploy
- [ ] Click "Deploy site"
- [ ] Wait for deployment (2-5 min)
- [ ] Copy frontend URL: `https://_____.netlify.app`

---

## 🔄 Update Cross-References

### Update Backend
- [ ] Go to Render → Backend → Environment
- [ ] Update `FRONTEND_URL` with your Netlify URL
- [ ] Save → Redeploy

### Update Clerk
- [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Configure → Domains
- [ ] Add both URLs:
  - `https://your-app.netlify.app`
  - `https://your-backend.onrender.com`
- [ ] Configure → Session & Security → Allowed Origins
  - Add both URLs

---

## ✅ Testing

- [ ] Visit frontend URL
- [ ] Sign in works (redirects to Clerk)
- [ ] Dashboard loads without errors
- [ ] Can add a product
- [ ] Backend logs show activity (Render → Logs)
- [ ] Email received after scheduled check

---

## 🐛 If Something Fails

### Backend 500 Error
- Check Render logs
- Verify all environment variables are set
- Redeploy

### Frontend Blank Page
- Check Netlify deploy logs
- Verify build command ran successfully
- Check browser console (F12)

### CORS Error
- Verify `FRONTEND_URL` in Render matches Netlify URL exactly
- Check Clerk allowed origins
- Redeploy backend

### Authentication Error
- Verify using LIVE keys (not test keys)
- Check Clerk dashboard for domains
- Clear browser cache

---

## 🎉 Done!

Your app is live at:
- **Frontend**: https://_____.netlify.app
- **Backend**: https://_____.onrender.com

Both will auto-deploy on every `git push`!

---

## 📝 Post-Deployment

- [ ] Save your URLs somewhere safe
- [ ] Monitor Render logs for errors
- [ ] Test email notifications at 7:15 PM
- [ ] Share with friends!

---

**Cost**: $0/month (free tier)

**Note**: Backend sleeps after 15min inactivity on free tier. First request after sleep takes ~30 seconds.
