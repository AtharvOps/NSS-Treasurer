import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NSS Treasurer",
  description: "PVGCOET NSS Financial Data management Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/nss-bg-a.svg" sizes="any" />
        </head>
        <body className={inter.className}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4">
              <p>Made by young_vine_909</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}