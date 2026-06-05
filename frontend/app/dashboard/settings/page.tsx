'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import {
  User as UserIcon,
  Mail,
  Lock,
  Upload,
  Sun,
  Moon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, theme, setTheme, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profileImage || null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (data: ProfileSchema) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.password) {
        formData.append('password', data.password);
      }
      if (selectedPhoto) {
        formData.append('profileImage', selectedPhoto);
      }

      await updateUserProfile(formData);
      addToast('success', 'Profile Saved', 'Your account settings have been updated.');
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleThemeSelect = (mode: 'light' | 'dark') => {
    setTheme(mode);
    document.documentElement.className = mode;
    addToast('info', 'Theme Synced', `Visual display set to ${mode} mode.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-border/60 pb-5">
        <h2 className="text-xl font-bold text-foreground">Account Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure profile details, credentials, and visual display modes</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Forms Profile Settings */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm text-foreground">Profile Parameters</h3>
            <p className="text-xs text-muted-foreground mt-1">Update personal metadata and dashboard details</p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Avatar upload */}
            <div className="flex items-center gap-4 p-4 border border-border/50 bg-muted/10 rounded-xl">
              <div className="relative group cursor-pointer w-16 h-16 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-setting-uploader" />
                <label
                  htmlFor="photo-setting-uploader"
                  className="px-3.5 py-1.5 border border-border hover:bg-muted/40 text-xs text-muted-foreground font-bold rounded-lg cursor-pointer flex items-center gap-1.5 hover:text-foreground transition-all uppercase tracking-wider"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </label>
                <p className="text-[10px] text-muted-foreground/80 mt-1.5">JPG, PNG or WEBP. Max 4MB size.</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-muted-foreground" /> Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Carter"
                {...register('name')}
                className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
              />
              {errors.name && (
                <span className="text-[11px] text-rose-400 font-medium">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
              </label>
              <input
                type="email"
                placeholder="founder@example.com"
                {...register('email')}
                className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
              />
              {errors.email && (
                <span className="text-[11px] text-rose-400 font-medium">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-muted-foreground" /> Update Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-zinc-500 focus:outline-none focus:border-primary text-foreground"
              />
              {errors.password && (
                <span className="text-[11px] text-rose-400 font-medium">{errors.password.message}</span>
              )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Theme selections */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm text-foreground">Visual Theme Mode</h3>
            <p className="text-xs text-muted-foreground mt-1">Set the preferred display color theme</p>
          </div>

          <div className="grid gap-4 select-none">
            {/* Dark Mode toggle */}
            <button
              onClick={() => handleThemeSelect('dark')}
              className={cn(
                "flex items-center justify-between p-4 border rounded-2xl text-left transition-all",
                theme === 'dark'
                  ? 'border-primary bg-primary/5 text-foreground shadow-sm shadow-primary/5'
                  : 'border-border text-muted-foreground hover:bg-muted/10 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-indigo-400">
                  <Moon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Sleek Dark Theme</h4>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">High-contrast, easy-on-the-eyes layout</p>
                </div>
              </div>
              {theme === 'dark' && <Sparkles className="w-4 h-4 text-primary shrink-0" />}
            </button>

            {/* Light Mode toggle */}
            <button
              onClick={() => handleThemeSelect('light')}
              className={cn(
                "flex items-center justify-between p-4 border rounded-2xl text-left transition-all",
                theme === 'light'
                  ? 'border-primary bg-primary/5 text-foreground shadow-sm shadow-primary/5'
                  : 'border-border text-muted-foreground hover:bg-muted/10 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl border border-border/80 bg-muted/20 text-amber-500">
                  <Sun className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Clean Light Theme</h4>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">Classic high-visibility daytime styling</p>
                </div>
              </div>
              {theme === 'light' && <Sparkles className="w-4 h-4 text-primary shrink-0" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
