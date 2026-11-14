import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck2,
  Gamepad2,
  Lock,
  ShieldCheck,
  Terminal,
  Usb,
  X,
} from 'lucide-react';
import type { DownloadItem } from '../types';

interface BootableWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadItem[];
}

export function BootableWizardModal({
  isOpen,
  onClose,
  downloads,
}: BootableWizardModalProps) {
  const [hostOs, setHostOs] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [scheme, setScheme] = useState<'GPT' | 'MBR'>('GPT');
  const [usbLabel, setUsbLabel] = useState('WIN18_ULTRA');
  const [driveCapacity, setDriveCapacity] = useState('32 GB');

  // OS Setup Wizard customization
  const [includeKali, setIncludeKali] = useState(true);
  const [includeUbuntu, setIncludeUbuntu] = useState(true);
  const [includeGaming, setIncludeGaming] = useState(true);
  const [enableThreatProtection, setEnableThreatProtection] = useState(true);
  const [enableSystemLock, setEnableSystemLock] = useState(true);

  // Genuine client-side Web Crypto SHA-256 file verifier
  const [verifying, setVerifying] = useState(false);
  const [verifiedFileName, setVerifiedFileName] = useState<string | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [matchedDownload, setMatchedDownload] = useState<DownloadItem | null>(null);
  const [scriptDownloading, setScriptDownloading] = useState(false);

  if (!isOpen) return null;

  const isoArtifact = downloads.find((d) => d.id === 'iso-x64');

  const handleLocalFileVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerifying(true);
    setVerifiedFileName(file.name);
    setComputedHash(null);
    setMatchedDownload(null);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setComputedHash(hex);
      const match = downloads.find((d) => d.sha256 && d.sha256.toLowerCase() === hex.toLowerCase());
      setMatchedDownload(match || null);
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadPrepScript = async () => {
    setScriptDownloading(true);
    try {
      const res = await fetch('/api/bootable-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostOs, scheme, usbLabel }),
      });
      if (!res.ok) throw new Error('Failed to generate script');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        hostOs === 'windows' ? 'prepare-win18-ultra-usb.ps1' : 'prepare-win18-ultra-usb.sh';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setScriptDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bootable-wizard-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 shadow-2xl">
        <div className="h-[3px] w-full rainbow-border-line" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h2 id="bootable-wizard-title" className="font-display font-bold text-lg">
                Bootable Pendrive & OS Setup Wizard
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify checksums, configure USB flashing options, and stage default subsystems
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wizard"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ISO Availability Notice */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                {isoArtifact?.status === 'available'
                  ? `Verified ISO Ready: ${isoArtifact.filename} (${isoArtifact.fileSizeLabel})`
                  : 'ISO Status: Coming Soon · Preparation & Checksum Tools Ready'}
              </p>
              <p className="text-amber-800/90 dark:text-amber-200/80">
                Web browsers cannot directly overwrite raw USB partition tables for safety reasons.
                Use this wizard to verify your downloaded image via SHA-256 and generate a genuine
                flashing verification script for Rufus (Windows) or Ventoy / dd (Linux & macOS).
                Always back up your pendrive before formatting.
              </p>
            </div>
          </div>

          {/* Step 1: Target Pendrive Configuration */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
              01. Target Pendrive & Firmware Profile
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <label className="space-y-1.5">
                <span className="block font-medium text-slate-600 dark:text-slate-300">
                  Host Operating System
                </span>
                <select
                  value={hostOs}
                  onChange={(e) => setHostOs(e.target.value as 'windows' | 'linux' | 'macos')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                >
                  <option value="windows">Windows (Rufus + PowerShell)</option>
                  <option value="linux">Linux (Ventoy / dd)</option>
                  <option value="macos">macOS (diskutil + dd)</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="block font-medium text-slate-600 dark:text-slate-300">
                  Partition Scheme
                </span>
                <select
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value as 'GPT' | 'MBR')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                >
                  <option value="GPT">GPT (UEFI Recommended)</option>
                  <option value="MBR">MBR (Legacy BIOS)</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="block font-medium text-slate-600 dark:text-slate-300">
                  Pendrive Size
                </span>
                <select
                  value={driveCapacity}
                  onChange={(e) => setDriveCapacity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900"
                >
                  <option value="16 GB">16 GB USB 3.0+</option>
                  <option value="32 GB">32 GB USB 3.0+</option>
                  <option value="64 GB">64 GB USB 3.2</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="block font-medium text-slate-600 dark:text-slate-300">
                  Volume Label
                </span>
                <input
                  type="text"
                  maxLength={16}
                  value={usbLabel}
                  onChange={(e) => setUsbLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </label>
            </div>
          </div>

          {/* Step 2: OS Setup Wizard Default Apps & Security */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
              02. Windows 18 Ultra Default Apps & Security Profile ({driveCapacity})
            </h3>
            <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
              {[
                {
                  checked: includeKali,
                  onChange: () => setIncludeKali((v) => !v),
                  icon: <Terminal className="w-4 h-4 text-sky-500" />,
                  title: 'Kali Linux Subsystem',
                  desc: 'Educational security & network auditing toolkit',
                },
                {
                  checked: includeUbuntu,
                  onChange: () => setIncludeUbuntu((v) => !v),
                  icon: <Terminal className="w-4 h-4 text-orange-500" />,
                  title: 'Ubuntu 24.04 LTS Subsystem',
                  desc: 'Full Linux development & container environment',
                },
                {
                  checked: includeGaming,
                  onChange: () => setIncludeGaming((v) => !v),
                  icon: <Gamepad2 className="w-4 h-4 text-fuchsia-500" />,
                  title: 'Gaming Software Suite',
                  desc: 'Steam Proton, Lutris, Heroic & MangoHud',
                },
                {
                  checked: enableThreatProtection && enableSystemLock,
                  onChange: () => {
                    const next = !(enableThreatProtection && enableSystemLock);
                    setEnableThreatProtection(next);
                    setEnableSystemLock(next);
                  },
                  icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
                  title: 'Threat Protection & System Lock',
                  desc: 'Real-time firewall, PIN lock & drive encryption',
                },
              ].map((opt) => (
                <label
                  key={opt.title}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 cursor-pointer hover:border-sky-500/40"
                >
                  <input
                    type="checkbox"
                    checked={opt.checked}
                    onChange={opt.onChange}
                    className="mt-0.5 accent-sky-600"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      {opt.icon}
                      <span>{opt.title}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Genuine Client-Side SHA-256 File Verifier */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-sky-500" />
                  <span>03. Verify Local File SHA-256 Checksum</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Computes the cryptographic SHA-256 digest locally in your browser without uploading
                  your file.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 cursor-pointer">
                <span>Choose File to Verify</span>
                <input type="file" onChange={handleLocalFileVerify} className="sr-only" />
              </label>
            </div>

            {verifying && (
              <p className="text-xs text-sky-600 dark:text-sky-400 font-mono">
                Computing SHA-256 digest for {verifiedFileName}...
              </p>
            )}

            {computedHash && (
              <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  File: {verifiedFileName}
                </div>
                <div className="font-mono break-all text-slate-600 dark:text-slate-300">
                  SHA-256: {computedHash}
                </div>
                {matchedDownload ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matches published official artifact: {matchedDownload.title}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 dark:text-slate-400">
                    Compare this hash against the official Windows-18-Ultra-v1.0.sha256 manifest.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Rufus / Ventoy / dd safe verification script</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadPrepScript}
                disabled={scriptDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-60 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {scriptDownloading
                    ? 'Generating Script...'
                    : `Download ${hostOs === 'windows' ? 'PowerShell (.ps1)' : 'Bash (.sh)'} USB Script`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
