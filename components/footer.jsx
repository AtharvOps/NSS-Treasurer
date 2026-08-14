"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Building,
  Globe,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-blue-900/30 no-print">
      {/* Top Info Bar */}
      <div className="border-b border-slate-800 bg-blue-950/40">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Official NSS Treasurer &amp; Financial Governance Portal • PVG&apos;s COET, PUNE</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>SPPU Affiliated Unit</span>
            <span>•</span>
            <span>NAAC &apos;A&apos; Grade</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: College & NSS Unit Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-xl bg-white p-1.5 shadow-md">
                <Image
                  src="/nss-bg.png"
                  alt="NSS Logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  PVG&apos;s COET, PUNE
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  National Service Scheme (NSS) Cell
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              PVG&apos;s COET, PUNE. Dedicated to student community service, youth leadership, rural camping, and transparent financial governance.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-800/40 text-xs text-blue-200">
              <Building className="h-3.5 w-3.5 text-blue-400" />
              <span>SPPU NSS College Code: <strong>NSS-PVG-01</strong></span>
            </div>
          </div>

          {/* Col 2: Official Contact & Address */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Campus Contact Details
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  44, Vidyanagari, Shivdarshan, Parvati, Pune, Maharashtra 411009, India.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="space-y-0.5">
                  <a href="tel:+9102024228258" className="hover:text-white transition-colors block">
                    +91 020 24228258 / 24228265
                  </a>
                  <a href="tel:+9102024228279" className="hover:text-white transition-colors block">
                    +91 020 24228279 (Office)
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <div className="space-y-0.5">
                  <a
                    href="mailto:enquiry@pvgcoet.ac.in"
                    className="hover:text-white transition-colors block font-mono text-[11px]"
                  >
                    enquiry@pvgcoet.ac.in
                  </a>
                  <a
                    href="mailto:principal@pvgcoet.ac.in"
                    className="hover:text-white transition-colors block font-mono text-[11px]"
                  >
                    principal@pvgcoet.ac.in
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>›</span> NSS Treasurer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/transaction/create" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>›</span> Record Transaction &amp; Scan Receipt
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>›</span> 7-Day Camp Budget &amp; Ledgers
                </Link>
              </li>
              <li>
                <a
                  href="https://www.pvgcoet.ac.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-400"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>PVG&apos;s COET Official Website</span>
                  <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="http://www.unipune.ac.in/nss/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-400"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>SPPU NSS Official Portal</span>
                  <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: NSS Cell Governance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Governance &amp; Timings
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">NSS Unit Programme Officer:</span>
                <strong className="text-white">Faculty Coordinator, NSS Unit</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Administrative Office Hours:</span>
                <span>Monday – Saturday: 9:00 AM – 5:30 PM</span>
              </div>
              <div className="pt-2">
                <span className="text-[11px] text-amber-300 block font-semibold mb-1">
                  National Service Scheme
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Affiliated to Savitribai Phule Pune University (SPPU) &amp; Ministry of Youth Affairs &amp; Sports.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} PVG&apos;s COET, PUNE. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>PVG&apos;s COET NSS Treasurer Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
