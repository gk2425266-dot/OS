import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  HardDrive,
  Monitor,
  Shield,
  Usb,
  Wifi,
} from 'lucide-react';

interface InstallationGuideProps {
  onOpenBootableWizard: () => void;
}

const INSTALL_STEPS = [
  {
    step: 1,
    title: 'Download the Windows 18 Ultra ISO',
    detail:
      'Obtain the verified 64-bit Windows 18 Ultra ISO from the official Download Center once published.',
    tip: 'Never flash an unverified ISO image from third-party mirrors.',
  },
  {
    step: 2,
    title: 'Check the SHA-256 Checksum',
    detail:
      'Compare your downloaded ISO against the official SHA-256 manifest using Get-FileHash (Windows), sha256sum (Linux), or the built-in browser verifier inside our Bootable Pendrive Wizard.',
    tip: 'Even a single-character mismatch indicates a corrupted or tampered file.',
  },
  {
    step: 3,
    title: 'Create a Bootable USB Pendrive',
    detail:
      'Use Rufus (Windows) with GPT/UEFI target, or Ventoy / dd (Linux/macOS) on a 16 GB+ USB 3.0 pendrive.',
    tip: 'Use our Bootable Pendrive Wizard button to generate a custom verification & flashing script.',
  },
  {
    step: 4,
    title: 'Back Up Important Files',
    detail:
      'Copy all critical documents, photos, SSH keys, and project repositories to an external drive or cloud storage before booting the installer.',
    tip: 'Repartitioning or formatting a system drive permanently erases existing data.',
  },
  {
    step: 5,
    title: "Enter the Computer's Boot Menu",
    detail:
      'Restart your PC and repeatedly press your motherboard Boot Menu key (typically F12, F11, F8, Esc, or Del) before your existing OS loads.',
    tip: 'Ensure UEFI boot mode is enabled in firmware settings.',
  },
  {
    step: 6,
    title: 'Boot from the USB Pendrive',
    detail:
      'Select the UEFI USB device entry representing your flashed pendrive and press Enter to load the Windows 18 Ultra live installer.',
    tip: 'Choose the entry prefixed with "UEFI:" when available.',
  },
  {
    step: 7,
    title: 'Start the Windows 18 Ultra Installer',
    detail:
      'Wait for Stage 1 (Concept Initialization) to complete, then click "Install Windows 18 Ultra" on the setup screen.',
    tip: 'You can also inspect the live desktop environment prior to writing to disk.',
  },
  {
    step: 8,
    title: 'Select Language and Keyboard',
    detail:
      'Pick your preferred display language, regional time zone, and keyboard input layout.',
    tip: 'Additional keyboard layouts can be added later in Ultra Settings.',
  },
  {
    step: 9,
    title: 'Configure Disk and Installation Settings',
    detail:
      'Choose the target NVMe/SSD partition. Double-check the drive size and model before confirming partition creation or formatting.',
    tip: 'CRITICAL: Formatting overwrites all previous partitions on the selected drive.',
  },
  {
    step: 10,
    title: 'Create a User Account & System Lock PIN',
    detail:
      'Set your administrator username, password, System Lock PIN, and select default software packs (Kali Linux, Ubuntu LTS, Gaming Software).',
    tip: 'Threat Protection and Drive Encryption options can be tuned immediately here.',
  },
  {
    step: 11,
    title: 'Complete the Setup',
    detail:
      'Allow the installer to copy system packages, configure the bootloader, and finalize Threat Protection policies.',
    tip: 'Keep AC power connected on laptops during installation.',
  },
  {
    step: 12,
    title: 'Restart and Enjoy Windows 18 Ultra',
    detail:
      'Remove the USB pendrive when prompted and reboot. Watch Stage 1 ("WINDOWS 18 ULTRA CONCEPT") transition into Stage 2 ("WELCOME") and your Rainbow Bloom desktop.',
    tip: 'Open Ultra Store to verify updates and optional packages.',
  },
];

const VIRTUALBOX_STEPS = [
  'Open Oracle VM VirtualBox 7.0+ and click New. Name the VM "Windows 18 Ultra" and select Linux / Other Linux (64-bit).',
  'Assign at least 4096 MB RAM (8192 MB recommended) and 4 virtual CPU cores under System -> Processor.',
  'Under System -> Motherboard, enable "Enable EFI (special OSes only)" for UEFI compatibility.',
  'Create a Virtual Hard Disk (VDI, Dynamically Allocated) with 40 GB capacity.',
  'Open Settings -> Storage -> Optical Drive -> Choose a disk file, and attach the verified Windows 18 Ultra ISO.',
  'Start the VM, complete the 12-step Setup Wizard, and eject the virtual optical ISO after reboot.',
];

export function InstallationGuide({ onOpenBootableWizard }: InstallationGuideProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [guideTab, setGuideTab] = useState<'baremetal' | 'virtualbox'>('baremetal');

  const current = INSTALL_STEPS[activeStepIdx];

  return (
    <section
      id="installation"
      className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Interactive Installation Wizard Guide */}
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                12-Step Interactive Guide
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white text-balance">
                Installation Wizard & VirtualBox Tutorial
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                Follow each verified step from checksum verification to your first Stage 1 & Stage 2
                boot on physical hardware or VirtualBox.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-white/10">
                <button
                  type="button"
                  onClick={() => setGuideTab('baremetal')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    guideTab === 'baremetal'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Physical PC (12 Steps)
                </button>
                <button
                  type="button"
                  onClick={() => setGuideTab('virtualbox')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    guideTab === 'virtualbox'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  VirtualBox Tutorial
                </button>
              </div>
              <button
                type="button"
                onClick={onOpenBootableWizard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:opacity-90 cursor-pointer"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>Create Bootable Pendrive</span>
              </button>
            </div>
          </div>

          {/* Explicit Disk Formatting & Data Loss Warning */}
          <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">
                Data Loss & Disk Formatting Warning
              </p>
              <p className="text-rose-900/85 dark:text-rose-200/85 leading-relaxed">
                Creating a bootable USB pendrive erases all files currently stored on that USB
                drive, and formatting a target hard drive or SSD during Step 09 permanently removes
                existing partitions and operating systems. Always back up important files before
                proceeding.
              </p>
            </div>
          </div>

          {guideTab === 'baremetal' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Step selector list */}
              <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                {INSTALL_STEPS.map((s, idx) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeStepIdx === idx
                        ? 'border-sky-500 bg-sky-500/10 text-slate-950 dark:text-white'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
                    }`}
                  >
                    <div className="text-[11px] font-mono tabular-nums text-sky-600 dark:text-sky-400">
                      Step {String(s.step).padStart(2, '0')}
                    </div>
                    <div className="text-xs font-semibold mt-0.5 line-clamp-1">{s.title}</div>
                  </button>
                ))}
              </div>

              {/* Active Step Detail Card */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tabular-nums font-semibold text-sky-600 dark:text-sky-400">
                    Step {String(current.step).padStart(2, '0')} of 12
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeStepIdx === 0}
                      onClick={() => setActiveStepIdx((i) => Math.max(0, i - 1))}
                      className="p-2 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                      aria-label="Previous step"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={activeStepIdx === INSTALL_STEPS.length - 1}
                      onClick={() =>
                        setActiveStepIdx((i) => Math.min(INSTALL_STEPS.length - 1, i + 1))
                      }
                      className="p-2 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                      aria-label="Next step"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Custom Technical Vector Illustration */}
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-950 p-5 text-white flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-sky-400">
                      {current.step <= 3
                        ? 'PHASE 1 · PREPARATION & HASH VERIFICATION'
                        : current.step <= 6
                          ? 'PHASE 2 · FIRMWARE BOOT & USB SELECTION'
                          : current.step <= 9
                            ? 'PHASE 3 · INSTALLER & PARTITIONING'
                            : 'PHASE 4 · ACCOUNT, SECURITY & FIRST BOOT'}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold">{current.title}</h3>
                  </div>
                  <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 via-fuchsia-500/20 to-amber-500/20 border border-white/15 items-center justify-center shrink-0 font-display font-bold text-lg tabular-nums">
                    {String(current.step).padStart(2, '0')}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {current.detail}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{current.tip}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white">
                    Oracle VM VirtualBox Installation Tutorial
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Test Windows 18 Ultra safely inside an isolated virtual machine without modifying
                    your host partitions.
                  </p>
                </div>
              </div>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VIRTUALBOX_STEPS.map((text, idx) => (
                  <li
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] flex gap-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* 5. SYSTEM REQUIREMENTS */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              Hardware Specifications
            </p>
            <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
              System Requirements
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Recommended targets below reflect current Version 1.0 design goals; minimum baseline
              thresholds are flagged clearly as pending final hardware-matrix verification once the
              64-bit ISO is published.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Cpu className="w-5 h-5 text-sky-500" />,
                label: 'Processor',
                recommended: 'x86-64 compatible CPU (4+ cores, 2.0 GHz+)',
                minimum: 'x86-64 dual-core baseline (final verification pending ISO)',
              },
              {
                icon: <HardDrive className="w-5 h-5 text-indigo-500" />,
                label: 'Memory (RAM)',
                recommended: '8 GB RAM recommended (16 GB for Cyber Lab + WSL)',
                minimum: '4 GB RAM baseline (pending ISO stress testing)',
              },
              {
                icon: <HardDrive className="w-5 h-5 text-fuchsia-500" />,
                label: 'Storage',
                recommended: '40 GB recommended SSD / NVMe space',
                minimum: '25 GB minimum before Kali/Ubuntu/Gaming packs',
              },
              {
                icon: <Monitor className="w-5 h-5 text-amber-500" />,
                label: 'Graphics',
                recommended: 'Compatible graphics hardware (Vulkan / DirectX 12)',
                minimum: '720p+ WDDM/DRM framebuffer display adapter',
              },
              {
                icon: <Shield className="w-5 h-5 text-emerald-500" />,
                label: 'Firmware',
                recommended: 'UEFI recommended (GPT partition table)',
                minimum: 'Legacy BIOS / MBR experimental fallback',
              },
              {
                icon: <Wifi className="w-5 h-5 text-cyan-500" />,
                label: 'Internet',
                recommended: 'Required for updates, Ultra Store & online features',
                minimum: 'Offline installation supported via full ISO',
              },
            ].map((spec) => (
              <div
                key={spec.label}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  {spec.icon}
                  <h4 className="font-display font-bold text-base text-slate-950 dark:text-white">
                    {spec.label}
                  </h4>
                </div>
                <div className="text-xs space-y-1.5">
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Recommended:{' '}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{spec.recommended}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Minimum:{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{spec.minimum}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
