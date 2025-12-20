# Deployment Guide

This guide covers deploying the Campus Right Side Up application to Vercel (Frontend) and Render (Backend/Supabase).

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Supabase account (free tier available)

## Frontend Deployment (Vercel)

### Step 1: Prepare Your Project

1. **Ensure all environment variables are documented:**
   - Create a `.env.example` file with all required variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

2. **Build the project locally to test:**
   ```bash
   npm run build
   ```

3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   - Click on **"Environment Variables"**
   - Add the following:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your Supabase anon/public key

6. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

### Step 3: Configure Vercel Settings

1. Go to your project settings on Vercel
2. Under **"Build & Development Settings":**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. Under **"Environment Variables":**
   - Add all required variables for Production, Preview, and Development

### Step 4: Update Supabase Settings

1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Add your Vercel domain to **"Allowed URLs"** or **"Redirect URLs"**:
   - Production: `https://your-app.vercel.app`
   - Preview: `https://*.vercel.app` (for preview deployments)

## Backend Deployment (Supabase on Render)

**Note:** Since you're using Supabase, the backend is already hosted on Supabase cloud. However, if you need to deploy any additional backend services, here's how to do it on Render.

### Option 1: Supabase Cloud (Recommended - Already Using)

Your backend is already deployed on Supabase cloud. You just need to:

1. **Run Migrations:**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

2. **Or use Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to **SQL Editor**
   - Run your migration files manually

### Option 2: Deploy Custom Backend to Render (If Needed)

If you have a separate backend service:

1. **Prepare your backend:**
   - Ensure you have a `package.json` with start script
   - Create a `render.yaml` file (optional)

2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Click **"New +"** > **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name:** Your service name
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Add environment variables
   - Click **"Create Web Service"**

## Post-Deployment Checklist

### Frontend (Vercel)

- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow
- [ ] Test all major features (Notes, Events, Marketplace, etc.)
- [ ] Check console for any errors
- [ ] Verify API calls are working
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)

### Backend (Supabase)

- [ ] Verify all migrations are applied
- [ ] Check Row Level Security (RLS) policies
- [ ] Test database connections
- [ ] Verify storage buckets are created
- [ ] Test file uploads
- [ ] Check API rate limits
- [ ] Set up database backups

## Environment Variables Reference

### Frontend (.env.local or Vercel)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Backend (Supabase Dashboard)

- Database URL (already configured)
- Service Role Key (for server-side operations)
- JWT Secret (automatically managed)

## Troubleshooting

### Common Issues

1. **Build Fails on Vercel:**
   - Check build logs for errors
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Environment Variables Not Working:**
   - Ensure variables start with `VITE_` prefix
   - Redeploy after adding new variables
   - Check variable names match exactly

3. **CORS Errors:**
   - Add Vercel domain to Supabase allowed URLs
   - Check Supabase CORS settings

4. **Database Connection Issues:**
   - Verify Supabase project is active
   - Check API keys are correct
   - Ensure RLS policies allow access

5. **File Upload Issues:**
   - Verify storage buckets exist
   - Check storage bucket policies
   - Ensure file size limits are appropriate

## Continuous Deployment

### Automatic Deployments

- **Vercel:** Automatically deploys on every push to main branch
- **Supabase:** Migrations need to be run manually or via CI/CD

### Setting up CI/CD for Migrations

1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy Migrations
   on:
     push:
       branches: [main]
       paths:
         - 'supabase/migrations/**'
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: supabase/setup-cli@v1
         - run: supabase db push
           env:
             SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
             SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
   ```

## Monitoring

### Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor performance and errors

### Supabase Monitoring

- Use Supabase Dashboard for database metrics
- Set up alerts for errors
- Monitor API usage

## Security Checklist

- [ ] Environment variables are not committed to git
- [ ] Supabase RLS policies are properly configured
- [ ] API keys are kept secure
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is properly configured
- [ ] File uploads have size limits
- [ ] User input is validated

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)

## Notes

- Vercel free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Preview deployments

- Supabase free tier includes:
  - 500MB database
  - 1GB file storage
  - 2GB bandwidth/month
  - 50,000 monthly active users

