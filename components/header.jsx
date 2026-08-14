import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import Image from "next/image";
import { NssUnitBadge } from "./nss-unit-badge";
import { ThemeToggle } from "./theme-toggle";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-50 border-b border-blue-900/15 dark:border-blue-900/40">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 transition-transform group-hover:scale-105">
              <Image
                src="/nss-bg.png"
                alt="NSS Logo"
                width={44}
                height={44}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-blue-950 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors">
                NSS Treasurer
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 tracking-wider -mt-1 uppercase hidden sm:block">
                PVG&apos;s COET, PUNE
              </span>
            </div>
          </Link>

          {/* Unit pill in header */}
          <div className="hidden lg:block ml-2">
            <NssUnitBadge compact />
          </div>
        </div>

        {/* Navigation Links - Visible only when signed out */}
        <div className="hidden md:flex items-center space-x-8">
          <Show when="signed-out">
            <Link
              href="#features"
              className="text-gray-600 hover:text-blue-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Features
            </Link>
            <Link
              href="#impact"
              className="text-gray-600 hover:text-blue-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Impact
            </Link>
            <Link
              href="#events"
              className="text-gray-600 hover:text-blue-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Camps &amp; Drives
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-blue-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium text-sm"
            >
              Testimonials
            </Link>
          </Show>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-900 flex items-center gap-2"
            >
              <Button variant="outline" size="sm" className="border-blue-900/20 hover:bg-blue-50 dark:hover:bg-slate-800">
                <LayoutDashboard size={16} className="text-blue-900 dark:text-blue-300" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button size="sm" className="flex items-center gap-1.5 bg-blue-950 text-white hover:bg-blue-900 dark:bg-blue-900 dark:hover:bg-blue-800 shadow-sm">
                <PenBox size={16} />
                <span className="hidden sm:inline font-medium">Add Transaction</span>
              </Button>
            </Link>
          </Show>
          <Show when="signed-out">
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" size="sm" className="border-blue-950 text-blue-950 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800">
                Login
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-blue-900/20",
                },
              }}
            />
          </Show>
        </div>
      </nav>
    </header>
  );
};

export default Header;