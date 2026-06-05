'use client';

import React from 'react';
import { ActivityLog } from '../types';
import { Building2, FolderKanban, Users2, Calendar } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

interface ActivityProps {
  activities: ActivityLog[];
}

export default function RecentActivity({ activities }: ActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'startup':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'project':
        return <FolderKanban className="w-4 h-4 text-violet-400" />;
      case 'mentor':
        return <Users2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'startup':
        return 'bg-zinc-900 text-indigo-400 border-zinc-800';
      case 'project':
        return 'bg-zinc-900 text-zinc-300 border-zinc-800';
      case 'mentor':
        return 'bg-zinc-900 text-zinc-300 border-zinc-800';
      default:
        return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div className="p-5 border bg-card border-border rounded-lg shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-foreground">Timeline Activity Feed</h3>
        <p className="text-[11px] text-muted-foreground">Recent incubator and startup updates</p>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-medium text-muted-foreground">No recent activity detected</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-2">
          {activities.map((act) => (
            <div key={act.id} className="flex gap-3.5 p-3 rounded-lg border border-border bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
              {/* Type Badge Icon */}
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded border shrink-0",
                getBadgeColor(act.type)
              )}>
                {getIcon(act.type)}
              </div>

              {/* Details text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-xs text-foreground uppercase tracking-wider">{act.title}</h4>
                  <span className="text-[9px] text-muted-foreground shrink-0">{formatDate(act.time)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
