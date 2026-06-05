'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ToastContainer from '../../components/ToastContainer';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, checkAuth, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // If there is no token in localStorage, route to login immediately
      const savedToken = localStorage.getItem('startuphub_token');
      if (!savedToken) {
        router.push('/login');
        return;
      }
      
      const currentUser = await checkAuth();
      if (!currentUser) {
        router.push('/login');
      } else {
        setAuthChecked(true);
      }
    };
    initAuth();
  }, [token]);

  // Show a premium loading screen while fetching auth session status
  if (loading || !authChecked || !user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b] text-zinc-100 z-50">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">
          Verifying Session Authority...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Layout */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic page children scroll viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
}
