import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  AuditLog,
  DownloadEvent,
  DownloadItem,
  ReleaseEntry,
  SiteContent,
  StoreApp,
  SupportMessage,
} from '../src/types.ts';

export interface DatabaseSchema {
  downloads: DownloadItem[];
  releases: ReleaseEntry[];
  storeApps: StoreApp[];
  supportMessages: SupportMessage[];
  auditLogs: AuditLog[];
  downloadEvents: DownloadEvent[];
  siteContent: SiteContent;
}

const ROOT_DIR = process.cwd();
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function computeFileSha256(filePath: string): string {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes <= 0) return 'Pending release';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Generates a valid, standards-compliant PDF 1.4 document with real readable text
 * containing the Windows 18 Ultra 12-Step Installation Guide and VirtualBox Tutorial.
 */
function buildInstallationGuidePdf(): Buffer {
  const lines = [
    'WINDOWS 18 ULTRA - OFFICIAL INSTALLATION GUIDE (VERSION 1.0)',
    'Developed by MR. ANSH RAJ | Architecture: x86-64 (64-bit)',
    '------------------------------------------------------------------------',
    '1. SYSTEM REQUIREMENTS (RECOMMENDED)',
    '   - Processor: x86-64 compatible 64-bit CPU (4+ cores recommended)',
    '   - Memory: 8 GB RAM recommended (4 GB minimum baseline)',
    '   - Storage: 40 GB available SSD/NVMe space recommended',
    '   - Graphics: DirectX / Vulkan compatible display adapter',
    '   - Firmware: UEFI with Secure Boot support recommended',
    '   - Network: Internet connection required for Ultra Store & updates',
    '',
    '2. 12-STEP INSTALLATION WORKFLOW',
    '   Step 01: Download the verified Windows 18 Ultra 64-bit ISO.',
    '   Step 02: Verify the SHA-256 checksum against the official manifest.',
    '   Step 03: Create a bootable USB drive using Rufus (Windows) or Ventoy/dd.',
    '   Step 04: Back up all important personal files before modifying partitions.',
    '   Step 05: Restart and enter your firmware Boot Menu (F12, F11, F8, or Del).',
    '   Step 06: Select the UEFI USB bootable pendrive entry.',
    '   Step 07: Launch the Windows 18 Ultra Setup Wizard.',
    '   Step 08: Select your display language, region, and keyboard layout.',
    '   Step 09: Configure disk partitioning (WARNING: formatting erases data).',
    '   Step 10: Create your primary user account and configure System Lock PIN.',
    '   Step 11: Complete initial Threat Protection & Default App bundle setup.',
    '   Step 12: Restart, witness Stage 1 (Concept) -> Stage 2 (Welcome), enjoy!',
    '',
    '3. VIRTUALBOX INSTALLATION TUTORIAL',
    '   - Create New VM: Type Linux/Other 64-bit, assign 8192 MB RAM, 40 GB VDI.',
    '   - Enable EFI (Special OSes only) under System -> Motherboard.',
    '   - Attach the Windows 18 Ultra ISO under Storage -> Optical Drive.',
    '   - Start the VM, verify checksum if prompted, and complete the Wizard.',
    '',
    'DATA LOSS WARNING: Formatting a target drive permanently deletes existing',
    'partitions and files. Always verify your target disk index before proceeding.',
  ];

  const escapePdf = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  let contentStream = 'BT\n/F1 10 Tf\n50 760 Td\n14 TL\n';
  for (const line of lines) {
    contentStream += `(${escapePdf(line)}) Tj\nT*\n`;
  }
  contentStream += 'ET\n';

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}endstream\nendobj\n`,
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n',
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

function buildReleaseNotesText(releases: ReleaseEntry[]): string {
  return releases
    .map((rel) => {
      return [
        `====================================================================`,
        `WINDOWS 18 ULTRA - RELEASE NOTES (v${rel.version} - ${rel.codename})`,
        `Release Date: ${rel.releaseDate}`,
        `Developer: MR. ANSH RAJ`,
        `====================================================================`,
        ``,
        rel.summary,
        ``,
        `NEW FEATURES:`,
        ...rel.newFeatures.map((f) => `  * ${f}`),
        ``,
        `SECURITY UPDATES:`,
        ...rel.securityUpdates.map((s) => `  * ${s}`),
        ``,
        `BUG FIXES & IMPROVEMENTS:`,
        ...rel.bugFixes.map((b) => `  * ${b}`),
        ``,
      ].join('\n');
    })
    .join('\n');
}

export function rebuildChecksumManifest(db: DatabaseSchema) {
  ensureDirectories();
  const lines: string[] = [
    '# Windows 18 Ultra - Official SHA-256 Verification Manifest',
    `# Generated: ${new Date().toISOString()}`,
    '# Verify on Linux/macOS: sha256sum -c Windows-18-Ultra-v1.0.sha256',
    '# Verify on Windows PowerShell: Get-FileHash <filename> -Algorithm SHA256',
    '',
  ];

  for (const item of db.downloads) {
    if (item.id === 'checksum-sha256') continue;
    if (item.status === 'available' && item.filename) {
      const targetPath = path.join(UPLOADS_DIR, item.filename);
      if (fs.existsSync(targetPath)) {
        const hash = computeFileSha256(targetPath);
        item.sha256 = hash;
        item.fileSizeBytes = fs.statSync(targetPath).size;
        item.fileSizeLabel = formatBytes(item.fileSizeBytes);
        lines.push(`${hash}  ${item.filename}`);
      }
    }
  }

  const checksumFilename = 'Windows-18-Ultra-v1.0.sha256';
  const checksumPath = path.join(UPLOADS_DIR, checksumFilename);
  fs.writeFileSync(checksumPath, lines.join('\n') + '\n', 'utf8');

  const checksumEntry = db.downloads.find((d) => d.id === 'checksum-sha256');
  if (checksumEntry) {
    checksumEntry.filename = checksumFilename;
    checksumEntry.status = 'available';
    checksumEntry.fileSizeBytes = fs.statSync(checksumPath).size;
    checksumEntry.fileSizeLabel = formatBytes(checksumEntry.fileSizeBytes);
    checksumEntry.sha256 = computeFileSha256(checksumPath);
  }
}

export function rebuildReleaseNotesFile(db: DatabaseSchema) {
  ensureDirectories();
  const notesFilename = 'Windows-18-Ultra-v1.0-Release-Notes.txt';
  const notesPath = path.join(UPLOADS_DIR, notesFilename);
  fs.writeFileSync(notesPath, buildReleaseNotesText(db.releases), 'utf8');

  const notesEntry = db.downloads.find((d) => d.id === 'release-notes');
  if (notesEntry) {
    notesEntry.filename = notesFilename;
    notesEntry.status = 'available';
    notesEntry.fileSizeBytes = fs.statSync(notesPath).size;
    notesEntry.fileSizeLabel = formatBytes(notesEntry.fileSizeBytes);
    notesEntry.sha256 = computeFileSha256(notesPath);
  }
}

function createInitialDatabase(): DatabaseSchema {
  ensureDirectories();

  const pdfFilename = 'Windows-18-Ultra-Installation-Guide-v1.0.pdf';
  const pdfPath = path.join(UPLOADS_DIR, pdfFilename);
  fs.writeFileSync(pdfPath, buildInstallationGuidePdf());
  const pdfStat = fs.statSync(pdfPath);

  const initialReleases: ReleaseEntry[] = [
    {
      id: 'rel-1-0',
      version: '1.0',
      codename: 'Prism Bloom',
      releaseDate: '2026-11-13',
      isLatest: true,
      summary:
        'Initial Version 1.0 portal & documentation release for Windows 18 Ultra by MR. ANSH RAJ. Includes the 12-step installation specification, Ultra Store package catalog, Rainbow Prism desktop shell architecture, and SHA-256 verification tooling.',
      newFeatures: [
        'Rainbow Prism Glassmorphism Desktop & Windows 11-inspired centered Start Menu',
        'Two-stage boot experience: Stage 1 Concept reveal followed by Stage 2 Welcome workspace',
        'Integrated Threat Protection center & System Lock PIN/BitLocker setup wizard',
        'Pre-configured Kali Linux, Ubuntu 24.04 LTS, and Vulkan/Proton Gaming software profiles',
        'Ultra Browser, Ultra Explorer, Ultra Cyber Lab, and Ultra Store marketplace architecture',
      ],
      securityUpdates: [
        'Mandatory SHA-256 integrity manifest generation for all published binaries',
        'Default System Lock policy with configurable idle timeout and kernel isolation',
        'Threat Protection firewall & sandbox profile for educational cybersecurity labs',
      ],
      bugFixes: [
        'Finalized UEFI/GPT bootable pendrive provisioning scripts for Windows, Linux, and macOS hosts',
        'Verified VirtualBox EFI boot configuration documentation',
      ],
    },
  ];

  const initialDownloads: DownloadItem[] = [
    {
      id: 'iso-x64',
      title: 'Windows 18 Ultra ISO (64-bit)',
      subtitle: 'Primary UEFI bootable desktop installation image',
      category: 'iso',
      version: '1.0',
      fileSizeBytes: null,
      fileSizeLabel: 'Coming Soon',
      releaseDate: 'Awaiting verified ISO upload',
      minRequirements: 'x86-64 CPU · 4 GB RAM · 25 GB Storage',
      recRequirements: 'x86-64 4-Core CPU · 8 GB RAM · 40 GB SSD · UEFI',
      status: 'coming_soon',
      filename: null,
      externalUrl: null,
      sha256: null,
      downloadCount: 0,
    },
    {
      id: 'virtualbox-ova',
      title: 'VirtualBox Edition',
      subtitle: 'Pre-configured .ova virtual appliance for VirtualBox 7+',
      category: 'vm',
      version: '1.0',
      fileSizeBytes: null,
      fileSizeLabel: 'Coming Soon',
      releaseDate: 'Awaiting verified VM upload',
      minRequirements: 'VirtualBox 7.0+ · 4 GB Guest RAM · EFI Enabled',
      recRequirements: 'VirtualBox 7.0+ · 8 GB Guest RAM · 40 GB Dynamic VDI',
      status: 'coming_soon',
      filename: null,
      externalUrl: null,
      sha256: null,
      downloadCount: 0,
    },
    {
      id: 'vmware-edition',
      title: 'VMware Edition',
      subtitle: 'Workstation Pro & Player image archive',
      category: 'vm',
      version: '1.0',
      fileSizeBytes: null,
      fileSizeLabel: 'Coming Soon',
      releaseDate: 'Awaiting verified VM upload',
      minRequirements: 'VMware Workstation 17+ · 4 GB Guest RAM',
      recRequirements: 'VMware Workstation 17+ · 8 GB Guest RAM · 3D Acceleration',
      status: 'coming_soon',
      filename: null,
      externalUrl: null,
      sha256: null,
      downloadCount: 0,
    },
    {
      id: 'install-guide-pdf',
      title: 'Installation Guide PDF',
      subtitle: 'Complete 12-step physical & VirtualBox setup manual',
      category: 'docs',
      version: '1.0',
      fileSizeBytes: pdfStat.size,
      fileSizeLabel: formatBytes(pdfStat.size),
      releaseDate: '2026-11-13',
      minRequirements: 'Any PDF reader · No special hardware required',
      recRequirements: 'Includes disk backup warnings & UEFI boot keys',
      status: 'available',
      filename: pdfFilename,
      externalUrl: null,
      sha256: computeFileSha256(pdfPath),
      downloadCount: 0,
    },
    {
      id: 'checksum-sha256',
      title: 'SHA-256 Checksum File',
      subtitle: 'Cryptographic manifest for verifying official downloads',
      category: 'checksum',
      version: '1.0',
      fileSizeBytes: 0,
      fileSizeLabel: '0 B',
      releaseDate: '2026-11-13',
      minRequirements: 'sha256sum, shasum, or PowerShell Get-FileHash',
      recRequirements: 'Always verify hashes before flashing a USB drive',
      status: 'available',
      filename: 'Windows-18-Ultra-v1.0.sha256',
      externalUrl: null,
      sha256: null,
      downloadCount: 0,
    },
    {
      id: 'release-notes',
      title: 'Release Notes',
      subtitle: 'Published changelog, security advisories, and known notes',
      category: 'notes',
      version: '1.0',
      fileSizeBytes: 0,
      fileSizeLabel: '0 B',
      releaseDate: '2026-11-13',
      minRequirements: 'Plain text / UTF-8 viewer',
      recRequirements: 'Synced with Version 1.0 release registry',
      status: 'available',
      filename: 'Windows-18-Ultra-v1.0-Release-Notes.txt',
      externalUrl: null,
      sha256: null,
      downloadCount: 0,
    },
  ];

  const initialApps: StoreApp[] = [
    {
      id: 'app-kali-linux',
      name: 'Kali Linux Subsystem',
      developer: 'Offensive Security / Ultra WSL',
      category: 'Security & Linux',
      compatibility: 'WSL / Container',
      version: '2026.3',
      sizeLabel: '1.4 GB',
      featured: true,
      isDefaultBundle: true,
      description:
        'Integrated Kali Linux penetration-testing environment pre-wired into Windows 18 Ultra for authorized security auditing, forensics, and educational lab exercises.',
      installInstructions:
        'Included in the OS Setup Wizard default bundle or install anytime via Ultra Terminal.',
      packageCommand: 'ultra-pkg install kali-linux-rolling',
      accentColor: '#38bdf8',
    },
    {
      id: 'app-ubuntu-lts',
      name: 'Ubuntu 24.04 LTS',
      developer: 'Canonical / Ultra Subsystem',
      category: 'Security & Linux',
      compatibility: 'WSL / Container',
      version: '24.04.1',
      sizeLabel: '920 MB',
      featured: true,
      isDefaultBundle: true,
      description:
        'Full Ubuntu Linux userland with apt, Docker support, Python, and GCC toolchains running seamlessly alongside Ultra Explorer.',
      installInstructions:
        'Select during the OS Setup Wizard or launch directly from the Ultra Start Menu.',
      packageCommand: 'ultra-pkg install ubuntu-24.04-lts',
      accentColor: '#f97316',
    },
    {
      id: 'app-steam-proton',
      name: 'Steam & Proton Gaming Suite',
      developer: 'Valve / Ultra Vulkan Layer',
      category: 'Gaming',
      compatibility: 'Vulkan / Proton',
      version: '9.0-Ultra',
      sizeLabel: '640 MB',
      featured: true,
      isDefaultBundle: true,
      description:
        'Complete PC gaming runtime featuring Steam client integration, Proton compatibility layers, and low-latency Vulkan shaders.',
      installInstructions:
        'Pre-selected in the Gaming Software profile inside the Windows 18 Ultra Setup Wizard.',
      packageCommand: 'ultra-pkg install steam-proton-suite',
      accentColor: '#6366f1',
    },
    {
      id: 'app-lutris-heroic',
      name: 'Lutris & Heroic Launcher',
      developer: 'Open Gaming Alliance',
      category: 'Gaming',
      compatibility: 'Vulkan / Proton',
      version: '5.18',
      sizeLabel: '215 MB',
      featured: false,
      isDefaultBundle: true,
      description:
        'Unified launcher for Epic, GOG, and local PC titles with Wine-GE runners and per-game GPU tuning.',
      installInstructions:
        'Install from Ultra Store Gaming category or toggle inside Default Gaming Apps.',
      packageCommand: 'ultra-pkg install lutris-heroic-bundle',
      accentColor: '#ec4899',
    },
    {
      id: 'app-obs-mangohud',
      name: 'OBS Studio & MangoHud',
      developer: 'OBS Project / FlightlessMango',
      category: 'Gaming',
      compatibility: 'x86-64 Native',
      version: '31.0',
      sizeLabel: '185 MB',
      featured: false,
      isDefaultBundle: true,
      description:
        'Hardware-accelerated game capture, live streaming, and real-time frame-time overlay monitoring.',
      installInstructions:
        'Available automatically when Gaming Software pack is enabled.',
      packageCommand: 'ultra-pkg install obs-mangohud',
      accentColor: '#10b981',
    },
    {
      id: 'app-cyber-lab',
      name: 'Ultra Cyber Lab',
      developer: 'MR. ANSH RAJ',
      category: 'Security & Linux',
      compatibility: 'x86-64 Native',
      version: '1.0',
      sizeLabel: '310 MB',
      featured: true,
      isDefaultBundle: true,
      description:
        'Interactive sandboxed cybersecurity workbench with packet inspection, port mapping, and Threat Protection rule testing.',
      installInstructions:
        'Built into Windows 18 Ultra core system utilities and pinned to the Start Menu.',
      packageCommand: 'ultra-pkg install ultra-cyber-lab',
      accentColor: '#06b6d4',
    },
    {
      id: 'app-ultra-browser',
      name: 'Ultra Browser',
      developer: 'MR. ANSH RAJ',
      category: 'System & Web',
      compatibility: 'x86-64 Native',
      version: '1.0',
      sizeLabel: '140 MB',
      featured: true,
      isDefaultBundle: true,
      description:
        'Privacy-hardened, hardware-accelerated desktop browser featuring tracker isolation and rainbow glass tab groups.',
      installInstructions: 'Pre-installed as the default web browser on Windows 18 Ultra.',
      packageCommand: 'ultra-pkg install ultra-browser',
      accentColor: '#3b82f6',
    },
    {
      id: 'app-vscode',
      name: 'VS Code Ultra Edition',
      developer: 'Microsoft / Open Source',
      category: 'Development',
      compatibility: 'x86-64 Native',
      version: '1.96',
      sizeLabel: '245 MB',
      featured: false,
      isDefaultBundle: false,
      description:
        'Lightweight code editor pre-configured with TypeScript, Python, C++, and WSL remote container integration.',
      installInstructions: 'Install in one click from Ultra Store Development category.',
      packageCommand: 'ultra-pkg install vscode-ultra',
      accentColor: '#0ea5e9',
    },
    {
      id: 'app-wireshark-nmap',
      name: 'Wireshark & Nmap GUI',
      developer: 'Wireshark Foundation',
      category: 'Security & Linux',
      compatibility: 'x86-64 Native',
      version: '4.4',
      sizeLabel: '165 MB',
      featured: false,
      isDefaultBundle: true,
      description:
        'Deep protocol analyzer and network discovery toolkit for educational diagnostics and lab troubleshooting.',
      installInstructions: 'Bundled under Security & Network Diagnostics in Ultra Store.',
      packageCommand: 'ultra-pkg install wireshark-nmap',
      accentColor: '#8b5cf6',
    },
    {
      id: 'app-blender-studio',
      name: 'Blender & GIMP Studio',
      developer: 'Blender Foundation / GIMP',
      category: 'Creative',
      compatibility: 'x86-64 Native',
      version: '4.3',
      sizeLabel: '480 MB',
      featured: false,
      isDefaultBundle: false,
      description:
        '3D modeling, Cycles GPU rendering, and raster image editing suite tuned for Ultra Graphics.',
      installInstructions: 'Install from Ultra Store Creative category.',
      packageCommand: 'ultra-pkg install blender-gimp-studio',
      accentColor: '#f59e0b',
    },
  ];

  const db: DatabaseSchema = {
    downloads: initialDownloads,
    releases: initialReleases,
    storeApps: initialApps,
    supportMessages: [],
    auditLogs: [
      {
        id: 'audit-init',
        actor: 'system',
        role: 'super_admin',
        action: 'PORTAL_INITIALIZED',
        target: 'Windows 18 Ultra v1.0',
        details:
          'Initialized database with genuine PDF Installation Guide, Release Notes, and SHA-256 manifest. ISO & VM binaries remain Coming Soon until uploaded by Admin.',
        timestamp: new Date().toISOString(),
      },
    ],
    downloadEvents: [],
    siteContent: {
      heroTitle: 'WINDOWS 18 ULTRA',
      heroTagline: 'The Next Generation of Personal Computing.',
      heroDescription:
        'Experience a modern desktop operating system designed for productivity, programming, entertainment, and educational cybersecurity.',
      announcement:
        'Version 1.0 Documentation & Checksum Manifest live · Full 64-bit ISO status: Coming Soon until verified upload',
      developerName: 'MR. ANSH RAJ',
      developerTitle: 'Creator & Lead Systems Architect',
      developerBio:
        'Windows 18 Ultra is an independent operating-system development project focused on creating a modern, accessible, and powerful desktop computing experience.',
      projectVision:
        'To unite Windows-inspired glassmorphic clarity, prismatic rainbow aesthetics, integrated Linux subsystems (Kali & Ubuntu), native gaming layers, and transparent security tooling into one cohesive desktop environment.',
    },
  };

  rebuildReleaseNotesFile(db);
  rebuildChecksumManifest(db);
  writeDatabase(db);
  return db;
}

export function readDatabase(): DatabaseSchema {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE)) {
    return createInitialDatabase();
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    return createInitialDatabase();
  }
}

export function writeDatabase(db: DatabaseSchema) {
  ensureDirectories();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}
