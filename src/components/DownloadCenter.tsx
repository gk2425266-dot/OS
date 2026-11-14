import React, { useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  Download,
  FileCode2,
  FileText,
  HardDrive,
  ShieldCheck,
  Usb,
} from 'lucide-react';
import type { DownloadItem } from '../types';

interface DownloadCenterProps {
  downloads: DownloadItem[];
  onRefresh: () => void;
  onOpenBootableWizard: () => void;
}

interface ProgressState {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  statusText: string;
}

export function DownloadCenter({
  downloads,
  onRefresh,
  onOpenBootableWizard,
}: DownloadCenterProps) {
  const [progressMap, setProgressMap] = useState<Record<string, ProgressState>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRealDownload = async (item: DownloadItem) => {
    if (item.status !== 'available') return;
    setErrorMap((prev) => ({ ...prev, [item.id]: '' }));

    try {
      setProgressMap((prev) => ({
        ...prev,
        [item.id]: {
          percent: 0,
          loadedBytes: 0,
          totalBytes: item.fileSizeBytes || 0,
          statusText: 'Connecting...',
        },
      }));

      const response = await fetch(`/api/downloads/${item.id}/file`);
      if (!response.ok) {
        const errBody = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || 'Download unavailable.');
      }

      const contentLengthHeader = response.headers.get('Content-Length');
      const totalBytes = contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : item.fileSizeBytes || 0;

      const reader = response.body?.getReader();
      if (!reader) {
        const blob = await response.blob();
        triggerSave(blob, item.filename || `${item.id}.bin`);
        setProgressMap((prev) => ({
          ...prev,
          [item.id]: {
            percent: 100,
            loadedBytes: blob.size,
            totalBytes: blob.size,
            statusText: 'Completed',
          },
        }));
        onRefresh();
        return;
      }

      const chunks: Uint8Array[] = [];
      let loadedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loadedBytes += value.length;
          const percent =
            totalBytes > 0 ? Math.min(100, Math.round((loadedBytes / totalBytes) * 100)) : 100;
          setProgressMap((prev) => ({
            ...prev,
            [item.id]: {
              percent,
              loadedBytes,
              totalBytes,
              statusText: percent === 100 ? 'Finalizing...' : 'Downloading...',
            },
          }));
        }
      }

      const blob = new Blob(chunks as BlobPart[]);
      triggerSave(blob, item.filename || `${item.id}.bin`);

      setProgressMap((prev) => ({
        ...prev,
        [item.id]: {
          percent: 100,
          loadedBytes,
          totalBytes: loadedBytes,
          statusText: 'Verified & Saved',
        },
      }));
      onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed.';
      setErrorMap((prev) => ({ ...prev, [item.id]: msg }));
      setProgressMap((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const triggerSave = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyHash = async (id: string, sha256: string) => {
    await navigator.clipboard.writeText(sha256);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getCategoryIcon = (category: DownloadItem['category']) => {
    switch (category) {
      case 'iso':
        return <HardDrive className="w-5 h-5 text-sky-500" />;
      case 'vm':
        return <FileCode2 className="w-5 h-5 text-indigo-500" />;
      case 'docs':
        return <FileText className="w-5 h-5 text-fuchsia-500" />;
      case 'checksum':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'notes':
        return <FileText className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <section id="download" className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-sky-600 dark:text-sky-400">
              Official Release Distribution · Version 1.0
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white text-balance">
              Download Center
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Every download connects directly to genuine server-hosted files and real SHA-256
              manifests. Images awaiting administrator verification clearly display Coming Soon.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBootableWizard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 transition-all shadow-sm self-start lg:self-auto cursor-pointer"
          >
            <Usb className="w-4 h-4" />
            <span>Create Bootable Pendrive & Verify ISO</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {downloads.map((item) => {
            const prog = progressMap[item.id];
            const errMsg = errorMap[item.id];
            const isAvailable = item.status === 'available';

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                      {getCategoryIcon(item.category)}
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isAvailable
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isAvailable ? 'Ready for Download' : 'Coming Soon'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Clean unboxed metadata rows */}
                  <dl className="grid grid-cols-2 gap-y-2 gap-x-3 pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs">
                    <div>
                      <dt className="text-slate-500 dark:text-slate-400">Version</dt>
                      <dd className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {item.version}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 dark:text-slate-400">File Size</dt>
                      <dd className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {item.fileSizeLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 dark:text-slate-400">Release Date</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {item.releaseDate}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 dark:text-slate-400">Downloads</dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {item.downloadCount}
                      </dd>
                    </div>
                  </dl>

                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Requirements:{' '}
                      </span>
                      <span>{item.recRequirements}</span>
                    </div>
                    {item.sha256 && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="font-mono text-[11px] truncate text-slate-500 dark:text-slate-400">
                          SHA-256: {item.sha256}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyHash(item.id, item.sha256!)}
                          aria-label={`Copy SHA-256 for ${item.title}`}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress / Action */}
                <div className="space-y-2.5">
                  {prog && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        <span>{prog.statusText}</span>
                        <span>{prog.percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rainbow-border-line transition-all duration-150"
                          style={{ width: `${prog.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {errMsg && <p className="text-xs text-rose-500">{errMsg}</p>}

                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => handleRealDownload(item)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-950 dark:bg-sky-600 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {item.fileSizeLabel}</span>
                    </button>
                  ) : (
                    <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Coming Soon · Upload Pending</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
