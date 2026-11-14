import React from 'react';
import {
  ArrowUpRight,
  FolderOpen,
  Globe,
  Layers,
  LayoutGrid,
  Monitor,
  Palette,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Terminal,
} from 'lucide-react';
import type { OsWindowId } from './OsConceptSimulator';

interface FeaturesSectionProps {
  onLaunchFeatureInOs: (win: OsWindowId) => void;
}

const FEATURES: Array<{
  title: string;
  description: string;
  windowId: OsWindowId;
  accent: string;
  icon: React.ReactNode;
  previewLabel: string;
}> = [
  {
    title: 'Windows-Inspired Desktop',
    description:
      'Frosted glassmorphism taskbar, centered app launcher, and default prismatic Rainbow Bloom wallpaper inspired by Windows 11.',
    windowId: 'start',
    accent: 'from-sky-500/20 to-indigo-500/20',
    icon: <Monitor className="w-5 h-5 text-sky-500" />,
    previewLabel: 'Desktop Shell · Rainbow Bloom',
  },
  {
    title: 'Ultra Start Menu',
    description:
      'Unified search bar, pinned productivity apps, Linux subsystems, and instant power/lock controls in one clean glass panel.',
    windowId: 'start',
    accent: 'from-indigo-500/20 to-fuchsia-500/20',
    icon: <LayoutGrid className="w-5 h-5 text-indigo-500" />,
    previewLabel: 'Centered App Grid',
  },
  {
    title: 'Ultra Store',
    description:
      'Curated marketplace for native x86-64 apps, Kali Linux, Ubuntu LTS, and Vulkan gaming packages with verified manifests.',
    windowId: 'store',
    accent: 'from-violet-500/20 to-sky-500/20',
    icon: <ShoppingBag className="w-5 h-5 text-violet-500" />,
    previewLabel: 'Package Marketplace',
  },
  {
    title: 'Ultra Browser',
    description:
      'Privacy-focused web browser with tracker blocking, isolated tab sandboxes, and DNS-over-HTTPS enabled out of the box.',
    windowId: 'browser',
    accent: 'from-cyan-500/20 to-blue-500/20',
    icon: <Globe className="w-5 h-5 text-cyan-500" />,
    previewLabel: 'Hardened Web Engine',
  },
  {
    title: 'Ultra Cyber Lab',
    description:
      'Built-in educational cybersecurity workbench with Wireshark, Nmap GUI, and isolated network sandbox profiles.',
    windowId: 'cyberlab',
    accent: 'from-teal-500/20 to-emerald-500/20',
    icon: <ShieldAlert className="w-5 h-5 text-teal-500" />,
    previewLabel: 'Sandboxed Lab',
  },
  {
    title: 'Ultra Explorer',
    description:
      'Tabbed file manager bridging local NVMe drives, encrypted partitions, WSL Linux filesystems, and USB pendrive tools.',
    windowId: 'explorer',
    accent: 'from-amber-500/20 to-orange-500/20',
    icon: <FolderOpen className="w-5 h-5 text-amber-500" />,
    previewLabel: 'Unified Storage & WSL$',
  },
  {
    title: 'Ultra Security & Threat Protection',
    description:
      'Real-time kernel shield, packet firewall guard, quick malware scanner, and System Lock PIN with AES-256 disk encryption.',
    windowId: 'threat',
    accent: 'from-emerald-500/20 to-cyan-500/20',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    previewLabel: 'Threat Protection + System Lock',
  },
  {
    title: 'Ultra Settings',
    description:
      'Granular control over display scaling, System Lock timeouts, network adapters, and subsystem defaults.',
    windowId: 'settings',
    accent: 'from-slate-500/20 to-sky-500/20',
    icon: <Settings className="w-5 h-5 text-slate-500 dark:text-slate-300" />,
    previewLabel: 'System Configuration',
  },
  {
    title: 'Multitasking',
    description:
      'Snap layouts, virtual workspaces, and low-latency window compositing tailored for developers and power users.',
    windowId: 'explorer',
    accent: 'from-blue-500/20 to-purple-500/20',
    icon: <Layers className="w-5 h-5 text-blue-500" />,
    previewLabel: 'Snap Grid & Workspaces',
  },
  {
    title: 'Custom Themes',
    description:
      'Switch effortlessly between Rainbow Bloom, Cobalt Blue, and Emerald Aurora in both Light and Dark glass modes.',
    windowId: 'settings',
    accent: 'from-pink-500/20 to-amber-500/20',
    icon: <Palette className="w-5 h-5 text-pink-500" />,
    previewLabel: 'Rainbow & Dark/Light Modes',
  },
  {
    title: 'Application Compatibility',
    description:
      'Runs native desktop software alongside Kali Linux, Ubuntu 24.04 LTS containers, and Steam/Proton gaming suites.',
    windowId: 'kali',
    accent: 'from-orange-500/20 to-rose-500/20',
    icon: <Terminal className="w-5 h-5 text-orange-500" />,
    previewLabel: 'Kali, Ubuntu & Proton',
  },
  {
    title: 'System Updates',
    description:
      'Cryptographically signed OTA delta updates and verifiable SHA-256 release channels managed transparently.',
    windowId: 'lock',
    accent: 'from-rose-500/20 to-indigo-500/20',
    icon: <RefreshCw className="w-5 h-5 text-rose-500" />,
    previewLabel: 'SHA-256 Verified Releases',
  },
];

export function FeaturesSection({ onLaunchFeatureInOs }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-wider uppercase text-fuchsia-600 dark:text-fuchsia-400">
            Operating System Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white text-balance">
            Twelve core modules engineered for daily computing and cyber labs
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Click any module card to preview its interactive interface directly inside the Windows 18
            Ultra live desktop simulator above.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, idx) => (
            <button
              key={feat.title}
              type="button"
              onClick={() => onLaunchFeatureInOs(feat.windowId)}
              className="group text-left rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-5 hover:border-sky-500/50 transition-all flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-3.5">
                {/* Embedded Mini Module Preview */}
                <div
                  className={`h-24 rounded-xl bg-gradient-to-br ${feat.accent} border border-slate-200/80 dark:border-white/10 p-3.5 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-950/70 shadow-sm">
                      {feat.icon}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                    {feat.previewLabel}
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <span>Preview in OS Desktop</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
