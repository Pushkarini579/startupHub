'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Users2,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const founderLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Startups', href: '/dashboard/startups', icon: Building2 },
    { name: 'Projects & Tasks', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'My Mentors', href: '/dashboard/mentors', icon: Users2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Admin Hub', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Startups', href: '/dashboard/startups', icon: Building2 },
    { name: 'Manage Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Manage Mentors', href: '/dashboard/mentors', icon: Users2 },
    { name: 'Manage Users', href: '/dashboard/users', icon: ShieldCheck },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const links = user?.role === 'admin' ? adminLinks : founderLinks;

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-60 border-r bg-zinc-950 border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen shrink-0",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-14 px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex items-center justify-center w-6 h-6 rounded border border-zinc-800 bg-zinc-900 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs tracking-tight text-white uppercase">
              StartupHub
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground lg:hidden"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="p-4 border-b border-border bg-zinc-950/20">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'}
              alt="Avatar"
              className="w-8 h-8 rounded border border-border object-cover bg-muted"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-medium text-xs truncate text-foreground">{user?.name || 'Loading founder...'}</h4>
              <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1 font-medium mt-0.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full inline-block",
                  user?.role === 'admin' ? "bg-indigo-500" : "bg-zinc-500"
                )} />
                {user?.role} Account
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-all group duration-150 border",
                  isActive
                    ? 'bg-zinc-900 border-zinc-800 text-white shadow-sm'
                    : 'border-transparent text-muted-foreground hover:bg-zinc-900/30 hover:text-foreground'
                )}
              >
                <Icon className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200 shrink-0",
                  isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-border bg-zinc-950/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
