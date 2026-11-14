import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { ReleaseEntry } from '../types';

interface UpdatesAndSupportProps {
  releases: ReleaseEntry[];
}

const TROUBLESHOOTING_TOPICS = [
  {
    id: 'boot',
    label: 'Boot Errors',
    title: 'UEFI / USB Boot Menu Troubleshooting',
    points: [
      'Confirm your motherboard firmware is set to UEFI mode and USB Boot is enabled.',
      'Re-verify the ISO SHA-256 checksum before flashing your pendrive.',
      'If Secure Boot blocks an unsigned test kernel, temporarily toggle Secure Boot or enroll the Windows 18 Ultra MOK key.',
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware Compatibility',
    title: 'CPU, RAM & Graphics Compatibility',
    points: [
      'Windows 18 Ultra requires an x86-64 64-bit processor; 32-bit x86 CPUs are unsupported.',
      'Assign at least 8 GB RAM and 40 GB storage for smooth Cyber Lab, Kali, and Gaming workloads.',
      'Enable hardware virtualization (VT-x / AMD-V) in BIOS/UEFI if running VirtualBox or WSL subsystems.',
    ],
  },
  {
    id: 'apps',
    label: 'App Compatibility',
    title: 'Kali Linux, Ubuntu & Gaming Software',
    points: [
      'Use Ultra Store manifests or the built-in Setup Wizard to install Kali Linux and Ubuntu 24.04 containers.',
      'Enable Vulkan drivers and Proton compatibility layers inside the Gaming Hub for Steam titles.',
    ],
  },
  {
    id: 'network',
    label: 'Network Problems',
    title: 'Wi-Fi, Ethernet & Cyber Lab Bridging',
    points: [
      'Ensure Cyber Lab sandbox interfaces are isolated when running packet captures.',
      'Check DNS-over-HTTPS settings inside Ultra Browser if local LAN hostnames do not resolve.',
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery Instructions',
    title: 'System Restore & Recovery Mode',
    points: [
      'Boot from your Windows 18 Ultra USB pendrive and select "Repair & Recovery Console" instead of formatting.',
      'System Lock PIN resets require physical recovery verification or your encrypted backup key.',
    ],
  },
];

const FAQS = [
  {
    q: 'Why does the 64-bit ISO currently say Coming Soon?',
    a: 'We never publish placeholder links or unverified ISOs. Once MR. ANSH RAJ uploads the verified Version 1.0 ISO in the Administrator Console, the Download Center updates immediately with its exact file size and SHA-256 hash.',
  },
  {
    q: 'Are Kali Linux, Ubuntu, and Gaming apps included by default?',
    a: 'Yes. The Windows 18 Ultra Setup Wizard lets you stage Kali Linux Subsystem, Ubuntu 24.04 LTS, Steam/Proton, Lutris, and MangoHud alongside Threat Protection and System Lock.',
  },
  {
    q: 'Can I test Windows 18 Ultra safely without erasing my PC?',
    a: 'Yes. Use Oracle VM VirtualBox with EFI enabled or explore the interactive Windows 18 Ultra OS Simulator right here on this website.',
  },
];

export function UpdatesAndSupport({ releases }: UpdatesAndSupportProps) {
  const [activeTroubleshoot, setActiveTroubleshoot] = useState('boot');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact Support Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Installation Troubleshooting');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [mathAnswer, setMathAnswer] = useState('');
  const challenge = useMemo(() => ({ a: 7, b: 5, sum: 12 }), []);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const latestRelease = releases.find((r) => r.isLatest) || releases[0];
  const currentTroubleshoot =
    TROUBLESHOOTING_TOPICS.find((t) => t.id === activeTroubleshoot) || TROUBLESHOOTING_TOPICS[0];

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (name.trim().length < 2) {
      setSubmitError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 15) {
      setSubmitError('Please describe your question or issue in at least 15 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          topic,
          message,
          website,
          mathAnswer,
          mathExpected: challenge.sum,
        }),
      });
      const data = (await res.json()) as { error?: string; ticketId?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit support request.');
      }
      setSubmitSuccess(`Ticket ${data.ticketId} logged. ${data.message}`);
      setName('');
      setEmail('');
      setMessage('');
      setMathAnswer('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 8. SYSTEM UPDATES */}
      <section
        id="updates"
        className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              Genuine Release Registry
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
              System Updates & Release History
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Only authentic published releases appear below, synchronized with our downloadable
              Release Notes and SHA-256 verification registry.
            </p>
          </div>

          {latestRelease && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    Latest Published Release · {latestRelease.releaseDate}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-950 dark:text-white mt-1">
                    Windows 18 Ultra v{latestRelease.version} ({latestRelease.codename})
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Active Channel
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {latestRelease.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2.5">
                  <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-slate-950 dark:text-white">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>New Features</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {latestRelease.newFeatures.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-slate-950 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Security Updates</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {latestRelease.securityUpdates.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-slate-950 dark:text-white">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <span>Bug Fixes & Notes</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {latestRelease.bugFixes.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {releases.length > 1 && (
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white">
                Previous Published Releases
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {releases
                  .filter((r) => !r.isLatest)
                  .map((rel) => (
                    <div
                      key={rel.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          v{rel.version} · {rel.codename}
                        </span>
                        <span className="tabular-nums">{rel.releaseDate}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {rel.summary}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. SUPPORT CENTER */}
      <section
        id="support"
        className="py-20 sm:py-24 border-t border-slate-200 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-sky-600 dark:text-sky-400">
              Help & Diagnostics
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
              Support Center
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Installation troubleshooting, boot error diagnostics, recovery steps, and direct
              validated support requests.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Troubleshooting + FAQs */}
            <div className="lg:col-span-7 space-y-8">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 space-y-5">
                <div className="flex flex-wrap gap-1.5">
                  {TROUBLESHOOTING_TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTroubleshoot(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeTroubleshoot === t.id
                          ? 'bg-slate-950 dark:bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">
                    {currentTroubleshoot.title}
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {currentTroubleshoot.points.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  <span>Frequently Asked Questions</span>
                </h3>
                <div className="space-y-2.5">
                  {FAQS.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 text-sm font-semibold text-slate-950 dark:text-white cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            openFaq === idx ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openFaq === idx && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Support Form */}
            <form
              onSubmit={handleSupportSubmit}
              className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1222] p-6 space-y-4"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">
                  Contact Support
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Protected with server-side validation, rate limiting, and spam verification.
                </p>
              </div>

              {/* Honeypot field hidden from human users */}
              <div className="sr-only" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>

              <label className="block space-y-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Email Address
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Topic</span>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm"
                >
                  <option>Installation Troubleshooting</option>
                  <option>Boot & UEFI Errors</option>
                  <option>Hardware Compatibility</option>
                  <option>Ultra Store & Linux Subsystems</option>
                  <option>Security & Checksum Verification</option>
                </select>
              </label>

              <label className="block space-y-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Message</span>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your hardware, boot step, or error details..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Anti-Spam Verification: What is {challenge.a} + {challenge.b}?
                </span>
                <input
                  type="number"
                  required
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Enter sum"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 text-sm tabular-nums"
                />
              </label>

              {submitError && <p className="text-xs text-rose-500 font-medium">{submitError}</p>}
              {submitSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {submitSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Request'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
