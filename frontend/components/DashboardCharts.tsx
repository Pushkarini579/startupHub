'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartsProps {
  industryStats: ChartDataPoint[];
  stageStats: ChartDataPoint[];
  projectStatusStats: ChartDataPoint[];
  growthData: ChartDataPoint[];
  projectActivityData: ChartDataPoint[];
}

// Sleek aesthetic colors for light/dark themes
const GRADIENT_COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function DashboardCharts({
  industryStats,
  stageStats,
  projectStatusStats,
  growthData,
  projectActivityData,
}: ChartsProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border bg-card border-border rounded-2xl shadow-sm h-[380px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-1/4 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-56 bg-muted/40 rounded-xl animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Rendering charts...</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: Startup Registration Growth */}
      <div className="p-5 border bg-card border-border rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-foreground">Startup Growth Trend</h3>
          <p className="text-[11px] text-muted-foreground">Monthly incubator registrations</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                labelStyle={{ fontWeight: '600' }}
              />
              <Line type="monotone" dataKey="startups" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Project Deliverables Timeline */}
      <div className="p-5 border bg-card border-border rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-foreground">Monthly Tasks & Milestones</h3>
          <p className="text-[11px] text-muted-foreground">Aggregated project metrics</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                labelStyle={{ fontWeight: '600' }}
              />
              <Bar dataKey="projects" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Industry Distribution Pie */}
      <div className="p-5 border bg-card border-border rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-foreground">Industry Sector Distribution</h3>
          <p className="text-[11px] text-muted-foreground">Portfolio breakdown by technology focus</p>
        </div>
        <div className="h-64 w-full flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={industryStats}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {industryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 max-h-12 overflow-y-auto w-full px-2">
            {industryStats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: GRADIENT_COLORS[index % GRADIENT_COLORS.length] }}
                />
                <span className="truncate max-w-[100px]">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 4: Funding Stages Distribution Donut */}
      <div className="p-5 border bg-card border-border rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-foreground">Funding Rounds Progression</h3>
          <p className="text-[11px] text-muted-foreground">Incubator portfolio capitalization stages</p>
        </div>
        <div className="h-64 w-full flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageStats}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {stageStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[(index + 2) % GRADIENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 max-h-12 overflow-y-auto w-full px-2">
            {stageStats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: GRADIENT_COLORS[(index + 2) % GRADIENT_COLORS.length] }}
                />
                <span className="truncate max-w-[100px]">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
