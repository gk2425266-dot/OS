import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  COOKIE_NAME,
  createSessionToken,
  requireAdmin,
  requireRole,
  verifyAdminPassword,
  verifySessionToken,
  type AuthenticatedRequest,
} from './server/auth.ts';
import {
  UPLOADS_DIR,
  computeFileSha256,
  formatBytes,
  readDatabase,
  rebuildChecksumManifest,
  rebuildReleaseNotesFile,
  writeDatabase,
} from './server/db.ts';
import type { AuditLog, ReleaseEntry, StoreApp, SupportMessage } from './src/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const ALLOWED_EXTENSIONS = new Set([
  '.iso',
  '.img',
  '.ova',
  '.vdi',
  '.vmdk',
  '.zip',
  '.pdf',
  '.txt',
  '.md',
  '.sha256',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(0, 64);
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500 MB max in local/preview server; configure cloud/CDN for multi-GB ISOs
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`Unsupported file extension "${ext}". Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`));
      return;
    }
    cb(null, true);
  },
});

function appendAudit(
  actor: string,
  role: string,
  action: string,
  target: string,
  details: string,
): AuditLog {
  return {
    id: `audit-${crypto.randomUUID().slice(0, 8)}`,
    actor,
    role,
    action,
    target,
    details,
    timestamp: new Date().toISOString(),
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Rate limiters
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many administrator login attempts. Please wait 15 minutes.' },
  });

  const supportLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many support submissions. Please try again in a few minutes.' },
  });

  const adminApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Ensure DB & generated genuine artifacts exist on startup
  readDatabase();

  // --- SEO Routes ---
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/admin',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n'),
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const routes = ['/', '/#features', '/#download', '/#installation', '/#store', '/#updates', '/#support', '/#about'];
    const today = new Date().toISOString().split('T')[0];
    const urls = routes
      .map(
        (r) => `  <url>
    <loc>${baseUrl}${r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
      )
      .join('\n');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    );
  });

  // --- Public API ---
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'windows-18-ultra-portal' });
  });

  app.get('/api/bootstrap', (_req, res) => {
    const db = readDatabase();
    res.json({
      downloads: db.downloads,
      releases: db.releases,
      storeApps: db.storeApps,
      siteContent: db.siteContent,
    });
  });

  app.get('/api/store', (req, res) => {
    const db = readDatabase();
    const category = String(req.query.category || 'All').trim();
    const q = String(req.query.q || '').trim().toLowerCase();

    const filtered = db.storeApps.filter((appItem) => {
      const catMatch = category === 'All' || appItem.category === category;
      const queryMatch =
        !q ||
        appItem.name.toLowerCase().includes(q) ||
        appItem.description.toLowerCase().includes(q) ||
        appItem.developer.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
    res.json({ apps: filtered });
  });

  app.post('/api/store/:id/manifest', (req, res) => {
    const db = readDatabase();
    const appItem = db.storeApps.find((a) => a.id === req.params.id);
    if (!appItem) {
      res.status(404).json({ error: 'Application not found in Ultra Store.' });
      return;
    }

    const scriptContent = [
      '#!/usr/bin/env bash',
      `# Windows 18 Ultra - Ultra Store Package Manifest`,
      `# App: ${appItem.name} (${appItem.version})`,
      `# Developer: ${appItem.developer}`,
      `# Compatibility: ${appItem.compatibility}`,
      '',
      `echo "Preparing ${appItem.name} installation on Windows 18 Ultra..."`,
      `${appItem.packageCommand}`,
      '',
    ].join('\n');

    const safeName = appItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}-install.sh"`);
    res.send(scriptContent);
  });

  // Real File Download Endpoint
  app.get('/api/downloads/:id/file', (req, res) => {
    const db = readDatabase();
    const item = db.downloads.find((d) => d.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Download artifact not found.' });
      return;
    }

    if (item.status !== 'available') {
      res.status(404).json({
        error: `${item.title} is currently marked Coming Soon. No verified build has been published yet.`,
      });
      return;
    }

    if (item.externalUrl && !item.filename) {
      item.downloadCount += 1;
      db.downloadEvents.unshift({
        id: `dl-${crypto.randomUUID().slice(0, 8)}`,
        downloadId: item.id,
        title: item.title,
        timestamp: new Date().toISOString(),
      });
      db.downloadEvents = db.downloadEvents.slice(0, 100);
      writeDatabase(db);
      res.redirect(item.externalUrl);
      return;
    }

    if (!item.filename) {
      res.status(404).json({ error: 'File has not been uploaded yet.' });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, path.basename(item.filename));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Hosted file missing on storage volume.' });
      return;
    }

    const stat = fs.statSync(filePath);
    item.downloadCount += 1;
    db.downloadEvents.unshift({
      id: `dl-${crypto.randomUUID().slice(0, 8)}`,
      downloadId: item.id,
      title: item.title,
      timestamp: new Date().toISOString(),
    });
    db.downloadEvents = db.downloadEvents.slice(0, 100);
    writeDatabase(db);

    res.setHeader('Content-Length', String(stat.size));
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(item.filename)}"`);
    if (item.sha256) {
      res.setHeader('X-File-SHA256', item.sha256);
    }
    res.sendFile(filePath);
  });

  // Genuine Bootable Pendrive Helper Script Generator
  app.post('/api/bootable-script', (req, res) => {
    const hostOs = String(req.body?.hostOs || 'windows');
    const scheme = String(req.body?.scheme || 'GPT');
    const usbLabel = String(req.body?.usbLabel || 'WIN18_ULTRA')
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 16) || 'WIN18_ULTRA';

    const db = readDatabase();
    const isoItem = db.downloads.find((d) => d.id === 'iso-x64');
    const isoFilename = isoItem?.filename || 'Windows-18-Ultra-v1.0-x64.iso';
    const expectedHash = isoItem?.sha256 || 'CHECK_OFFICIAL_SHA256_MANIFEST_BEFORE_FLASHING';

    if (hostOs === 'windows') {
      const ps1 = [
        '# Windows 18 Ultra - Bootable Pendrive Verification & Rufus Preparation Script',
        '# Generated by Windows 18 Ultra Official Setup Wizard',
        `$IsoPath = Read-Host "Enter full path to ${isoFilename}"`,
        'if (!(Test-Path $IsoPath)) { Write-Error "ISO file not found."; exit 1 }',
        `$ExpectedHash = "${expectedHash}"`,
        '$ActualHash = (Get-FileHash -Path $IsoPath -Algorithm SHA256).Hash.ToLower()',
        'Write-Host "Computed SHA-256: $ActualHash"',
        'if ($ExpectedHash -ne "CHECK_OFFICIAL_SHA256_MANIFEST_BEFORE_FLASHING" -and $ActualHash -ne $ExpectedHash.ToLower()) {',
        '  Write-Error "CHECKSUM MISMATCH! Do not flash this ISO."; exit 1',
        '}',
        `Write-Host "Verified! Open Rufus -> Select Device -> Boot selection: $IsoPath -> Partition scheme: ${scheme} -> Volume label: ${usbLabel} -> START."`,
      ].join('\r\n');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="prepare-win18-ultra-usb.ps1"');
      res.send(ps1);
      return;
    }

    const sh = [
      '#!/usr/bin/env bash',
      '# Windows 18 Ultra - Bootable Pendrive Verification & Flashing Helper',
      `ISO_FILE="\${1:-${isoFilename}}"`,
      `EXPECTED_HASH="${expectedHash}"`,
      `USB_LABEL="${usbLabel}"`,
      `SCHEME="${scheme}"`,
      '',
      'if [ ! -f "$ISO_FILE" ]; then',
      '  echo "Usage: $0 /path/to/Windows-18-Ultra.iso"',
      '  exit 1',
      'fi',
      '',
      'echo "Verifying SHA-256 checksum..."',
      'if command -v sha256sum >/dev/null 2>&1; then',
      '  ACTUAL_HASH=$(sha256sum "$ISO_FILE" | awk \'{print $1}\')',
      'else',
      '  ACTUAL_HASH=$(shasum -a 256 "$ISO_FILE" | awk \'{print $1}\')',
      'fi',
      'echo "Computed SHA-256: $ACTUAL_HASH"',
      '',
      'if [ "$EXPECTED_HASH" != "CHECK_OFFICIAL_SHA256_MANIFEST_BEFORE_FLASHING" ] && [ "$ACTUAL_HASH" != "$EXPECTED_HASH" ]; then',
      '  echo "ERROR: Checksum mismatch! Aborting."',
      '  exit 1',
      'fi',
      '',
      'echo "Checksum verified. Target Partition Scheme: $SCHEME | Label: $USB_LABEL"',
      'echo "List drives with: lsblk (Linux) or diskutil list (macOS)"',
      'echo "Flash safely using Ventoy or: sudo dd if=\"$ISO_FILE\" of=/dev/sdX bs=4M status=progress oflag=sync"',
    ].join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="prepare-win18-ultra-usb.sh"');
    res.send(sh);
  });

  // Support Contact Form with validation & spam protection
  app.post('/api/support', supportLimiter, (req, res) => {
    const { name, email, topic, message, website, mathAnswer, mathExpected } = req.body || {};

    // Honeypot spam trap
    if (website && String(website).trim().length > 0) {
      res.status(400).json({ error: 'Spam protection triggered.' });
      return;
    }

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanTopic = String(topic || '').trim();
    const cleanMessage = String(message || '').trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      res.status(400).json({ error: 'Please enter your name (2 to 80 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!cleanTopic) {
      res.status(400).json({ error: 'Please select a support topic.' });
      return;
    }
    if (cleanMessage.length < 15 || cleanMessage.length > 2000) {
      res.status(400).json({ error: 'Please describe your issue in 15 to 2000 characters.' });
      return;
    }
    if (Number(mathAnswer) !== Number(mathExpected) || Number.isNaN(Number(mathAnswer))) {
      res.status(400).json({ error: 'Verification answer is incorrect. Please check the anti-spam question.' });
      return;
    }

    const db = readDatabase();
    const entry: SupportMessage = {
      id: `sup-${crypto.randomUUID().slice(0, 8)}`,
      name: cleanName,
      email: cleanEmail,
      topic: cleanTopic,
      message: cleanMessage,
      status: 'new',
      adminNote: '',
      createdAt: new Date().toISOString(),
    };
    db.supportMessages.unshift(entry);
    writeDatabase(db);

    res.status(201).json({
      success: true,
      ticketId: entry.id,
      message: 'Your support request has been logged. Our team will review it shortly.',
    });
  });

  // --- Admin Auth & Protected Dashboard API ---
  app.post('/api/admin/login', loginLimiter, (req, res) => {
    const username = String(req.body?.username || '');
    const password = String(req.body?.password || '');

    const user = verifyAdminPassword(username, password);
    const db = readDatabase();

    if (!user) {
      db.auditLogs.unshift(
        appendAudit(username || 'unknown', 'anonymous', 'LOGIN_FAILED', 'admin_portal', 'Invalid username or password'),
      );
      db.auditLogs = db.auditLogs.slice(0, 200);
      writeDatabase(db);
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = createSessionToken(user);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8,
    });

    db.auditLogs.unshift(
      appendAudit(user.username, user.role, 'LOGIN_SUCCESS', 'admin_portal', 'Signed into administrator console'),
    );
    db.auditLogs = db.auditLogs.slice(0, 200);
    writeDatabase(db);

    res.json({ user });
  });

  app.post('/api/admin/logout', (req: AuthenticatedRequest, res) => {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;
    const user = verifySessionToken(token);
    if (user) {
      const db = readDatabase();
      db.auditLogs.unshift(appendAudit(user.username, user.role, 'LOGOUT', 'admin_portal', 'Signed out'));
      db.auditLogs = db.auditLogs.slice(0, 200);
      writeDatabase(db);
    }
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });

  app.get('/api/admin/me', (req, res) => {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;
    const user = verifySessionToken(token);
    if (!user) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, user });
  });

  app.use('/api/admin', adminApiLimiter);

  app.get('/api/admin/overview', requireAdmin, (req: AuthenticatedRequest, res) => {
    const db = readDatabase();
    res.json({
      user: req.adminUser,
      downloads: db.downloads,
      releases: db.releases,
      storeApps: db.storeApps,
      supportMessages: db.supportMessages,
      auditLogs: db.auditLogs,
      downloadEvents: db.downloadEvents,
      siteContent: db.siteContent,
    });
  });

  // Upload real ISO / VM / Checksum / PDF file
  app.post(
    '/api/admin/downloads/:id/upload',
    requireAdmin,
    requireRole(['super_admin', 'release_manager']),
    (req: AuthenticatedRequest, res) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          res.status(400).json({ error: err.message || 'File upload failed.' });
          return;
        }
        if (!req.file) {
          res.status(400).json({ error: 'Please select a file to upload.' });
          return;
        }

        const db = readDatabase();
        const item = db.downloads.find((d) => d.id === req.params.id);
        if (!item) {
          fs.unlinkSync(req.file.path);
          res.status(404).json({ error: 'Download slot not found.' });
          return;
        }

        const versionInput = String(req.body?.version || item.version).trim();
        const sha256 = computeFileSha256(req.file.path);

        item.filename = req.file.filename;
        item.externalUrl = null;
        item.fileSizeBytes = req.file.size;
        item.fileSizeLabel = formatBytes(req.file.size);
        item.version = versionInput || item.version;
        item.releaseDate = new Date().toISOString().split('T')[0];
        item.status = 'available';
        item.sha256 = sha256;

        rebuildChecksumManifest(db);
        db.auditLogs.unshift(
          appendAudit(
            req.adminUser!.username,
            req.adminUser!.role,
            'FILE_UPLOADED',
            item.title,
            `Uploaded ${req.file.originalname} (${item.fileSizeLabel}), SHA-256: ${sha256.slice(0, 16)}...`,
          ),
        );
        db.auditLogs = db.auditLogs.slice(0, 200);
        writeDatabase(db);

        res.json({ item, downloads: db.downloads });
      });
    },
  );

  // Update download metadata / external CDN link / status
  app.patch(
    '/api/admin/downloads/:id',
    requireAdmin,
    requireRole(['super_admin', 'release_manager']),
    (req: AuthenticatedRequest, res) => {
      const db = readDatabase();
      const item = db.downloads.find((d) => d.id === req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Download slot not found.' });
        return;
      }

      const { version, externalUrl, status, fileSizeLabel, sha256, minRequirements, recRequirements } =
        req.body || {};

      if (version) item.version = String(version).trim();
      if (minRequirements) item.minRequirements = String(minRequirements).trim();
      if (recRequirements) item.recRequirements = String(recRequirements).trim();

      if (status === 'coming_soon') {
        item.status = 'coming_soon';
        item.externalUrl = null;
        item.filename = null;
        item.fileSizeBytes = null;
        item.fileSizeLabel = 'Coming Soon';
        item.sha256 = null;
        item.releaseDate = 'Awaiting verified upload';
      } else if (externalUrl && String(externalUrl).trim()) {
        const cleanUrl = String(externalUrl).trim();
        if (!/^https?:\/\/.+/.test(cleanUrl)) {
          res.status(400).json({ error: 'External download URL must begin with http:// or https://' });
          return;
        }
        item.externalUrl = cleanUrl;
        item.filename = null;
        item.status = 'available';
        item.releaseDate = new Date().toISOString().split('T')[0];
        if (fileSizeLabel) item.fileSizeLabel = String(fileSizeLabel).trim();
        if (sha256) item.sha256 = String(sha256).trim();
      }

      rebuildChecksumManifest(db);
      db.auditLogs.unshift(
        appendAudit(
          req.adminUser!.username,
          req.adminUser!.role,
          'DOWNLOAD_UPDATED',
          item.title,
          `Status: ${item.status}, Version: ${item.version}`,
        ),
      );
      db.auditLogs = db.auditLogs.slice(0, 200);
      writeDatabase(db);

      res.json({ item, downloads: db.downloads });
    },
  );

  // Publish new genuine release
  app.post(
    '/api/admin/releases',
    requireAdmin,
    requireRole(['super_admin', 'release_manager']),
    (req: AuthenticatedRequest, res) => {
      const { version, codename, summary, newFeatures, securityUpdates, bugFixes } = req.body || {};
      if (!version || !summary) {
        res.status(400).json({ error: 'Version and summary are required.' });
        return;
      }

      const db = readDatabase();
      for (const rel of db.releases) {
        rel.isLatest = false;
      }

      const newRelease: ReleaseEntry = {
        id: `rel-${Date.now()}`,
        version: String(version).trim(),
        codename: String(codename || 'Prism').trim(),
        releaseDate: new Date().toISOString().split('T')[0],
        isLatest: true,
        summary: String(summary).trim(),
        newFeatures: Array.isArray(newFeatures) ? newFeatures.filter(Boolean) : [],
        securityUpdates: Array.isArray(securityUpdates) ? securityUpdates.filter(Boolean) : [],
        bugFixes: Array.isArray(bugFixes) ? bugFixes.filter(Boolean) : [],
      };

      db.releases.unshift(newRelease);
      rebuildReleaseNotesFile(db);
      rebuildChecksumManifest(db);

      db.auditLogs.unshift(
        appendAudit(
          req.adminUser!.username,
          req.adminUser!.role,
          'RELEASE_PUBLISHED',
          `v${newRelease.version}`,
          `Published release ${newRelease.version} (${newRelease.codename})`,
        ),
      );
      db.auditLogs = db.auditLogs.slice(0, 200);
      writeDatabase(db);

      res.status(201).json({ release: newRelease, releases: db.releases });
    },
  );

  // Ultra Store CRUD
  app.post(
    '/api/admin/store',
    requireAdmin,
    requireRole(['super_admin', 'release_manager']),
    (req: AuthenticatedRequest, res) => {
      const body = req.body || {};
      if (!body.name || !body.description || !body.category) {
        res.status(400).json({ error: 'App name, category, and description are required.' });
        return;
      }
      const db = readDatabase();
      const newApp: StoreApp = {
        id: `app-${Date.now()}`,
        name: String(body.name).trim(),
        developer: String(body.developer || 'Community').trim(),
        category: body.category,
        compatibility: body.compatibility || 'x86-64 Native',
        version: String(body.version || '1.0').trim(),
        sizeLabel: String(body.sizeLabel || '120 MB').trim(),
        featured: Boolean(body.featured),
        isDefaultBundle: Boolean(body.isDefaultBundle),
        description: String(body.description).trim(),
        installInstructions: String(body.installInstructions || 'Install via Ultra Store').trim(),
        packageCommand: String(body.packageCommand || `ultra-pkg install ${String(body.name).toLowerCase().replace(/\s+/g, '-')}`).trim(),
        accentColor: String(body.accentColor || '#38bdf8'),
      };
      db.storeApps.unshift(newApp);
      db.auditLogs.unshift(
        appendAudit(req.adminUser!.username, req.adminUser!.role, 'STORE_APP_ADDED', newApp.name, newApp.category),
      );
      writeDatabase(db);
      res.status(201).json({ app: newApp, storeApps: db.storeApps });
    },
  );

  app.delete(
    '/api/admin/store/:id',
    requireAdmin,
    requireRole(['super_admin']),
    (req: AuthenticatedRequest, res) => {
      const db = readDatabase();
      const target = db.storeApps.find((a) => a.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'App not found.' });
        return;
      }
      db.storeApps = db.storeApps.filter((a) => a.id !== req.params.id);
      db.auditLogs.unshift(
        appendAudit(req.adminUser!.username, req.adminUser!.role, 'STORE_APP_REMOVED', target.name, 'Deleted listing'),
      );
      writeDatabase(db);
      res.json({ storeApps: db.storeApps });
    },
  );

  // Support ticket update
  app.patch(
    '/api/admin/support/:id',
    requireAdmin,
    requireRole(['super_admin', 'release_manager']),
    (req: AuthenticatedRequest, res) => {
      const db = readDatabase();
      const ticket = db.supportMessages.find((m) => m.id === req.params.id);
      if (!ticket) {
        res.status(404).json({ error: 'Support ticket not found.' });
        return;
      }
      if (req.body?.status && ['new', 'in_review', 'resolved'].includes(req.body.status)) {
        ticket.status = req.body.status;
      }
      if (typeof req.body?.adminNote === 'string') {
        ticket.adminNote = req.body.adminNote.trim();
      }
      db.auditLogs.unshift(
        appendAudit(req.adminUser!.username, req.adminUser!.role, 'SUPPORT_UPDATED', ticket.id, `Status -> ${ticket.status}`),
      );
      writeDatabase(db);
      res.json({ ticket, supportMessages: db.supportMessages });
    },
  );

  // Update website content
  app.put(
    '/api/admin/content',
    requireAdmin,
    requireRole(['super_admin']),
    (req: AuthenticatedRequest, res) => {
      const db = readDatabase();
      const allowedKeys = [
        'heroTitle',
        'heroTagline',
        'heroDescription',
        'announcement',
        'developerName',
        'developerTitle',
        'developerBio',
        'projectVision',
      ] as const;

      for (const key of allowedKeys) {
        if (typeof req.body?.[key] === 'string' && req.body[key].trim().length > 0) {
          db.siteContent[key] = req.body[key].trim();
        }
      }

      db.auditLogs.unshift(
        appendAudit(req.adminUser!.username, req.adminUser!.role, 'CONTENT_UPDATED', 'site_content', 'Updated portal copy'),
      );
      writeDatabase(db);
      res.json({ siteContent: db.siteContent });
    },
  );

  // --- Vite / Static Frontend Serving ---
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Windows 18 Ultra server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Windows 18 Ultra server:', err);
  process.exit(1);
});
