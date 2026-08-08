import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-4">
            <Image
              src="/nss-bg.png"
              alt="NSS Logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <span className="text-2xl font-semibold text-blue-950">
              NSS Treasurer
            </span>
          </Link>
        </div>

        {/* Navigation Links - Visible only when signed out */}
        <div className="hidden md:flex items-center space-x-8">
          <Show when="signed-out">
            <Link
              href="#features"
              className="text-gray-600 hover:text-blue-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-blue-900 transition-colors"
            >
              Testimonials
            </Link>
          </Show>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-900 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <a href="/transaction/create">
              <Button className="flex items-center gap-2 bg-blue-950 text-white hover:bg-blue-900">
                <PenBox size={18} />
                <span className="hidden md:inline ">Add Transaction</span>
              </Button>
            </a>
          </Show>
          <Show when="signed-out">
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
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