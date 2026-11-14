import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FolderOpen,
  Gamepad2,
  Globe,
  HardDrive,
  LayoutGrid,
  Lock,
  Palette,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Terminal,
  Usb,
} from 'lucide-react';
import type { StoreApp } from '../types';
import { RainbowBloomWallpaper, Windows18Logo } from './RainbowBloomWallpaper';

export type OsWindowId =
  | 'start'
  | 'store'
  | 'browser'
  | 'cyberlab'
  | 'threat'
  | 'lock'
  | 'kali'
  | 'ubuntu'
  | 'gaming'
  | 'explorer'
  | 'settings';

interface OsConceptSimulatorProps {
  storeApps: StoreApp[];
  activeWindow: OsWindowId;
  onSelectWindow: (win: OsWindowId) => void;
  onOpenBootableWizard: () => void;
}

export function OsConceptSimulator({
  storeApps,
  activeWindow,
  onSelectWindow,
  onOpenBootableWizard,
}: OsConceptSimulatorProps) {
  const [viewMode, setViewMode] = useState<'interactive' | 'screens'>('interactive');
  const [bootStage, setBootStage] = useState<'idle' | 'concept' | 'welcome' | 'desktop'>('desktop');
  const [wallpaperStyle, setWallpaperStyle] = useState<'rainbow' | 'cobalt' | 'aurora'>('rainbow');

  // Interactive Threat Protection state
  const [realtimeShield, setRealtimeShield] = useState(true);
  const [firewallActive, setFirewallActive] = useState(true);
  const [sandboxIsolated, setSandboxIsolated] = useState(true);
  const [scanProgress, setScanProgress] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState('No threats detected · Last verified just now');

  // Interactive System Lock Setup state
  const [pinCode, setPinCode] = useState('2026');
  const [autoLockMinutes, setAutoLockMinutes] = useState('5');
  const [bitLockerEnabled, setBitLockerEnabled] = useState(true);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [unlockAttempt, setUnlockAttempt] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Interactive Terminal state (Kali / Ubuntu)
  const [terminalCmd, setTerminalCmd] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'Windows 18 Ultra Dual-Linux Subsystem Ready.',
    'Type "help", "neofetch", "kali-tools", or "uname -a".',
  ]);

  // Gaming state
  const [gameMode, setGameMode] = useState(true);
  const [vulkanOverlay, setVulkanOverlay] = useState(true);

  // Browser state
  const [browserUrl, setBrowserUrl] = useState('https://windows18ultra.local/cyber-lab');

  // Replay 2-stage boot sequence requested by user:
  // Stage 1: WINDOWS 18 ULTRA CONCEPT -> Stage 2: WELCOME -> Desktop
  const replayBootSequence = () => {
    setIsScreenLocked(false);
    setBootStage('concept');
  };

  useEffect(() => {
    if (bootStage === 'concept') {
      const t = setTimeout(() => setBootStage('welcome'), 2000);
      return () => clearTimeout(t);
    }
    if (bootStage === 'welcome') {
      const t = setTimeout(() => setBootStage('desktop'), 1900);
      return () => clearTimeout(t);
    }
  }, [bootStage]);

  const runQuickScan = () => {
    if (scanProgress !== null) return;
    setScanProgress(0);
    setScanResult('Scanning kernel modules, UEFI boot sector, and Ultra Store packages...');
    let p = 0;
    const iv = setInterval(() => {
      p += 20;
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          setScanProgress(null);
          setScanResult('Quick Scan complete · 4,812 objects checked · 0 threats found');
        }, 350);
      }
    }, 220);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalCmd.trim();
    if (!cmd) return;
    const distro = activeWindow === 'kali' ? 'kali@win18-ultra' : 'ubuntu@win18-ultra';
    let out = '';
    if (cmd === 'help') {
      out = 'Available commands: help, uname -a, neofetch, kali-tools, apt status, clear';
    } else if (cmd === 'uname -a') {
      out = 'Linux win18-ultra 6.11.0-ultra-x64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
    } else if (cmd === 'neofetch') {
      out =
        activeWindow === 'kali'
          ? 'OS: Kali Linux 2026.3 on Windows 18 Ultra WSL | Shell: zsh 5.9 | Tools: nmap, wireshark, metasploit'
          : 'OS: Ubuntu 24.04.1 LTS on Windows 18 Ultra WSL | Kernel: 6.11 Ultra | Packages: 1,420 (apt)';
    } else if (cmd === 'kali-tools') {
      out = 'Loaded educational modules: nmap, wireshark, burpsuite-ce, john, hydra, aircrack-ng (sandboxed)';
    } else if (cmd === 'apt status') {
      out = 'All Ubuntu & Ultra Subsystem repositories synchronized. 0 broken packages.';
    } else if (cmd === 'clear') {
      setTerminalLines([]);
      setTerminalCmd('');
      return;
    } else {
      out = `Executed "${cmd}" inside ${activeWindow === 'kali' ? 'Kali Linux' : 'Ubuntu LTS'} isolated container.`;
    }
    setTerminalLines((prev) => [...prev.slice(-6), `${distro}:~$ ${cmd}`, out]);
    setTerminalCmd('');
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockAttempt === pinCode) {
      setIsScreenLocked(false);
      setUnlockAttempt('');
      setUnlockError('');
    } else {
      setUnlockError('Incorrect PIN. Check your configured PIN in System Lock Setup.');
    }
  };

  const taskbarApps: Array<{ id: OsWindowId; label: string; icon: React.ReactNode; color: string }> = [
    { id: 'start', label: 'Start', icon: <Windows18Logo className="w-4 h-4" />, color: 'text-sky-400' },
    { id: 'explorer', label: 'Ultra Explorer', icon: <FolderOpen className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'browser', label: 'Ultra Browser', icon: <Globe className="w-4 h-4" />, color: 'text-sky-400' },
    { id: 'store', label: 'Ultra Store', icon: <ShoppingBag className="w-4 h-4" />, color: 'text-indigo-400' },
    { id: 'cyberlab', label: 'Cyber Lab', icon: <ShieldAlert className="w-4 h-4" />, color: 'text-cyan-400' },
    { id: 'threat', label: 'Threat Protection', icon: <ShieldCheck className="w-4 h-4" />, color: 'text-emerald-400' },
    { id: 'lock', label: 'System Lock', icon: <Lock className="w-4 h-4" />, color: 'text-rose-400' },
    { id: 'kali', label: 'Kali Linux', icon: <Terminal className="w-4 h-4" />, color: 'text-sky-300' },
    { id: 'ubuntu', label: 'Ubuntu LTS', icon: <Terminal className="w-4 h-4" />, color: 'text-orange-400' },
    { id: 'gaming', label: 'Gaming Hub', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-fuchsia-400' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, color: 'text-slate-300' },
  ];

  return (
    <div className="space-y-4">
      {/* Simulator Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('interactive')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'interactive'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Interactive OS Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewMode('screens')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'screens'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Concept Screenshots
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={replayBootSequence}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-sky-500" />
            <span>Replay Startup (Stage 1 & 2)</span>
          </button>
          <button
            type="button"
            onClick={onOpenBootableWizard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <Usb className="w-3.5 h-3.5" />
            <span>Bootable Pendrive Wizard</span>
          </button>
        </div>
      </div>

      {viewMode === 'screens' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <figure className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70">
            <img
              src="/assets/aistudio/WINN_8bb74652.png"
              alt="Windows 18 Ultra Start Menu and Desktop concept"
              referrerPolicy="no-referrer"
              className="w-full h-64 object-cover object-top"
            />
            <figcaption className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10">
              Concept Shell · Centered Start Menu & Pinned Productivity Suite
            </figcaption>
          </figure>
          <figure className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70">
            <img
              src="/assets/aistudio/WINN2_d0ae4c37.png"
              alt="Windows 18 Ultra Store, Browser, and Cyber Lab modules"
              referrerPolicy="no-referrer"
              className="w-full h-64 object-cover object-top"
            />
            <figcaption className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10">
              Module Previews · Ultra Desktop, Ultra Store, Ultra Browser & Ultra Cyber Lab
            </figcaption>
          </figure>
        </div>
      ) : (
        /* Interactive Desktop Frame */
        <div className="relative rounded-2xl overflow-hidden border border-slate-300/80 dark:border-white/15 shadow-2xl min-h-[500px] sm:min-h-[540px] flex flex-col justify-between bg-slate-950">
          {/* Default Rainbow Wallpaper just like Windows 11 */}
          <RainbowBloomWallpaper variant={wallpaperStyle} className="absolute inset-0 w-full h-full" />

          {/* Startup Stage 1 & Stage 2 Overlay */}
          <AnimatePresence>
            {(bootStage === 'concept' || bootStage === 'welcome') && (
              <motion.div
                key={bootStage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#040711]/95 backdrop-blur-2xl text-white p-6 text-center"
              >
                <RainbowBloomWallpaper variant="rainbow" className="absolute inset-0 opacity-35" />
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <Windows18Logo className="w-16 h-16" />
                  {bootStage === 'concept' ? (
                    <>
                      <p className="text-xs tracking-[0.28em] uppercase text-sky-300 font-mono">
                        Boot Stage 01
                      </p>
                      <h3 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight rainbow-gradient-text">
                        WINDOWS 18 ULTRA CONCEPT
                      </h3>
                      <p className="text-sm text-slate-300">
                        Initializing Rainbow Prism Shell · Developed by MR. ANSH RAJ
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs tracking-[0.28em] uppercase text-emerald-300 font-mono">
                        Boot Stage 02
                      </p>
                      <h3 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white">
                        WELCOME
                      </h3>
                      <p className="text-sm text-slate-300">
                        Preparing Threat Protection, System Lock & Subsystems...
                      </p>
                    </>
                  )}
                  <div className="w-40 h-1 rounded-full bg-white/15 overflow-hidden mt-2">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                      className="h-full w-1/2 rainbow-border-line"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Lock Screen Overlay */}
          {isScreenLocked && bootStage === 'desktop' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-6">
              <form
                onSubmit={handleUnlock}
                className="w-full max-w-xs rounded-2xl border border-white/15 bg-slate-900/90 p-6 text-center text-white space-y-4 shadow-2xl"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-sky-500 via-fuchsia-500 to-amber-500 flex items-center justify-center text-lg font-bold">
                  AR
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base">MR. ANSH RAJ</h4>
                  <p className="text-xs text-slate-400">Windows 18 Ultra · System Locked</p>
                </div>
                <input
                  type="password"
                  value={unlockAttempt}
                  onChange={(e) => setUnlockAttempt(e.target.value)}
                  placeholder={`Enter PIN (default ${pinCode})`}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/90 border border-white/15 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {unlockError && <p className="text-xs text-rose-400">{unlockError}</p>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold cursor-pointer"
                >
                  Unlock Desktop
                </button>
              </form>
            </div>
          )}

          {/* Top Desktop Bar */}
          <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-black/25 backdrop-blur-md text-white text-xs border-b border-white/10">
            <div className="flex items-center gap-2 font-medium">
              <Windows18Logo className="w-4 h-4" />
              <span>Windows 18 Ultra Desktop</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200 font-mono tabular-nums">
              <button
                type="button"
                onClick={() => setIsScreenLocked(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Lock</span>
              </button>
              <span>v1.0 Concept</span>
            </div>
          </div>

          {/* Main Desktop Canvas & Active Window */}
          <div className="relative z-10 flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Desktop Shortcuts Column */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-2 self-start">
              {[
                { id: 'kali' as OsWindowId, name: 'Kali Linux', icon: <Terminal className="w-5 h-5 text-sky-300" /> },
                { id: 'ubuntu' as OsWindowId, name: 'Ubuntu 24.04', icon: <Terminal className="w-5 h-5 text-orange-300" /> },
                { id: 'gaming' as OsWindowId, name: 'Gaming Software', icon: <Gamepad2 className="w-5 h-5 text-fuchsia-300" /> },
                { id: 'threat' as OsWindowId, name: 'Threat Protection', icon: <ShieldCheck className="w-5 h-5 text-emerald-300" /> },
                { id: 'lock' as OsWindowId, name: 'System Lock Setup', icon: <Lock className="w-5 h-5 text-rose-300" /> },
              ].map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  onClick={() => onSelectWindow(shortcut.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-white backdrop-blur-md transition-colors cursor-pointer ${
                    activeWindow === shortcut.id
                      ? 'bg-white/25 border border-white/30'
                      : 'bg-black/30 border border-white/10 hover:bg-black/45'
                  }`}
                >
                  {shortcut.icon}
                  <span className="truncate">{shortcut.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={onOpenBootableWizard}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-white bg-gradient-to-r from-sky-600/85 to-fuchsia-600/85 border border-white/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <Usb className="w-5 h-5 shrink-0" />
                <span className="truncate">Bootable Pendrive</span>
              </button>
            </div>

            {/* Active Frosted Glass App Window */}
            <div className="lg:col-span-9 rounded-2xl border border-white/20 bg-slate-950/80 backdrop-blur-2xl text-white shadow-2xl overflow-hidden">
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <LayoutGrid className="w-4 h-4 text-sky-400" />
                  <span>
                    {activeWindow === 'start' && 'Ultra Start Menu & Pinned Apps'}
                    {activeWindow === 'store' && 'Ultra Store Marketplace'}
                    {activeWindow === 'browser' && 'Ultra Browser'}
                    {activeWindow === 'cyberlab' && 'Ultra Cyber Lab'}
                    {activeWindow === 'threat' && 'Threat Protection Center'}
                    {activeWindow === 'lock' && 'System Lock & Drive Encryption Setup'}
                    {activeWindow === 'kali' && 'Kali Linux Subsystem (WSL)'}
                    {activeWindow === 'ubuntu' && 'Ubuntu 24.04 LTS Subsystem'}
                    {activeWindow === 'gaming' && 'Ultra Gaming Software Hub'}
                    {activeWindow === 'explorer' && 'Ultra Explorer'}
                    {activeWindow === 'settings' && 'Ultra Settings & Rainbow Themes'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <button
                    type="button"
                    onClick={() => onSelectWindow('start')}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
                  >
                    Start Menu
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="p-4 sm:p-5 min-h-[290px] max-h-[340px] overflow-y-auto">
                {activeWindow === 'start' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-300">
                      <Search className="w-4 h-4 text-sky-400" />
                      <span>Search Windows 18 Ultra apps, Linux subsystems, and settings...</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-300 mb-2.5">
                        Pinned Core & Default Software
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {taskbarApps
                          .filter((a) => a.id !== 'start')
                          .map((appItem) => (
                            <button
                              key={appItem.id}
                              type="button"
                              onClick={() => onSelectWindow(appItem.id)}
                              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
                            >
                              <span className={appItem.color}>{appItem.icon}</span>
                              <span className="text-xs font-medium text-center truncate w-full">
                                {appItem.label}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeWindow === 'threat' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display font-semibold text-base">
                          Windows 18 Ultra Threat Protection
                        </h4>
                        <p className="text-xs text-slate-300">{scanResult}</p>
                      </div>
                      <button
                        type="button"
                        onClick={runQuickScan}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold cursor-pointer"
                      >
                        {scanProgress !== null ? `Scanning ${scanProgress}%` : 'Run Quick Scan'}
                      </button>
                    </div>
                    {scanProgress !== null && (
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-200"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    )}
                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      {[
                        {
                          label: 'Real-Time Kernel Shield',
                          state: realtimeShield,
                          toggle: () => setRealtimeShield((v) => !v),
                        },
                        {
                          label: 'Packet Firewall Guard',
                          state: firewallActive,
                          toggle: () => setFirewallActive((v) => !v),
                        },
                        {
                          label: 'Cyber Lab Sandbox',
                          state: sandboxIsolated,
                          toggle: () => setSandboxIsolated((v) => !v),
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3"
                        >
                          <span className="font-medium">{item.label}</span>
                          <button
                            type="button"
                            onClick={item.toggle}
                            className={`px-2.5 py-1 rounded-md font-semibold text-left cursor-pointer ${
                              item.state
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {item.state ? 'Active · Protected' : 'Disabled'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeWindow === 'lock' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display font-semibold text-base">
                          System Lock & Security Setup
                        </h4>
                        <p className="text-slate-300">
                          Configure quick-unlock PIN, idle timeout, and disk encryption.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScreenLocked(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-semibold cursor-pointer"
                      >
                        Test Lock Screen Now
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <label className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <span className="block text-slate-300 font-medium">Unlock PIN</span>
                        <input
                          type="text"
                          maxLength={8}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/15 font-mono text-white"
                        />
                      </label>
                      <label className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <span className="block text-slate-300 font-medium">Idle Auto-Lock</span>
                        <select
                          value={autoLockMinutes}
                          onChange={(e) => setAutoLockMinutes(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/15 text-white"
                        >
                          <option value="1">1 minute</option>
                          <option value="5">5 minutes</option>
                          <option value="15">15 minutes</option>
                        </select>
                      </label>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2">
                        <span className="text-slate-300 font-medium">Full Disk Encryption</span>
                        <button
                          type="button"
                          onClick={() => setBitLockerEnabled((v) => !v)}
                          className={`px-2.5 py-1.5 rounded font-semibold cursor-pointer ${
                            bitLockerEnabled
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {bitLockerEnabled ? 'AES-256 Enabled' : 'Off'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(activeWindow === 'kali' || activeWindow === 'ubuntu') && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-black/70 border border-white/10 space-y-1.5 min-h-[175px]">
                      {terminalLines.map((line, i) => (
                        <div key={i} className="text-emerald-300 break-words">
                          {line}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={terminalCmd}
                        onChange={(e) => setTerminalCmd(e.target.value)}
                        placeholder={`Enter command (e.g. neofetch, kali-tools, uname -a)`}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-sans font-semibold cursor-pointer"
                      >
                        Run
                      </button>
                    </form>
                  </div>
                )}

                {activeWindow === 'gaming' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display font-semibold text-base">
                          Default Gaming Software & Vulkan Layer
                        </h4>
                        <p className="text-slate-300">
                          Pre-configured Steam Proton, Lutris, Heroic, OBS Studio, and MangoHud.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setGameMode((v) => !v)}
                          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                            gameMode ? 'bg-fuchsia-600 text-white' : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          Game Mode: {gameMode ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setVulkanOverlay((v) => !v)}
                          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                            vulkanOverlay ? 'bg-sky-600 text-white' : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          MangoHud: {vulkanOverlay ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {storeApps
                        .filter((a) => a.category === 'Gaming')
                        .map((gApp) => (
                          <div
                            key={gApp.id}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5"
                          >
                            <div className="font-semibold text-sm">{gApp.name}</div>
                            <div className="text-slate-400">{gApp.compatibility}</div>
                            <p className="text-slate-300 line-clamp-2">{gApp.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeWindow === 'store' && (
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {storeApps.slice(0, 4).map((appItem) => (
                      <div
                        key={appItem.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-sm">{appItem.name}</div>
                          <div className="text-slate-400">
                            {appItem.category} · {appItem.compatibility}
                          </div>
                        </div>
                        <p className="text-slate-300 line-clamp-2">{appItem.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeWindow === 'browser' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 border border-white/10">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <input
                        type="text"
                        value={browserUrl}
                        onChange={(e) => setBrowserUrl(e.target.value)}
                        className="flex-1 bg-transparent text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="font-display font-semibold text-sm">
                        Ultra Browser · Tracker Isolation Active
                      </div>
                      <p className="text-slate-300">
                        Built-in DNS-over-HTTPS, sandboxed tabs, and hardware-accelerated rainbow
                        glass UI designed for fast daily browsing and lab research.
                      </p>
                    </div>
                  </div>
                )}

                {activeWindow === 'cyberlab' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-display font-semibold text-sm">
                      Ultra Cyber Lab · Educational Network Workbench
                    </div>
                    <p className="text-slate-300">
                      Isolated lab environment combining Wireshark packet capture, Nmap topology
                      exercises, and Threat Protection rule verification without risking host files.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2.5 font-mono">
                      <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                        <div className="text-slate-400">Lab Interface</div>
                        <div className="text-cyan-300 mt-1">eth0-sandbox</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                        <div className="text-slate-400">Packet Filter</div>
                        <div className="text-emerald-300 mt-1">tcpdump / BPF ready</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                        <div className="text-slate-400">Kali Bridge</div>
                        <div className="text-sky-300 mt-1">Connected</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeWindow === 'explorer' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-display font-semibold text-sm">
                      Ultra Explorer · Drives & Subsystems
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <HardDrive className="w-5 h-5 text-sky-400" />
                        <div className="font-semibold">System (C:)</div>
                        <div className="text-slate-400 tabular-nums">40 GB NVMe · Encrypted</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <Terminal className="w-5 h-5 text-cyan-400" />
                        <div className="font-semibold">Linux (WSL$)</div>
                        <div className="text-slate-400">Kali Linux & Ubuntu 24.04</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <Usb className="w-5 h-5 text-amber-400" />
                        <div className="font-semibold">Bootable USB Tool</div>
                        <button
                          type="button"
                          onClick={onOpenBootableWizard}
                          className="text-sky-300 underline cursor-pointer"
                        >
                          Launch Pendrive Wizard
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeWindow === 'settings' && (
                  <div className="space-y-4 text-xs">
                    <div className="font-display font-semibold text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-fuchsia-400" />
                      <span>Personalization & Default Rainbow Wallpaper</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { id: 'rainbow' as const, label: 'Rainbow Bloom (Default)' },
                        { id: 'cobalt' as const, label: 'Cobalt Blue Bloom' },
                        { id: 'aurora' as const, label: 'Emerald Aurora' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setWallpaperStyle(w.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            wallpaperStyle === w.id
                              ? 'border-sky-400 bg-sky-500/20'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold">{w.label}</div>
                          <div className="text-slate-400 mt-1">Click to apply live</div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={replayBootSequence}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay Stage 1 & Stage 2 Boot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Centered Windows 11-Inspired Glass Taskbar */}
          <div className="relative z-10 px-3 py-2 bg-black/35 backdrop-blur-xl border-t border-white/15 flex items-center justify-center gap-1.5 overflow-x-auto">
            {taskbarApps.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => onSelectWindow(item.id)}
                className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeWindow === item.id
                    ? 'bg-white/20 ring-1 ring-white/40 scale-105'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className={item.color}>{item.icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
