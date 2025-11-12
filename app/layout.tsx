import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "YT Autopilot Agent",
  description: "End-to-end automation agent for scheduling and uploading YouTube content."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx(inter.variable, "min-h-screen bg-slate-950 text-slate-100 antialiased")}>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="pill bg-blue-500/10 text-blue-300">Automation Agent</span>
              <span className="pill border-green-500/40 bg-green-500/10 text-green-300">YouTube Ready</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
              Autopilot Studio for YouTube
            </h1>
            <p className="max-w-3xl text-lg text-slate-300">
              Plan, generate, schedule, and publish videos hands-free with AI-assisted pipelines, secure credential
              management, and automatic YouTube uploads.
            </p>
          </header>
          <main className="grid flex-1 gap-6 lg:grid-cols-[1.35fr,1fr]">{children}</main>
          <footer className="mt-auto border-t border-slate-800/60 pt-6 text-sm text-slate-500">
            <p>
              Configure a Vercel Cron job to `POST /api/cron` for autonomous publishing. Store credentials via encrypted
              environment variables before deploying.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
