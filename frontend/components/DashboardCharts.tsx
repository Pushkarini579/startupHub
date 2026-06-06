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

// Aurelian Technical palette colors
const GRADIENT_COLORS = ['#E4C12F', '#23D19E', '#133A30', '#D1E8E2', '#0F2923', '#E4C12F', '#23D19E'];

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="h-64 w-full flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{message}</p>
    </div>
  );
}

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
          <div key={i} className="p-6 border bg-card border-border/50 rounded-xl shadow-sm h-[380px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-1/4 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-56 bg-muted/40 rounded-xl animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Rendering analytics...</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: Startup Registration Growth */}
      <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm hover:border-primary/20 transition-all">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Startup Growth Trend</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Monthly incubator registrations</p>
        </div>
        <div className="h-64 w-full">
          {growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0A1F1A', border: '1px solid #133A30', borderRadius: '8px', fontSize: '10px', color: '#D1E8E2' }}
                labelStyle={{ fontWeight: '700', textTransform: 'uppercase' }}
              />
              <Line type="monotone" dataKey="startups" stroke="#E4C12F" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4, fill: '#E4C12F' }} />
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No registration metrics available" />
          )}
        </div>
      </div>

      {/* Chart 2: Project Deliverables Timeline */}
      <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm hover:border-accent/20 transition-all">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Tasks & Milestones</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Aggregated project metrics</p>
        </div>
        <div className="h-64 w-full">
          {projectActivityData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0A1F1A', border: '1px solid #133A30', borderRadius: '8px', fontSize: '10px', color: '#D1E8E2' }}
                labelStyle={{ fontWeight: '700', textTransform: 'uppercase' }}
              />
              <Bar dataKey="projects" fill="#23D19E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No activity metrics available" />
          )}
        </div>
      </div>

      {/* Chart 3: Industry Distribution Pie */}
      <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm hover:border-primary/20 transition-all">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Industry Sector Distribution</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Portfolio technology focus</p>
        </div>
        <div className="h-64 w-full flex flex-col items-center justify-center">
          {industryStats.length > 0 ? (
          <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={industryStats}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {industryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0A1F1A', border: '1px solid #133A30', borderRadius: '8px', fontSize: '10px', color: '#D1E8E2' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {industryStats.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GRADIENT_COLORS[index % GRADIENT_COLORS.length] }}></div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
          </>
          ) : (
            <ChartEmptyState message="No sector distribution data" />
          )}
        </div>
      </div>

      {/* Chart 4: Startup Stage Distribution */}
      <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm hover:border-accent/20 transition-all">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Venture Stage Breakdown</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Current incubator pipeline</p>
        </div>
        <div className="h-64 w-full">
          {stageStats.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: '#0A1F1A', border: '1px solid #133A30', borderRadius: '8px', fontSize: '10px', color: '#D1E8E2' }}
              />
              <Bar dataKey="value" fill="#E4C12F" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No stage distribution data" />
          )}
        </div>
      </div>

      {/* Chart 5: Project Status Distribution */}
      <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm md:col-span-2 hover:border-primary/20 transition-all">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Project Status Breakdown</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Tasks grouped by workflow status</p>
        </div>
        <div className="h-64 w-full">
          {projectStatusStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0A1F1A', border: '1px solid #133A30', borderRadius: '8px', fontSize: '10px', color: '#D1E8E2' }}
                  labelStyle={{ fontWeight: '700', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" fill="#23D19E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No status metrics available" />
          )}
        </div>
      </div>
    </div>
  );
}
