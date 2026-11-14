import React, { useEffect, useState } from 'react';
import { Download, Search, ShoppingBag, Terminal, X } from 'lucide-react';
import type { StoreApp } from '../types';

interface UltraStoreSectionProps {
  initialApps: StoreApp[];
}

const CATEGORIES = [
  'All',
  'Security & Linux',
  'Gaming',
  'Development',
  'System & Web',
  'Creative',
] as const;

export function UltraStoreSection({ initialApps }: UltraStoreSectionProps) {
  const [apps, setApps] = useState<StoreApp[]>(initialApps);
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);

  useEffect(() => {
    setApps(initialApps);
  }, [initialApps]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'All') params.set('category', category);
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch(`/api/store?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { apps: StoreApp[] };
          setApps(data.apps);
        }
      } catch {
        // Ignore aborted requests
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [category, query]);

  const handleDownloadManifest = async (appItem: StoreApp) => {
    const res = await fetch(`/api/store/${appItem.id}/manifest`, { method: 'POST' });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-install.sh`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const featuredApps = apps.filter((a) => a.featured).slice(0, 3);

  return (
    <section id="store" className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-sky-600 dark:text-sky-400">
              Application Marketplace
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
              Ultra Store
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Includes pre-selected default packages for Kali Linux, Ubuntu 24.04 LTS, and PC
              Gaming Software alongside developer and security tools.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kali, Ubuntu, Steam..."
              aria-label="Search Ultra Store applications"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0c1222] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/75 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-fit">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                category === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Spotlight Row (when viewing All with no search query) */}
        {category === 'All' && !query.trim() && featuredApps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredApps.map((appItem) => (
              <div
                key={appItem.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="text-xs font-medium text-sky-400">
                    Featured · {appItem.category}
                  </div>
                  <h3 className="font-display font-bold text-xl">{appItem.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{appItem.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <span className="text-slate-400">{appItem.compatibility}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(appItem)}
                    className="font-semibold text-sky-400 hover:underline cursor-pointer"
                  >
                    Install Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="p-10 rounded-2xl border border-slate-200 dark:border-white/10 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-display font-semibold text-slate-900 dark:text-white">
              No matching packages in Ultra Store
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try clearing your search filter or switching categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((appItem) => (
              <article
                key={appItem.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-950 dark:text-white">
                        {appItem.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {appItem.developer} · v{appItem.version}
                      </p>
                    </div>
                    {appItem.isDefaultBundle && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        Default OS App
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {appItem.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{appItem.compatibility}</span>
                    <span>{appItem.sizeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(appItem)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Instructions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadManifest(appItem)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-slate-950 dark:bg-sky-600 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Manifest</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* App Instructions Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0b1120] p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {selectedApp.category} · {selectedApp.compatibility}
                </p>
                <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mt-0.5">
                  {selectedApp.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">{selectedApp.description}</p>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Installation Instructions
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedApp.installInstructions}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 shrink-0" />
              <code>{selectedApp.packageCommand}</code>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadManifest(selectedApp)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Install Script</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
