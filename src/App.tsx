import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownToLine,
  BookOpen,
  Compass,
  Lock,
  ShieldCheck,
  Usb,
} from 'lucide-react';
import type { BootstrapPayload } from './types';
import { Navbar } from './components/Navbar';
import { OsConceptSimulator, type OsWindowId } from './components/OsConceptSimulator';
import { FeaturesSection } from './components/FeaturesSection';
import { DownloadCenter } from './components/DownloadCenter';
import { InstallationGuide } from './components/InstallationGuide';
import { UltraStoreSection } from './components/UltraStoreSection';
import { UpdatesAndSupport } from './components/UpdatesAndSupport';
import { AboutDeveloper } from './components/AboutDeveloper';
import { BootableWizardModal } from './components/BootableWizardModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Windows18Logo } from './components/RainbowBloomWallpaper';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOsWindow, setActiveOsWindow] = useState<OsWindowId>('start');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [adminMode, setAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/admin' || window.location.hash === '#admin';
    }
    return false;
  });

  const loadBootstrap = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const json = (await res.json()) as BootstrapPayload;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBootstrap();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('w18-theme', next);
    } catch {
      // Ignore storage errors
    }
  };

  const launchFeatureInOs = (win: OsWindowId) => {
    setActiveOsWindow(win);
    const el = document.getElementById('os-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (adminMode) {
    return (
      <AdminDashboard
        onExit={() => {
          setAdminMode(false);
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', '/');
          }
        }}
        onDataChanged={loadBootstrap}
      />
    );
  }

  const siteContent = data?.siteContent || {
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenBootableWizard={() => setWizardOpen(true)}
        onOpenAdmin={() => setAdminMode(true)}
      />

      <main>
        {/* 2. HERO SECTION */}
        <section id="home" className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
          {/* Subtle Ambient Rainbow Prism Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[920px] h-[360px] rounded-full opacity-25 dark:opacity-30 blur-3xl"
            style={{
              background:
                'linear-gradient(90deg, #0ea5e9 0%, #6366f1 28%, #d946ef 54%, #f43f5e 76%, #f59e0b 100%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl space-y-6"
            >
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                {siteContent.announcement}
              </p>

              <h1 className="font-display font-extrabold tracking-tight leading-[1.06] text-[clamp(2.35rem,4.8vw,4rem)] text-slate-950 dark:text-white text-balance">
                <span className="rainbow-gradient-text">{siteContent.heroTitle}</span>
              </h1>

              <p className="text-xl sm:text-2xl font-display font-semibold text-slate-800 dark:text-slate-100 text-balance">
                {siteContent.heroTagline}
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {siteContent.heroDescription}
              </p>

              {/* Hero Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#download"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 transition-all shadow-md whitespace-nowrap"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Download Windows 18 Ultra</span>
                </a>

                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 text-sky-500" />
                  <span>Explore Features</span>
                </a>

                <a
                  href="#installation"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-fuchsia-500" />
                  <span>Installation Guide</span>
                </a>

                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Usb className="w-4 h-4" />
                  <span>Create Bootable Pendrive</span>
                </button>
              </div>
            </motion.div>

            {/* Interactive Windows 18 Ultra Showcase (Desktop, Start Menu, Store, Browser, Cyber Lab, Threat Protection, System Lock, Kali/Ubuntu, Gaming) */}
            <div id="os-showcase" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Interactive Live OS Preview · Rainbow Bloom Wallpaper · Click taskbar icons to
                  test Threat Protection, System Lock, Kali Linux, Ubuntu & Gaming Hub
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Developed by {siteContent.developerName}
                </span>
              </div>

              {loading && !data ? (
                <div className="h-[520px] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 animate-pulse" />
              ) : (
                <OsConceptSimulator
                  storeApps={data?.storeApps || []}
                  activeWindow={activeOsWindow}
                  onSelectWindow={setActiveOsWindow}
                  onOpenBootableWizard={() => setWizardOpen(true)}
                />
              )}
            </div>
          </div>
        </section>

        {/* 6. FEATURES */}
        <FeaturesSection onLaunchFeatureInOs={launchFeatureInOs} />

        {/* 3. DOWNLOAD CENTER */}
        <DownloadCenter
          downloads={data?.downloads || []}
          onRefresh={loadBootstrap}
          onOpenBootableWizard={() => setWizardOpen(true)}
        />

        {/* 4 & 5. INSTALLATION WIZARD & SYSTEM REQUIREMENTS */}
        <InstallationGuide onOpenBootableWizard={() => setWizardOpen(true)} />

        {/* 7. ULTRA STORE */}
        <UltraStoreSection initialApps={data?.storeApps || []} />

        {/* 8 & 9. SYSTEM UPDATES & SUPPORT CENTER */}
        <UpdatesAndSupport releases={data?.releases || []} />

        {/* 10. DEVELOPER PROFILE */}
        <AboutDeveloper siteContent={siteContent} />
      </main>

      {/* Quiet Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#050811] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 font-display font-bold text-base text-slate-950 dark:text-white">
              <Windows18Logo className="w-6 h-6" />
              <span>Windows 18 Ultra</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Developed by {siteContent.developerName} · The Next Generation of Personal Computing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white">
              Features
            </a>
            <a href="#download" className="hover:text-slate-950 dark:hover:text-white">
              Download
            </a>
            <a href="#installation" className="hover:text-slate-950 dark:hover:text-white">
              Installation
            </a>
            <a href="#store" className="hover:text-slate-950 dark:hover:text-white">
              Ultra Store
            </a>
            <a href="#updates" className="hover:text-slate-950 dark:hover:text-white">
              Updates
            </a>
            <a href="#support" className="hover:text-slate-950 dark:hover:text-white">
              Support
            </a>
            <button
              type="button"
              onClick={() => setAdminMode(true)}
              className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SHA-256 Verified Portal</span>
          </div>
        </div>
      </footer>

      <BootableWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        downloads={data?.downloads || []}
      />
    </div>
  );
}
