'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Menu, Sun, Moon, Sparkles, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { cn, resolveMediaUrl, DEFAULT_AVATAR } from '../lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { user, theme, setTheme, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Initialize theme class on mount
  useEffect(() => {
    const localTheme = localStorage.getItem('startuphub_theme') as 'light' | 'dark' | null;
    const activeTheme = localTheme || 'dark';
    setTheme(activeTheme);
    document.documentElement.className = activeTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
  };

  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard Overview';
    
    const page = parts[1];
    switch (page) {
      case 'startups':
        return 'Startup Directory';
      case 'projects':
        return 'Projects & Milestones';
      case 'mentors':
        return 'Mentors Hub';
      case 'users':
        return 'User Accounts Portal';
      case 'settings':
        return 'Account & Profile Settings';
      default:
        return 'Dashboard Overview';
    }
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b bg-background border-border sticky top-0 z-30 shadow-sm">
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1 rounded text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-sm text-foreground md:text-base tracking-tight flex items-center gap-2 uppercase">
          {getPageTitle()}
          {pathname === '/dashboard' && (
            <span className="hidden md:inline-flex items-center gap-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary">
              Live
            </span>
          )}
        </h1>
      </div>

      {/* Action Bars: Theme toggle & user quick menu */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted/80 rounded-lg border border-border transition-all"
          aria-label="Toggle Theme Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-all text-xs font-semibold"
          >
            <img
              src={user?.profileImage ? resolveMediaUrl(user.profileImage) : DEFAULT_AVATAR}
              alt="Avatar"
              className="w-6 h-6 rounded-md object-cover bg-muted"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
            <span className="hidden sm:inline text-foreground">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>

          {/* Dropdown Box */}
          {dropdownOpen && (
            <>
              <div
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-card p-1 shadow-md z-50">
                <div className="px-3 py-1.5 border-b border-border/60">
                  <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <a
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  My Settings
                </a>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
