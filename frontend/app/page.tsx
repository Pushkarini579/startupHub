'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Building2, FolderKanban, Users2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded border border-zinc-800 bg-zinc-900 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              StartupHub
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-6">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Professional Incubator Platform
        </div>
        
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-tight mb-6">
          Incubate, Manage & Scale <br />
          <span className="text-zinc-400">Your Portfolio Ventures</span>
        </h1>
        
        <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed mb-10">
          A secure, structured management console for incubator operators, venture capitalists, and startup founders. Coordinate mentors, assign project milestones, and analyze portfolio progression.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-sm mb-24">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-3 rounded-lg transition-colors border border-indigo-700 shadow-sm"
          >
            Create Founder Account
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 font-medium text-sm px-6 py-3 rounded-lg transition-colors"
          >
            Access Dashboard
          </Link>
        </div>

        {/* Feature Section Grid */}
        <div className="w-full border-t border-zinc-900 pt-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="space-y-3 p-4 border border-transparent rounded-lg hover:border-zinc-900 hover:bg-zinc-900/10 transition-all">
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">Startup Profiles</h3>
              <p className="text-xs leading-relaxed text-zinc-500">
                Register company summaries, capitalization stages, URLs, and track approval pipelines with simple status changes.
              </p>
            </div>

            <div className="space-y-3 p-4 border border-transparent rounded-lg hover:border-zinc-900 hover:bg-zinc-900/10 transition-all">
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 flex items-center justify-center">
                <FolderKanban className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">Milestone Boards</h3>
              <p className="text-xs leading-relaxed text-zinc-500">
                Track deliverable tasks, manage deadlines, assign stakeholders, and attach pitch decks or audits.
              </p>
            </div>

            <div className="space-y-3 p-4 border border-transparent rounded-lg hover:border-zinc-900 hover:bg-zinc-900/10 transition-all">
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 flex items-center justify-center">
                <Users2 className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">Mentor Alignment</h3>
              <p className="text-xs leading-relaxed text-zinc-500">
                Coordinate with industry mentors and assign them to portfolio startups based on specialized expertise areas.
              </p>
            </div>

            <div className="space-y-3 p-4 border border-transparent rounded-lg hover:border-zinc-900 hover:bg-zinc-900/10 transition-all">
              <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">Operator Controls</h3>
              <p className="text-xs leading-relaxed text-zinc-500">
                Global administrator controls to oversee portfolio health metrics, resolve startup approvals, and allocate mentors.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-between border-t border-zinc-900 px-8 max-w-7xl w-full mx-auto text-zinc-600 text-xs">
        <p>© {new Date().getFullYear()} StartupHub. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-zinc-400 cursor-pointer">Security</span>
          <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
