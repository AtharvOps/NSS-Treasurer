"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Tent,
  Heart,
  TreePine,
  ChevronRight,
  Zap,
} from "lucide-react";
import HeroSection from "@/components/hero";
import { AnimatedCounter } from "@/components/animated-counter";
import { motion, AnimatePresence } from "framer-motion";
import {
  featuresData,
  howItWorksData,
  testimonialsData,
} from "@/data/landing";

const STATS_DATA = {
  CURRENT_AY: [
    { target: 2850, suffix: "+", label: "NSS Records Merged", decimals: 0, sub: "Vouchers cataloged" },
    { target: 18.4, prefix: "₹", suffix: "L+", label: "Camp & Unit Funds Handled", decimals: 1, sub: "AY 2025–26 Grants" },
    { target: 99.98, suffix: "%", label: "Uptime & Secure Access", decimals: 2, sub: "Role-based verification" },
    { target: 4.9, suffix: "/5.0", label: "Satisfaction Rating", decimals: 1, sub: "PO & Auditor approved" },
  ],
  LIFETIME: [
    { target: 14200, suffix: "+", label: "NSS Records Merged", decimals: 0, sub: "Historical records digitized" },
    { target: 76.5, prefix: "₹", suffix: "L+", label: "Camp & Unit Funds Handled", decimals: 1, sub: "Lifetime audited grants" },
    { target: 100, suffix: "%", label: "Uptime & Secure Access", decimals: 0, sub: "Zero audit discrepancy" },
    { target: 5.0, suffix: "/5.0", label: "Satisfaction Rating", decimals: 1, sub: "SPPU Unit benchmark" },
  ],
};

const NSS_CAMPS_SHOWCASE = [
  {
    id: "camp",
    title: "7-Day Annual Special Residential Camp",
    category: "Special Camping Programme",
    budget: "₹45,000 Allocation",
    desc: "Comprehensive 7-day rural immersion camp in adopted village. Covers village survey, watershed management, sanitation campaigns, and school teaching.",
    icon: Tent,
    color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
    badge: "Rural Camp",
  },
  {
    id: "blood",
    title: "Mega Blood Donation & Health Camp",
    category: "Regular Activity",
    budget: "₹15,000 Allocation",
    desc: "Annual mega blood donation drive in association with Pune Blood Banks & Red Cross. 350+ blood units collected and audited with digital donor ledgers.",
    icon: Heart,
    color: "from-red-500/20 to-red-600/10 border-red-500/30 text-red-700 dark:text-red-300",
    badge: "Healthcare",
  },
  {
    id: "tree",
    title: "Van Mahotsav Tree Plantation Drive",
    category: "Environmental Drive",
    budget: "₹12,000 Allocation",
    desc: "Eco-conservation campaign planting 500+ indigenous saplings on Taljai hills and campus periphery, supported by geo-tagged plant tracking.",
    icon: TreePine,
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    badge: "Eco Service",
  },
  {
    id: "swachh",
    title: "Swachh Bharat Cleanliness Rally",
    category: "Community Action",
    budget: "₹10,000 Allocation",
    desc: "Public awareness rallies, waste segregation drives, and river bank cleaning with student volunteer groups.",
    icon: Zap,
    color: "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-700 dark:text-sky-300",
    badge: "Clean India",
  },
];

export default function Home() {
  const [statsPeriod, setStatsPeriod] = useState("CURRENT_AY");
  const [activeCampTab, setActiveCampTab] = useState("camp");

  const activeStats = STATS_DATA[statsPeriod];
  const selectedCamp = NSS_CAMPS_SHOWCASE.find((c) => c.id === activeCampTab) || NSS_CAMPS_SHOWCASE[0];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-900 selection:text-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Dynamic Animated Stats Section */}
      <section id="impact" className="py-20 bg-slate-50/80 dark:bg-slate-900/50 border-y border-blue-900/10 dark:border-blue-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-950 dark:text-white">
                Live NSS Financial &amp; Community Impact
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time metrics computed dynamically across all PVG&apos;s COET, PUNE unit ledgers
              </p>
            </div>

            {/* Dynamic Period Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-white dark:bg-slate-800 border border-blue-900/20 dark:border-blue-700/40 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setStatsPeriod("CURRENT_AY")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statsPeriod === "CURRENT_AY"
                    ? "bg-blue-950 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                AY 2025–26 Cycle
              </button>
              <button
                onClick={() => setStatsPeriod("LIFETIME")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statsPeriod === "LIFETIME"
                    ? "bg-blue-950 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Lifetime Unit Impact
              </button>
            </div>
          </div>

          {/* Dynamic Counters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeStats.map((stat, index) => (
              <motion.div
                key={`${statsPeriod}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <Card className="border-blue-900/15 dark:border-blue-900/30 bg-card hover:shadow-md transition-shadow p-6 relative overflow-hidden">
                  <div className="space-y-2">
                    <div className="text-3xl sm:text-4xl font-black text-blue-950 dark:text-blue-300 font-mono tracking-tight">
                      <AnimatedCounter
                        target={stat.target}
                        prefix={stat.prefix || ""}
                        suffix={stat.suffix || ""}
                        decimals={stat.decimals || 0}
                        duration={1.5}
                      />
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      {stat.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.sub}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic NSS Camps & Activities Explorer */}
      <section id="events" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40 text-xs mb-3 font-semibold">
              PVG&apos;s COET, PUNE NSS Cell
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-blue-950 dark:text-white">
              Tailored For Every NSS Camp &amp; Drive
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Organize budgets, track volunteer food &amp; travel receipts, and generate activity-specific audit ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left selector pills */}
            <div className="lg:col-span-5 space-y-3">
              {NSS_CAMPS_SHOWCASE.map((camp) => {
                const Icon = camp.icon;
                const isSelected = activeCampTab === camp.id;
                return (
                  <button
                    key={camp.id}
                    onClick={() => setActiveCampTab(camp.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-blue-950 text-white border-blue-900 shadow-md"
                        : "bg-card hover:bg-blue-50/50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-lg ${isSelected ? "bg-white/10 text-white" : "bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-300"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-snug">{camp.title}</div>
                        <div className={`text-xs ${isSelected ? "text-blue-200" : "text-muted-foreground"}`}>
                          {camp.category}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "translate-x-1" : "opacity-40"}`} />
                  </button>
                );
              })}
            </div>

            {/* Right preview card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCamp.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-card shadow-lg rounded-2xl relative">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 dark:border-blue-800 text-xs font-semibold px-3 py-1">
                          {selectedCamp.badge}
                        </Badge>
                        <span className="font-mono font-bold text-xs text-white bg-blue-950 dark:bg-blue-900 px-3 py-1 rounded-md shadow-xs">
                          {selectedCamp.budget}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedCamp.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                          {selectedCamp.desc}
                        </p>
                      </div>

                      {/* Camp features checklist with high contrast */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Separate Ledger Account</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Itemized Vouchers with OCR Proof</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Volunteer Reimbursement Tracking</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Official SPPU Printable Statement</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Ready to record expenses for this event?</span>
                        <Link href="/transaction/create">
                          <Button size="sm" className="bg-blue-950 hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-sm px-4">
                            <span>Add {selectedCamp.badge} Voucher</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/80 dark:bg-slate-900/50 border-t border-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-blue-950 dark:text-white">
              Everything You Need to Manage NSS Finances
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Engineered specifically for student treasurers, faculty Programme Officers, and university audit requirements at PVG&apos;s COET, PUNE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full border-blue-900/15 dark:border-blue-900/30 bg-card hover:shadow-md transition-shadow">
                  <CardContent className="space-y-3.5 p-6">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-300 w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-blue-950 dark:text-white">
              How It Works
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Three streamlined steps from physical voucher to verified university audit report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center space-y-4 relative">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded-2xl flex items-center justify-center mx-auto shadow-md ring-4 ring-blue-50 dark:ring-slate-800">
                  {step.icon}
                </div>
                <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  STEP 0{index + 1}
                </div>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50/80 dark:bg-slate-900/50 border-t border-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-blue-950 dark:text-white">
              What Senior Leaders &amp; POs Say
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Trusted by student welfare coordinators and past NSS treasurers at PVG&apos;s COET, PUNE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="border-blue-900/15 bg-card p-6 flex flex-col justify-between">
                <CardContent className="p-0 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-blue-100 shrink-0">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* High-Contrast CTA Section (Crisp and Vibrant in both Light and Dark mode) */}
      <section className="py-20 bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden border-t border-blue-900/40">
        <div className="container mx-auto px-4 text-center relative z-10 space-y-6 max-w-3xl">
          <Badge className="bg-amber-400 text-slate-950 border-amber-300 text-xs font-bold px-3 py-1 shadow-sm">
            PVG&apos;s COET, PUNE • NSS Cell
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Empower Your NSS Unit With Flawless Financial Governance
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Eliminate messy paper spreadsheets, track every camp rupee with verified receipts, and generate instant SPPU audit statements.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 shadow-xl text-sm h-12">
                Launch Treasurer Portal
              </Button>
            </Link>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeEC0SLtC00vevQNaffeuP9MFAF2kQyFizPileEQ4th_adSEQ/viewform?usp=publish-editor"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-2 border-white/80 font-bold px-7 shadow-lg text-sm h-12 backdrop-blur-md transition-all"
              >
                Join NSS Volunteer Wing
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
