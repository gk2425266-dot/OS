import React, { useState } from 'react';
import { Menu, Moon, Sun, Usb, X } from 'lucide-react';
import { Windows18Logo } from './RainbowBloomWallpaper';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenBootableWizard: () => void;
  onOpenAdmin: () => void;
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Download', href: '#download' },
  { label: 'Installation', href: '#installation' },
  { label: 'Ultra Store', href: '#store' },
  { label: 'Updates', href: '#updates' },
  { label: 'Support', href: '#support' },
  { label: 'About', href: '#about' },
];

export function Navbar({
  theme,
  onToggleTheme,
  onOpenBootableWizard,
  onOpenAdmin,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 glass-surface">
      <div className="h-[2px] w-full rainbow-border-line opacity-85" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Clean single-line brand mark */}
        <a
          href="#home"
          className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
        >
          <Windows18Logo className="w-7 h-7 shrink-0" />
          <span>Windows 18 Ultra</span>
        </a>

        {/* Zone 2: Single-line navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-sky-500 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Action + Theme Switch */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenBootableWizard}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Usb className="w-3.5 h-3.5" />
            <span>Create Bootable USB</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#080d1b]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenBootableWizard();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600"
            >
              <Usb className="w-4 h-4" />
              <span>Create Bootable USB</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdmin();
              }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200"
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
