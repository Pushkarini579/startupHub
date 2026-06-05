import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100';

export const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=100';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/** Rewrites backend-local upload URLs to the configured API origin. */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  // If it's already a relative path starting with /uploads/
  if (url.startsWith('/uploads/')) {
    return `${API_ORIGIN}${url}`;
  }

  // If it's an absolute URL pointing to localhost or 127.0.0.1 with /uploads/
  const isLocalUpload = (url.includes('localhost') || url.includes('127.0.0.1')) && url.includes('/uploads/');
  if (isLocalUpload) {
    const uploadsPath = url.substring(url.indexOf('/uploads/'));
    return `${API_ORIGIN}${uploadsPath}`;
  }

  // For external URLs (like Cloudinary), return as is
  return url;
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
