"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Building, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function NssUnitBadge({ className = "", compact = false }) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs font-semibold text-blue-950 dark:text-blue-200 bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 rounded-full px-3.5 py-1 shadow-2xs ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-700 dark:bg-blue-400"></span>
        </span>
        <span>PVG&apos;s COET, PUNE</span>
        <span className="text-blue-300 dark:text-blue-700">•</span>
        <span className="text-muted-foreground font-normal">SPPU</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border border-blue-900/25 dark:border-blue-700/40 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 md:p-10 shadow-xl ${className}`}
    >
      {/* Background Subtle Glowing Gradients */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-blue-600/15 via-indigo-600/10 to-transparent pointer-events-none" />
      <div className="absolute -right-6 -bottom-10 opacity-10 select-none pointer-events-none">
        <Image
          src="/nss-bg.png"
          alt="NSS Emblem Watermark"
          width={240}
          height={240}
          className="object-contain"
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center sm:items-start md:items-center gap-5">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-white p-2 shadow-xl ring-4 ring-white/10 dark:ring-white/5">
            <Image
              src="/nss-bg.png"
              alt="NSS Official Emblem"
              width={80}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-xs font-semibold px-2.5 py-0.5 tracking-wide">
                NSS Directorate
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs font-medium px-2.5 py-0.5">
                AY 2025–2026
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              PVG&apos;s COET, PUNE
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 flex items-center gap-2 flex-wrap">
              <Building className="h-4 w-4 text-blue-300 shrink-0" />
              <span>National Service Scheme (NSS) Cell</span>
              <span className="text-blue-400">•</span>
              <span>Affiliated to Savitribai Phule Pune University (SPPU)</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-blue-800/40">
          <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-white font-semibold">Authorized Audit Portal</div>
              <div className="text-blue-200/80 text-[11px]">Govt. &amp; SPPU Compliant</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl text-xs">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-white font-semibold">Active Financial Cycle</div>
              <div className="text-blue-200/80 text-[11px]">Real-Time Camp Accounting</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
