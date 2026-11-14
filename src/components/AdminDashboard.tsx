import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileUp,
  Lock,
  LogOut,
  MessageSquare,
  PackagePlus,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';
import type {
  AdminSessionUser,
  AuditLog,
  DownloadEvent,
  DownloadItem,
  ReleaseEntry,
  SiteContent,
  StoreApp,
  SupportMessage,
} from '../types';
import { Windows18Logo } from './RainbowBloomWallpaper';

interface AdminDashboardProps {
  onExit: () => void;
  onDataChanged: () => void;
}

interface AdminOverview {
  user: AdminSessionUser;
  downloads: DownloadItem[];
  releases: ReleaseEntry[];
  storeApps: StoreApp[];
  supportMessages: SupportMessage[];
  auditLogs: AuditLog[];
  downloadEvents: DownloadEvent[];
  siteContent: SiteContent;
}

type AdminTab = 'downloads' | 'releases' | 'store' | 'support' | 'content' | 'audit';

export function AdminDashboard({ onExit, onDataChanged }: AdminDashboardProps) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('downloads');
  const [statusNotice, setStatusNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // Upload & Download management state
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [externalUrls, setExternalUrls] = useState<Record<string, string>>({});

  // New Release form
  const [relVersion, setRelVersion] = useState('');
  const [relCodename, setRelCodename] = useState('');
  const [relSummary, setRelSummary] = useState('');
  const [relFeatures, setRelFeatures] = useState('');
  const [relSecurity, setRelSecurity] = useState('');
  const [relFixes, setRelFixes] = useState('');

  // New Store App form
  const [appName, setAppName] = useState('');
  const [appDeveloper, setAppDeveloper] = useState('');
  const [appCategory, setAppCategory] = useState<StoreApp['category']>('Security & Linux');
  const [appCompatibility, setAppCompatibility] =
    useState<StoreApp['compatibility']>('x86-64 Native');
  const [appVersion, setAppVersion] = useState('1.0');
  const [appSize, setAppSize] = useState('150 MB');
  const [appDescription, setAppDescription] = useState('');

  // Content editor
  const [contentForm, setContentForm] = useState<SiteContent | null>(null);

  const fetchOverview = async () => {
    const res = await fetch('/api/admin/overview');
    if (res.status === 401) {
      setUser(null);
      setOverview(null);
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as AdminOverview;
    setUser(data.user);
    setOverview(data);
    setContentForm(data.siteContent);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          await fetchOverview();
        }
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string; user?: AdminSessionUser };
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }
      setPassword('');
      await fetchOverview();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login error.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setUser(null);
    setOverview(null);
  };

  const handleFileUpload = async (downloadId: string, file: File) => {
    setErrorNotice('');
    setStatusNotice('');
    setUploadingId(downloadId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/admin/downloads/${downloadId}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setStatusNotice(`Uploaded ${file.name} and updated SHA-256 manifest.`);
      await fetchOverview();
      onDataChanged();
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSetExternalUrl = async (downloadId: string) => {
    const url = (externalUrls[downloadId] || '').trim();
    if (!url) return;
    setErrorNotice('');
    setStatusNotice('');
    const res = await fetch(`/api/admin/downloads/${downloadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ externalUrl: url }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErrorNotice(data.error || 'Could not update download link.');
      return;
    }
    setStatusNotice('Updated verified download link.');
    await fetchOverview();
    onDataChanged();
  };

  const handleMarkComingSoon = async (downloadId: string) => {
    const res = await fetch(`/api/admin/downloads/${downloadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'coming_soon' }),
    });
    if (res.ok) {
      setStatusNotice('Reset artifact status to Coming Soon.');
      await fetchOverview();
      onDataChanged();
    }
  };

  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');
    setStatusNotice('');
    const res = await fetch('/api/admin/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: relVersion,
        codename: relCodename,
        summary: relSummary,
        newFeatures: relFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
        securityUpdates: relSecurity.split('\n').map((s) => s.trim()).filter(Boolean),
        bugFixes: relFixes.split('\n').map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErrorNotice(data.error || 'Failed to publish release.');
      return;
    }
    setRelVersion('');
    setRelCodename('');
    setRelSummary('');
    setRelFeatures('');
    setRelSecurity('');
    setRelFixes('');
    setStatusNotice('Published new genuine release and updated Release Notes artifact.');
    await fetchOverview();
    onDataChanged();
  };

  const handleAddStoreApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');
    setStatusNotice('');
    const res = await fetch('/api/admin/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: appName,
        developer: appDeveloper,
        category: appCategory,
        compatibility: appCompatibility,
        version: appVersion,
        sizeLabel: appSize,
        description: appDescription,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErrorNotice(data.error || 'Could not add Ultra Store app.');
      return;
    }
    setAppName('');
    setAppDeveloper('');
    setAppDescription('');
    setStatusNotice('Added new application to Ultra Store.');
    await fetchOverview();
    onDataChanged();
  };

  const handleDeleteApp = async (id: string) => {
    const res = await fetch(`/api/admin/store/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setStatusNotice('Removed application from Ultra Store.');
      await fetchOverview();
      onDataChanged();
    }
  };

  const handleUpdateTicket = async (
    id: string,
    status: SupportMessage['status'],
    adminNote: string,
  ) => {
    const res = await fetch(`/api/admin/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote }),
    });
    if (res.ok) {
      setStatusNotice(`Updated support ticket ${id}.`);
      await fetchOverview();
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm) return;
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentForm),
    });
    if (res.ok) {
      setStatusNotice('Updated live website content.');
      await fetchOverview();
      onDataChanged();
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#060913]">
        <p className="text-sm font-mono text-slate-500">Verifying administrator session...</p>
      </div>
    );
  }

  if (!user || !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#060913]">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0c1222] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Windows18Logo className="w-7 h-7" />
              <span className="font-display font-bold text-lg text-slate-950 dark:text-white">
                Administrator Console
              </span>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Protected by server-side scrypt verification, HttpOnly signed session cookies, and
            rate limiting. Configure credentials via server environment variables.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Administrator Username
              </span>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm"
              />
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm"
              />
            </label>

            {loginError && <p className="text-xs text-rose-500 font-medium">{loginError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-950 dark:bg-sky-600 hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loggingIn ? 'Signing In...' : 'Sign In to Admin Console'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalDownloads = overview.downloads.reduce((acc, d) => acc + d.downloadCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100">
      <div className="h-[3px] w-full rainbow-border-line" />
      <header className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1e] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Windows18Logo className="w-7 h-7" />
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">
              Windows 18 Ultra · Admin Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Signed in as {user.username} · Role: {user.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222]">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Total Downloads</span>
            </div>
            <div className="text-2xl font-display font-bold mt-1 tabular-nums">{totalDownloads}</div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222]">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Published Releases</span>
            </div>
            <div className="text-2xl font-display font-bold mt-1 tabular-nums">
              {overview.releases.length}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222]">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Support Tickets</span>
            </div>
            <div className="text-2xl font-display font-bold mt-1 tabular-nums">
              {overview.supportMessages.length}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222]">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-fuchsia-500" />
              <span>Audit Events</span>
            </div>
            <div className="text-2xl font-display font-bold mt-1 tabular-nums">
              {overview.auditLogs.length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-fit">
          {(
            [
              ['downloads', 'ISO & Files'],
              ['releases', 'Releases'],
              ['store', 'Ultra Store'],
              ['support', 'Support Tickets'],
              ['content', 'Site Content'],
              ['audit', 'Audit Logs'],
            ] as Array<[AdminTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {statusNotice && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            {statusNotice}
          </div>
        )}
        {errorNotice && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {errorNotice}
          </div>
        )}

        {/* Tab 1: ISO & File Uploads */}
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            {overview.downloads.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-bold text-base">{item.title}</h3>
                    <span
                      className={`text-xs font-semibold ${
                        item.status === 'available' ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {item.status === 'available' ? 'Published' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    v{item.version} · {item.fileSizeLabel} · {item.downloadCount} downloads
                    {item.sha256 ? ` · SHA-256: ${item.sha256.slice(0, 18)}...` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>{uploadingId === item.id ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(item.id, f);
                      }}
                      className="sr-only"
                    />
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="https://cdn.example.com/file.iso"
                      value={externalUrls[item.id] || ''}
                      onChange={(e) =>
                        setExternalUrls((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-xs w-52"
                    />
                    <button
                      type="button"
                      onClick={() => handleSetExternalUrl(item.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                    >
                      Set URL
                    </button>
                  </div>

                  {item.status === 'available' && item.id !== 'checksum-sha256' && (
                    <button
                      type="button"
                      onClick={() => handleMarkComingSoon(item.id)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                    >
                      Mark Coming Soon
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Releases */}
        {activeTab === 'releases' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handlePublishRelease}
              className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 space-y-4"
            >
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-sky-500" />
                <span>Publish New Version</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Version (e.g. 1.1)"
                  value={relVersion}
                  onChange={(e) => setRelVersion(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Codename (e.g. Prism Nova)"
                  value={relCodename}
                  onChange={(e) => setRelCodename(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <textarea
                required
                rows={2}
                placeholder="Release summary..."
                value={relSummary}
                onChange={(e) => setRelSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <textarea
                rows={2}
                placeholder="New features (one per line)"
                value={relFeatures}
                onChange={(e) => setRelFeatures(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <textarea
                rows={2}
                placeholder="Security updates (one per line)"
                value={relSecurity}
                onChange={(e) => setRelSecurity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <textarea
                rows={2}
                placeholder="Bug fixes (one per line)"
                value={relFixes}
                onChange={(e) => setRelFixes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 cursor-pointer"
              >
                Publish Release & Regenerate Notes
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {overview.releases.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-bold text-base">
                      v{rel.version} · {rel.codename}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {rel.releaseDate} {rel.isLatest ? '· Latest' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rel.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Ultra Store Listings */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleAddStoreApp}
              className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 space-y-3 text-xs"
            >
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-sky-500" />
                <span>Add Ultra Store App</span>
              </h3>
              <input
                type="text"
                required
                placeholder="Application Name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
              <input
                type="text"
                required
                placeholder="Developer / Maintainer"
                value={appDeveloper}
                onChange={(e) => setAppDeveloper(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value as StoreApp['category'])}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                >
                  <option>Security & Linux</option>
                  <option>Gaming</option>
                  <option>Development</option>
                  <option>System & Web</option>
                  <option>Creative</option>
                </select>
                <select
                  value={appCompatibility}
                  onChange={(e) =>
                    setAppCompatibility(e.target.value as StoreApp['compatibility'])
                  }
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                >
                  <option>x86-64 Native</option>
                  <option>WSL / Container</option>
                  <option>Vulkan / Proton</option>
                  <option>Cross-Platform</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Version"
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Size (e.g. 220 MB)"
                  value={appSize}
                  onChange={(e) => setAppSize(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Application description..."
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-sky-600 hover:bg-sky-500 cursor-pointer"
              >
                Add Listing
              </button>
            </form>

            <div className="lg:col-span-7 space-y-2.5">
              {overview.storeApps.map((appItem) => (
                <div
                  key={appItem.id}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-sm">{appItem.name}</div>
                    <div className="text-xs text-slate-500">
                      {appItem.category} · {appItem.compatibility} · v{appItem.version}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteApp(appItem.id)}
                    aria-label={`Remove ${appItem.name}`}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Support Tickets */}
        {activeTab === 'support' && (
          <div className="space-y-3">
            {overview.supportMessages.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] text-center text-xs text-slate-500">
                No support messages submitted yet.
              </div>
            ) : (
              overview.supportMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-sm">{msg.name}</span> ({msg.email}) ·{' '}
                      <span className="text-sky-500">{msg.topic}</span>
                    </div>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {msg.id} · {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{msg.message}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                    {(['new', 'in_review', 'resolved'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateTicket(msg.id, st, msg.adminNote)}
                        className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                          msg.status === st
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Site Content */}
        {activeTab === 'content' && contentForm && (
          <form
            onSubmit={handleSaveContent}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 space-y-4 text-xs max-w-3xl"
          >
            <h3 className="font-display font-bold text-base">Manage Website Content</h3>
            <label className="block space-y-1">
              <span className="font-semibold">Hero Tagline</span>
              <input
                type="text"
                value={contentForm.heroTagline}
                onChange={(e) =>
                  setContentForm({ ...contentForm, heroTagline: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold">Hero Description</span>
              <textarea
                rows={2}
                value={contentForm.heroDescription}
                onChange={(e) =>
                  setContentForm({ ...contentForm, heroDescription: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold">Top Portal Announcement</span>
              <input
                type="text"
                value={contentForm.announcement}
                onChange={(e) =>
                  setContentForm({ ...contentForm, announcement: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold">Developer Description</span>
              <textarea
                rows={3}
                value={contentForm.developerBio}
                onChange={(e) =>
                  setContentForm({ ...contentForm, developerBio: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
              />
            </label>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-sky-600 hover:bg-sky-500 cursor-pointer"
            >
              Save Content Changes
            </button>
          </form>
        )}

        {/* Tab 6: Security Audit Logs */}
        {activeTab === 'audit' && (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 text-sm font-display font-bold">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Security & Administrative Audit Trail</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {overview.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-5 py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      {log.action}
                    </span>{' '}
                    · <span className="font-semibold">{log.target}</span> ·{' '}
                    <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                  </div>
                  <div className="font-mono text-slate-500 tabular-nums shrink-0">
                    {log.actor} · {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
