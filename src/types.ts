export type DownloadStatus = 'available' | 'coming_soon';

export interface DownloadItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'iso' | 'vm' | 'docs' | 'checksum' | 'notes';
  version: string;
  fileSizeBytes: number | null;
  fileSizeLabel: string;
  releaseDate: string;
  minRequirements: string;
  recRequirements: string;
  status: DownloadStatus;
  filename: string | null;
  externalUrl: string | null;
  sha256: string | null;
  downloadCount: number;
}

export interface ReleaseEntry {
  id: string;
  version: string;
  codename: string;
  releaseDate: string;
  isLatest: boolean;
  summary: string;
  newFeatures: string[];
  securityUpdates: string[];
  bugFixes: string[];
}

export interface StoreApp {
  id: string;
  name: string;
  developer: string;
  category: 'Security & Linux' | 'Gaming' | 'Development' | 'System & Web' | 'Creative';
  compatibility: 'x86-64 Native' | 'WSL / Container' | 'Vulkan / Proton' | 'Cross-Platform';
  version: string;
  sizeLabel: string;
  featured: boolean;
  isDefaultBundle: boolean;
  description: string;
  installInstructions: string;
  packageCommand: string;
  accentColor: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'new' | 'in_review' | 'resolved';
  adminNote: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface DownloadEvent {
  id: string;
  downloadId: string;
  title: string;
  timestamp: string;
}

export interface SiteContent {
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  announcement: string;
  developerName: string;
  developerTitle: string;
  developerBio: string;
  projectVision: string;
}

export interface BootstrapPayload {
  downloads: DownloadItem[];
  releases: ReleaseEntry[];
  storeApps: StoreApp[];
  siteContent: SiteContent;
}

export interface AdminSessionUser {
  username: string;
  role: 'super_admin' | 'release_manager';
}
