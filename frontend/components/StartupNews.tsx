'use client';

import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import newsService from '../services/newsService';
import { Globe, ArrowUpRight, Newspaper } from 'lucide-react';

export default function StartupNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getNews();
        setNews(data.news);
      } catch (error) {
        console.error('Failed to load startup news feed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="p-5 border bg-card border-border/50 rounded-xl shadow-sm h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Startup & Tech Trends</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-medium">Aggregated tech intelligence</p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-secondary border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">
          <Globe className="w-3 h-3 text-primary" /> LIVE
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-border/50 rounded-xl space-y-2.5 animate-pulse bg-muted/10">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/4" />
              <div className="h-2.5 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <Newspaper className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No articles found</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-2">
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 border border-border/50 hover:border-primary/30 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all group shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug uppercase tracking-tight">
                  {item.title}
                </h4>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                <span className="text-accent">{item.source}</span>
                <span className="text-muted-foreground/30">•</span>
                <span>{item.pubDate}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed font-medium">
                {item.description}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
