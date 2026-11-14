import React from 'react';
import { Code2, Compass, Shield } from 'lucide-react';
import type { SiteContent } from '../types';
import { Windows18Logo } from './RainbowBloomWallpaper';

interface AboutDeveloperProps {
  siteContent: SiteContent;
}

export function AboutDeveloper({ siteContent }: AboutDeveloperProps) {
  return (
    <section id="about" className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 via-fuchsia-500/20 to-amber-500/20 border border-slate-200 dark:border-white/15 flex items-center justify-center">
              <Windows18Logo className="w-9 h-9" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                Developer Profile
              </p>
              <h2 className="text-3xl font-display font-bold text-slate-950 dark:text-white mt-1">
                {siteContent.developerName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {siteContent.developerTitle} · Project: Windows 18 Ultra
              </p>
            </div>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {siteContent.developerBio}
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 font-display font-bold text-base text-slate-950 dark:text-white">
                <Compass className="w-4 h-4 text-fuchsia-500" />
                <span>Project Vision</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {siteContent.projectVision}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] space-y-2">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-950 dark:text-white">
                <Code2 className="w-4 h-4 text-sky-500" />
                <span>Open Architecture</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Built around transparent release notes, verifiable SHA-256 artifacts, and integrated
                Linux & gaming workflows.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] space-y-2">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-950 dark:text-white">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Security First</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every binary published through this portal undergoes cryptographic SHA-256 hashing
                and server-side audit logging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
