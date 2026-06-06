'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Building2, FolderKanban, Users2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded border border-border bg-secondary text-primary shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-widest text-foreground uppercase">
              StartupHub
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-[10px] font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest"
            >
              Sign In
            </Link>
            <Button asChild variant="premium" size="sm" className="px-5 h-9">
              <Link href="/register" className="gap-2">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest mb-8 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" /> Professional Incubator Platform
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-[1.1] mb-8 uppercase">
          Incubate, Manage & Scale <br />
          <span className="text-muted-foreground/60">Your Portfolio Ventures</span>
        </h1>
        
        <p className="text-muted-foreground text-xs md:text-sm max-w-xl leading-relaxed mb-12 uppercase font-bold tracking-tight">
          A secure, structured management console for incubator operators, venture capitalists, and startup founders. Coordinate mentors, assign project milestones, and analyze portfolio progression.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-32">
          <Button asChild variant="premium" className="w-full sm:w-auto px-8 py-3.5">
            <Link href="/register">Create Founder Account</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest border border-border/50">
            <Link href="/login">Access Dashboard</Link>
          </Button>
        </div>

        {/* Feature Section Grid */}
        <div className="w-full border-t border-border/30 pt-20">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <Card className="border-border/30 hover:border-primary/20 hover:bg-muted/30 transition-all group shadow-sm bg-transparent">
              <CardHeader className="space-y-4 p-6">
                <div className="w-10 h-10 rounded-xl border border-border bg-secondary text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-xs">Startup Profiles</CardTitle>
                <CardDescription className="text-[11px] leading-relaxed lowercase font-medium tracking-tight normal-case">
                  Register company summaries, capitalization stages, URLs, and track approval pipelines with simple status changes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/30 hover:border-accent/20 hover:bg-muted/30 transition-all group shadow-sm bg-transparent">
              <CardHeader className="space-y-4 p-6">
                <div className="w-10 h-10 rounded-xl border border-border bg-secondary text-accent flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <CardTitle className="text-xs">Milestone Boards</CardTitle>
                <CardDescription className="text-[11px] leading-relaxed lowercase font-medium tracking-tight normal-case">
                  Track deliverable tasks, manage deadlines, assign stakeholders, and attach pitch decks or audits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/30 hover:border-primary/20 hover:bg-muted/30 transition-all group shadow-sm bg-transparent">
              <CardHeader className="space-y-4 p-6">
                <div className="w-10 h-10 rounded-xl border border-border bg-secondary text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Users2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-xs">Mentor Alignment</CardTitle>
                <CardDescription className="text-[11px] leading-relaxed lowercase font-medium tracking-tight normal-case">
                  Coordinate with industry mentors and assign them to portfolio startups based on specialized expertise areas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/30 hover:border-accent/20 hover:bg-muted/30 transition-all group shadow-sm bg-transparent">
              <CardHeader className="space-y-4 p-6">
                <div className="w-10 h-10 rounded-xl border border-border bg-secondary text-accent flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-xs">Operator Controls</CardTitle>
                <CardDescription className="text-[11px] leading-relaxed lowercase font-medium tracking-tight normal-case">
                  Global administrator controls to oversee portfolio health metrics, resolve startup approvals, and allocate mentors.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-20 flex items-center justify-between border-t border-border/30 px-8 max-w-7xl w-full mx-auto text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">
        <p>© {new Date().getFullYear()} StartupHub. Platform Security Tier A+.</p>
        <div className="flex gap-6">
          <span className="hover:text-primary cursor-pointer transition-colors">Venture Protection</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Platform Compliance</span>
        </div>
      </footer>
    </div>
  );
}
