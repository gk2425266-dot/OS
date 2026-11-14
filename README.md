# Windows 18 Ultra — Official Portal & Distribution Platform

Developed by **MR. ANSH RAJ**  
*The Next Generation of Personal Computing.*

---

## 1. Overview & Features

- **Interactive OS Concept Preview**:
  - Two-stage boot sequence (`Stage 1: WINDOWS 18 ULTRA CONCEPT` -> `Stage 2: WELCOME`).
  - Default **Rainbow Bloom Wallpaper** inspired by Windows 11 with light/dark glassmorphism.
  - Functional interactive apps: **Start Menu**, **Ultra Store**, **Ultra Browser**, **Ultra Cyber Lab**, **Ultra Explorer**, **Threat Protection** (live quick scan + firewall/shield toggles), **System Lock Setup** (custom PIN + lock screen test), **Kali Linux & Ubuntu 24.04 LTS** terminal simulator, and **Gaming Software Hub** (Steam/Proton, Lutris, MangoHud).
- **Genuine Download Center**:
  - Serves real files from `/uploads` with `Content-Length` byte-streaming progress bars.
  - Automatically generates a valid **Installation Guide PDF**, **Release Notes**, and **SHA-256 Checksum Manifest**.
  - Un-uploaded binaries (`Windows 18 Ultra ISO`, `VirtualBox Edition`, `VMware Edition`) strictly display **Coming Soon** until uploaded or linked by an Administrator.
- **Bootable Pendrive & OS Setup Wizard**:
  - Client-side Web Crypto (`crypto.subtle.digest('SHA-256')`) checksum verification for local files.
  - Generates downloadable PowerShell (`.ps1`) and Bash (`.sh`) USB preparation/verification scripts via `POST /api/bootable-script`.
- **Ultra Store Backend**:
  - Searchable, category-filtered catalog (`GET /api/store`) with downloadable install scripts (`POST /api/store/:id/manifest`).
- **Protected Administrator Console (`/admin` or `#admin`)**:
  - `scrypt` password verification + HMAC-SHA256 `HttpOnly` session cookies + rate limiting + RBAC + audit trail.
  - Upload real ISO/VM/PDF files, update external CDN URLs, publish releases, manage Ultra Store listings, review support tickets, and edit portal copy.

---

## 2. Environment Variables

Copy `.env.example` to `.env` and set strong production secrets:

```bash
cp .env.example .env
```

Required variables for production:
- `PORT=3000`
- `ADMIN_USERNAME` — Administrator login username (defaults to `anshraj` in local dev)
- `ADMIN_PASSWORD` — Strong administrator password (never stored in frontend code)
- `ADMIN_SESSION_SECRET` — Random 32+ character secret for signing `HttpOnly` session cookies
- `APP_URL` — Public origin used in `sitemap.xml` and `robots.txt`

---

## 3. Local Development & Build

```bash
# Install dependencies
npm install

# Run full-stack Express + Vite dev server on port 3000
npm run dev

# Typecheck
npm run lint

# Build production frontend bundle
npm run build

# Start production server
NODE_ENV=production npm start
```

---

## 4. Deployment Guide

1. **Application Server (Node.js 22+)**:
   - Deploy `server.ts`, `server/`, and the compiled `dist/` bundle to a persistent Node.js host (Cloud Run, Railway, Render, or VPS) with a persistent volume mounted to `./data` and `./uploads`.
   - For multi-gigabyte ISO distribution, host the `.iso` files on an object storage CDN (Cloudflare R2, AWS S3, or GCS) and paste the verified HTTPS CDN URL + SHA-256 into the Admin Console.
2. **Vercel Frontend + Separate Backend**:
   - Build static frontend with `npm run build` (`dist/`), and configure rewrites in `vercel.json` forwarding `/api/*`, `/sitemap.xml`, and `/robots.txt` to your Node.js Express backend.

---

## 5. Testing Instructions

1. **Typecheck & Build**:
   ```bash
   npm run lint && npm run build
   ```
2. **Download & Checksum Verification**:
   - Visit `#download` and download **Installation Guide PDF**, **Release Notes**, and **SHA-256 Checksum File**.
   - Open **Create Bootable Pendrive**, select the downloaded PDF in **Verify Local File SHA-256 Checksum**, and confirm it matches the published official digest.
3. **Interactive OS & Support Validation**:
   - Click **Replay Startup (Stage 1 & 2)** inside the OS Simulator.
   - Test **Threat Protection** quick scan, **System Lock Setup** PIN lock/unlock, and `neofetch` inside the **Kali Linux** terminal.
   - Submit the Support form with invalid and valid inputs to verify validation and spam protection.
4. **Admin Dashboard**:
   - Open **Admin Dashboard** from the footer, sign in using your configured server environment credentials (`ADMIN_USERNAME` / `ADMIN_PASSWORD`), upload a test artifact, and confirm it immediately appears in the Download Center and Audit Logs.
