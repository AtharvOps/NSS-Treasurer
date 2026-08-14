import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NSS Treasurer • PVG's COET, PUNE",
  description:
    "Official Financial Management, Camp Audit & Voucher Governance Portal for NSS Unit, PVG's COET, PUNE (Affiliated to SPPU).",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/nss-bg-a.svg" sizes="any" />
        </head>
        <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header */}
            <Header />

            {/* Main Page Area */}
            <main className="flex-1">{children}</main>

            {/* Sonner Toast Notifications (Top layer above drawers & modals) */}
            <Toaster
              richColors
              position="top-right"
              style={{ zIndex: 99999 }}
              toastOptions={{
                style: { zIndex: 99999 },
                className: "z-[99999] shadow-2xl",
              }}
            />

            {/* Official PVGCOET NSS Footer */}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}