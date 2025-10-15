import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow Pro - Professional Task Management",
  description: "Streamline your workflow with our professional task management system. Built for teams and individuals who demand excellence.",
  keywords: ["task management", "productivity", "team collaboration", "project management"],
  authors: [{ name: "TaskFlow Pro Team" }],
  creator: "TaskFlow Pro",
  publisher: "TaskFlow Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://taskflow-pro.com"),
  openGraph: {
    title: "TaskFlow Pro - Professional Task Management",
    description: "Streamline your workflow with our professional task management system.",
    url: "https://taskflow-pro.com",
    siteName: "TaskFlow Pro",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow Pro - Professional Task Management",
    description: "Streamline your workflow with our professional task management system.",
    creator: "@taskflowpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <div className="page-container">
          <Providers>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="page-footer">
              <div className="container">
                <div className="flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0">
                  <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                      Built with ❤️ by the TaskFlow Pro team. © 2024 TaskFlow Pro. All rights reserved.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a
                      href="/privacy"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="/terms"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Terms of Service
                    </a>
                    <a
                      href="/support"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </Providers>
        </div>
      </body>
    </html>
  );
}
