# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### **Prerequisites:**
- Vercel account (free tier works)
- This GitHub repository

---

## **Step 1: Deploy to Vercel**

### **Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

### **Option B: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings

---

## **Step 2: Configure Environment Variables**

⚠️ **IMPORTANT:** You must add your Gemini API key for the app to work.

### **In Vercel Dashboard:**

1. Go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add the following:

   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | `AIzaSyAqz9f4DTa0jSyW8MO3Pcm4MnJT2EEuNGo` |

4. Select which environments to apply to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **"Save"**

### **Using Vercel CLI:**
```bash
# Add environment variable
vercel env add GEMINI_API_KEY

# Paste your API key when prompted:
# AIzaSyAqz9f4DTa0jSyW8MO3Pcm4MnJT2EEuNGo

# Select: Production, Preview, Development (all three)
```

---

## **Step 3: Redeploy**

After adding the environment variable:

### **Dashboard Method:**
1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **"⋯"** (three dots)
4. Select **"Redeploy"**

### **CLI Method:**
```bash
vercel --prod
```

---

## **✅ What `vercel.json` Does**

The `vercel.json` file fixes 404 errors by:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why this is needed:**
- Your app is a Single Page Application (SPA)
- All routes should be handled by React Router (client-side)
- Without this, refreshing the page or accessing URLs directly causes 404 errors
- This config tells Vercel to serve `index.html` for all routes

---

## **🔧 Build Settings (Auto-Detected)**

Vercel will automatically detect these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `vite build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

You don't need to change these unless you have custom requirements.

---

## **🔒 Security: No Login Required**

To ensure your app is **publicly accessible without login**:

1. Go to **"Settings"** → **"Deployment Protection"**
2. Make sure **"Password Protection"** is **DISABLED**
3. Make sure **"Vercel Authentication"** is **DISABLED**

Your app should be accessible to anyone with the URL!

---

## **🌐 Access Your App**

After deployment, your app will be available at:

```
https://your-project-name.vercel.app
```

**Custom Domain (Optional):**
1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## **🐛 Troubleshooting**

### **404 Errors on Refresh**
- ✅ Fixed by `vercel.json` (already configured)
- Make sure `vercel.json` is committed to your repo

### **"API Key Not Found" Error**
- Add `GEMINI_API_KEY` to environment variables
- Redeploy after adding

### **Login Page Appears**
- Check **Deployment Protection** settings
- Disable password protection
- Disable Vercel Authentication

### **Build Fails**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

## **📊 Monitoring**

Vercel provides:
- ✅ Automatic HTTPS
- ✅ CDN with global edge network
- ✅ Analytics (in dashboard)
- ✅ Build logs
- ✅ Deployment previews for each PR

---

## **🔄 Auto-Deploy on Git Push**

Once connected to GitHub:
- Every push to `main` → Production deployment
- Every PR → Preview deployment
- Automatic builds and deploys

---

## **💡 Tips**

1. **Preview Deployments**: Every PR gets a unique URL for testing
2. **Rollback**: Can instantly rollback to previous deployments
3. **Analytics**: Free analytics available in Vercel dashboard
4. **Custom Headers**: Add security headers in `vercel.json` if needed

---

## **Need Help?**

- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
