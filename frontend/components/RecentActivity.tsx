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
        return <Building2 className="w-4 h-4 text-primary" />;
      case 'project':
        return <FolderKanban className="w-4 h-4 text-accent" />;
      case 'mentor':
        return <Users2 className="w-4 h-4 text-primary" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'startup':
        return 'bg-secondary text-primary border-primary/20';
      case 'project':
        return 'bg-secondary text-accent border-accent/20';
      case 'mentor':
        return 'bg-secondary text-primary border-primary/20';
      default:
        return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Timeline Activity Feed</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Recent incubator updates</p>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No activity detected</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-2">
          {activities.map((act) => (
            <div key={act.id} className="flex gap-3.5 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all hover:border-primary/20">
              {/* Type Badge Icon */}
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg border shrink-0",
                getBadgeColor(act.type)
              )}>
                {getIcon(act.type)}
              </div>

              {/* Details text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-[10px] text-foreground uppercase tracking-widest">{act.title}</h4>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter shrink-0">{formatDate(act.time)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed font-medium">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
