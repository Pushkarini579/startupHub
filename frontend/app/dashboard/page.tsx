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
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getAnalytics();
        setData(res);
      } catch (error) {
        console.error('Failed to load analytics dashboard data:', error);
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
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Total Startups',
      value: cards.totalStartups,
      description: user?.role === 'admin' ? 'Startups in incubator' : 'Startups owned by you',
      icon: Building2,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Approved Startups',
      value: cards.activeStartups,
      description: 'Active approved operations',
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Projects',
      value: cards.totalProjects,
      description: 'Active task developments',
      icon: FolderKanban,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Completed Milestones',
      value: cards.completedProjects,
      description: 'Completed tasks and updates',
      icon: Sparkles,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
      title: 'Active Mentors',
      value: cards.activeMentors,
      description: 'Advisors providing guidance',
      icon: GraduationCap,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome banner */}
      <div className="flex flex-col gap-1.5 p-6 rounded-lg border bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          Welcome back, {user?.name}
        </h2>
        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
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
              className="p-5 border bg-card border-border rounded-lg shadow-sm flex items-start gap-3.5 hover:border-zinc-700/80 transition-colors"
            >
              <div className={`p-2.5 rounded border shrink-0 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </span>
                <h3 className="text-xl font-bold text-foreground tracking-tight mt-0.5">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
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
