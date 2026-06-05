'use client';

import React from 'react';
import { useToast, ToastMessage } from '../hooks/useToast';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/20 dark:bg-emerald-950/40 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/20 dark:bg-rose-950/40 text-rose-100',
    warning: 'border-amber-500/30 bg-amber-950/20 dark:bg-amber-950/40 text-amber-100',
    info: 'border-sky-500/30 bg-sky-950/20 dark:bg-sky-950/40 text-sky-100',
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-card shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300",
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-foreground">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-muted-foreground hover:text-foreground hover:bg-muted/30 p-1 rounded-lg transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
