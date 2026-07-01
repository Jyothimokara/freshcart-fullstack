# FreshCart - Full-Stack Organic E-Commerce Platform

FreshCart is a premium, modern full-stack organic e-commerce web application built with a React + TypeScript frontend and a Django Rest Framework (DRF) backend.

## Architecture Overview

```
                  ┌──────────────────────────┐
                  │   Vercel Hosting         │
                  │   React (TypeScript)     │
                  └────────────┬─────────────┘
                               │ (HTTPS)
                               ▼
                  ┌──────────────────────────┐
                  │   Render Web Service     │
                  │   Django REST API        │
                  └────────────┬─────────────┘
                               │
                               ▼
                  ┌──────────────────────────┐
                  │   Render Managed DB      │
                  │   PostgreSQL Database    │
                  └──────────────────────────┘
```

* **Frontend**: Single Page Application (SPA) built with React 19, TypeScript, and Vite.
* **Backend**: Django 5.x REST API powered by Django Rest Framework, utilizing SimpleJWT (JWT token authentication) and WhiteNoise for production static file serving.
* **Database**: SQLite (development) and PostgreSQL (production).

---

## 1. Quick Start (Local Development)

### Prerequisites
* Python 3.10+
* Node.js 18+

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables template and configure it:
   ```bash
   cp .env.example .env
   ```
5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
6. Load initial mock product/category data:
   ```bash
   python manage.py loaddata products
   ```
7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. From the project root, install npm packages:
   ```bash
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173/` in your browser.

---

## 2. Environment Variables Configuration

### Backend Environment Variables (`backend/.env`)
| Key | Default / Dev | Production Recommendation |
| :--- | :--- | :--- |
| `DEBUG` | `True` | `False` |
| `SECRET_KEY` | Development key | Generate a secure random string |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Your backend domain (e.g. `backend.onrender.com`) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Your frontend domain (e.g. `https://freshcart.vercel.app`) |
| `DB_ENGINE` | `sqlite` | `postgresql` |
| `DATABASE_URL` | None | Provisioned PostgreSQL connection string |
| `DB_SSL_REQUIRE` | `False` | `True` (depending on PostgreSQL host) |

### Frontend Environment Variables (`.env.production`)
Configure these on your Vercel project variables:
* `VITE_API_URL`: The production URL of your backend API (e.g., `https://freshcart-backend.onrender.com/api`).

---

## 3. Production Deployment Guide

### Backend Deployment (Render)
This project is configured for easy deployment on **Render** via the included [render.yaml](render.yaml) blueprint.

1. Connect your GitHub repository to Render.
2. In Render, select **Blueprints** and click **New Blueprint Instance**.
3. Point to the repository. Render will automatically parse `render.yaml` and provision:
   * A PostgreSQL database.
   * A Python Web Service running Gunicorn.
4. Render will automatically compile static files and run database migrations using the [build.sh](backend/build.sh) script.

### Frontend Deployment (Vercel)
The project is configured for hosting on **Vercel** with SPA routing support via [vercel.json](vercel.json).

1. Import your repository into Vercel.
2. Set the **Build Command** to: `npm run build`
3. Set the **Output Directory** to: `dist`
4. Configure the environment variable:
   * `VITE_API_URL` = `https://your-backend-subdomain.onrender.com/api`
5. Click **Deploy**. Vercel will build and serve the app, handling client-side routing rewrites automatically.
