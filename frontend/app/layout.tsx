import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StartupHub – Startup Incubator & Project Management Platform",
  description: "A premium, production-ready SaaS dashboard for startup founders, mentors, and administrators to track venture progress, manage milestones, and analyze charts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: 'dark' }}
    >
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
