"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, FileSpreadsheet, Bot } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 80;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-blue-600/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto text-center relative z-10">
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-200 mb-6 shadow-2xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>PVG&apos;s COET NSS Cell • Financial Governance Portal</span>
          <span className="hidden sm:inline text-blue-400">•</span>
          <span className="hidden sm:inline font-mono text-[11px] text-amber-600 dark:text-amber-400">SPPU AY 2025–26</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-blue-950 dark:text-white max-w-5xl mx-auto leading-[1.08]"
        >
          Audit NSS Finances <br />
          <span className="bg-gradient-to-r from-blue-900 via-indigo-700 to-rose-700 dark:from-blue-400 dark:via-indigo-300 dark:to-rose-400 bg-clip-text text-transparent">
            With AI Intelligence
          </span>
        </motion.h1>

        {/* NSS Motto */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-2xl sm:text-3xl md:text-4xl pt-3 text-slate-800 dark:text-slate-100 mb-3 max-w-2xl mx-auto font-bold uppercase tracking-wide"
        >
          &ldquo; NOT ME BUT YOU &rdquo;
        </motion.p>

        {/* NSS Vision Statement */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Our vision is to build the youth with the mind and spirit to serve the society and work for the social uplift of the down-trodden masses of our nation as a movement.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 bg-blue-950 hover:bg-blue-900 text-white dark:bg-blue-800 dark:hover:bg-blue-700 shadow-md gap-2 font-semibold">
              <span>Open Treasurer Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/transaction/create" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-blue-900/30 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-900 dark:text-blue-300" />
              <span>Record Voucher</span>
            </Button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 text-xs text-slate-600 dark:text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Govt. &amp; SPPU Audit Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-blue-500" />
            <span>Gemini AI Copilot Integrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Smart Receipt OCR Scanner</span>
          </div>
        </motion.div>

        {/* Dashboard Perspective Preview Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="hero-image-wrapper mt-10 md:mt-14"
        >
          <div ref={imageRef} className="hero-image">
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-blue-900/20 via-slate-800/10 to-transparent border border-blue-900/20 dark:border-blue-700/30 shadow-2xl mx-auto max-w-5xl">
              <Image
                src="/banner-a.png"
                width={1280}
                height={720}
                alt="NSS Treasurer Dashboard Preview"
                className="rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-800 mx-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;