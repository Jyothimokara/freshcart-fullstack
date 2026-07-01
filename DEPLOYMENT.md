# Production Deployment Readiness Checklist

Use this guide to verify configurations and safely deploy both the backend and frontend.

## 1. Django Backend Checklist (Render)

- [ ] **Python Dependencies**: Check that `requirements.txt` contains `gunicorn`, `whitenoise`, and `dj-database-url` (Done).
- [ ] **DEBUG Flag**: Enforce `DEBUG=False` in Render environment variables.
- [ ] **SECRET_KEY**: Generate a secure, unique string for the production environment.
- [ ] **Database Connection**: Parse the postgres `DATABASE_URL` dynamically using `dj_database_url` (Done).
- [ ] **ALLOWED_HOSTS**: Include the backend Render URL (e.g. `your-backend.onrender.com`) to prevent suspicious Host header requests.
- [ ] **CORS Configuration**: Restrict `CORS_ALLOWED_ORIGINS` strictly to the production frontend URL (e.g., `https://your-frontend.vercel.app`).
- [ ] **Static Assets**: Verify that `whitenoise` is configured in `MIDDLEWARE` and storage class `STORAGES` is set to compress and cache-bust (Done).
- [ ] **Build Command**: Set the build command to `chmod +x build.sh && ./build.sh` (Done).
- [ ] **Start Command**: Set Render Web Service start command to `gunicorn config.wsgi:application` (Done).

---

## 2. React Frontend Checklist (Vercel)

- [ ] **Dynamic API Routing**: Ensure the client resolves the dynamic `VITE_API_URL` environment variable for all API calls (Done).
- [ ] **SPA Rewrite Rules**: Verify `vercel.json` exists at the root to rewrite dynamic paths back to `index.html` to avoid 404s (Done).
- [ ] **Build Check**: Validate that typescript typechecking (`npx tsc --noEmit`) and Vite assembly (`npm run build`) succeed before deploy (Done).
- [ ] **Environment Variables**: Define `VITE_API_URL` pointing to the live Render endpoint `/api` route.

---

## 3. Deployment Steps

### Phase 1: Deploy Django Backend on Render
1. Navigate to the **Render Dashboard**.
2. Create a new **Blueprint Instance** and link it to your GitHub repository.
3. Review properties in `render.yaml` and deploy.
4. Verify the database migrations apply and that the static assets bundle successfully.
5. Create a Superuser in the Render console:
   ```bash
   python backend/manage.py createsuperuser
   ```
6. Navigate to `https://your-backend.onrender.com/admin` to confirm administrative logins.

### Phase 2: Deploy React Frontend on Vercel
1. Import repository on Vercel.
2. Select root directory.
3. Configure `VITE_API_URL` environment variable.
4. Run Vercel deployment.
5. Navigate to your frontend domain and test the user authentication, profile details, and address CRUD flows.
