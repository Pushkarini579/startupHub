'use client';

import React, { useEffect, useState } from 'react';
import analyticsService from '../../services/analyticsService';
import { AnalyticsResponse } from '../../types';
import DashboardCharts from '../../components/DashboardCharts';
import RecentActivity from '../../components/RecentActivity';
import StartupNews from '../../components/StartupNews';
import {
  Users,
  Building2,
  CheckCircle,
  FolderKanban,
  GraduationCap,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getAnalytics();
        setData(res);
      } catch (error: any) {
        addToast('error', 'Analytics Unavailable', error?.message || 'Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Aggregating Platform Intelligence...
        </span>
      </div>
    );
  }

  const cards = data?.cards || {
    totalUsers: 0,
    totalStartups: 0,
    activeStartups: 0,
    totalProjects: 0,
    completedProjects: 0,
    activeMentors: 0,
  };

  const stats = [
    {
      title: 'Total Users',
      value: cards.totalUsers,
      description: user?.role === 'admin' ? 'Total registered accounts' : 'Team members assigned to projects',
      icon: Users,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Total Startups',
      value: cards.totalStartups,
      description: user?.role === 'admin' ? 'Startups in incubator' : 'Startups owned by you',
      icon: Building2,
      color: 'text-accent bg-accent/10 border-accent/20',
    },
    {
      title: 'Approved Startups',
      value: cards.activeStartups,
      description: 'Active approved operations',
      icon: CheckCircle,
      color: 'text-accent bg-accent/10 border-accent/20',
    },
    {
      title: 'Total Projects',
      value: cards.totalProjects,
      description: 'Active task developments',
      icon: FolderKanban,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Completed Milestones',
      value: cards.completedProjects,
      description: 'Completed tasks and updates',
      icon: Sparkles,
      color: 'text-accent bg-accent/10 border-accent/20',
    },
    {
      title: 'Active Mentors',
      value: cards.activeMentors,
      description: 'Advisors providing guidance',
      icon: GraduationCap,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome banner */}
      <div className="flex flex-col gap-1.5 p-6 rounded-xl border bg-card border-border shadow-sm">
        <h2 className="text-xl font-bold text-foreground tracking-tight uppercase">
          Welcome back, {user?.name}
        </h2>
        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed font-medium">
          {user?.role === 'admin'
            ? 'Access incubator analytics, oversee startup registrations, connect mentors, and review recent platform milestones.'
            : 'Register startups, manage active projects, view assigned mentors, and keep up with news trends.'}
        </p>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 border bg-card border-border/50 rounded-xl shadow-sm flex items-start gap-3.5 hover:border-primary/30 transition-all hover:bg-muted/30"
            >
              <div className={`p-2.5 rounded-lg border shrink-0 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {stat.title}
                </span>
                <h3 className="text-2xl font-black text-foreground tracking-tighter mt-0.5">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 truncate font-medium">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics charts */}
      {data && (
        <DashboardCharts
          industryStats={data.charts.industryStats}
          stageStats={data.charts.stageStats}
          projectStatusStats={data.charts.projectStatusStats}
          growthData={data.charts.growthChartData}
          projectActivityData={data.charts.projectActivityChartData}
        />
      )}

      {/* Activities & News Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity activities={data?.activities || []} />
        <StartupNews />
      </div>
    </div>
  );
}
