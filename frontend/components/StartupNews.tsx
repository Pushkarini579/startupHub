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
    <div className="p-5 border bg-card border-border rounded-lg shadow-sm h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground">Global Startup & Tech Trends</h3>
          <p className="text-[11px] text-muted-foreground">Aggregated developer and incubator intelligence</p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium px-2 py-0.5 rounded">
          <Globe className="w-3 h-3 text-indigo-400" /> LIVE
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-border rounded-lg space-y-2.5 animate-pulse">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/4" />
              <div className="h-2.5 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <Newspaper className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-xs font-medium text-muted-foreground">No news articles found</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-2">
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 border border-border hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/30 rounded-lg transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-xs text-foreground group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
                  {item.title}
                </h4>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-400 transition-colors shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.pubDate}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
