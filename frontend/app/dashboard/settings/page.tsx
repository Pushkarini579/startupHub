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
  ShieldCheck,
} from 'lucide-react';
import { cn, resolveMediaUrl, DEFAULT_AVATAR } from '../../../lib/utils';

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.profileImage ? resolveMediaUrl(user.profileImage) : null
  );
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

      const updatedUser = await updateUserProfile(formData);
      setPhotoPreview(updatedUser.profileImage ? resolveMediaUrl(updatedUser.profileImage) : null);
      setSelectedPhoto(null);
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
      <div className="border-b border-border/50 pb-5">
        <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">Account Parameters</h2>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Configure profile identity and visual display</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Forms Profile Settings */}
        <div className="lg:col-span-2 bg-card border border-border/50 p-8 rounded-2xl shadow-sm space-y-8">
          <div>
            <h3 className="font-black text-xs text-foreground uppercase tracking-wider">Profile Metadata</h3>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Update personal information</p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Avatar upload */}
            <div className="flex items-center gap-6 p-5 border border-border/50 bg-muted/20 rounded-2xl shadow-inner">
              <div className="relative group cursor-pointer w-20 h-20 rounded-2xl border-2 border-border bg-muted overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary/50 transition-all">
                <img
                  src={photoPreview || DEFAULT_AVATAR}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-setting-uploader" />
                <label
                  htmlFor="photo-setting-uploader"
                  className="px-4 py-2 border border-border/50 hover:bg-muted/40 text-[10px] text-muted-foreground font-black rounded-xl cursor-pointer flex items-center gap-2 hover:text-primary transition-all uppercase tracking-widest bg-card shadow-sm active:scale-[0.98]"
                >
                  <Upload className="w-4 h-4" /> Identity Photo
                </label>
                <p className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-tighter">JPG, PNG or WEBP. Max 4MB size.</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-primary" /> Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Carter"
                {...register('name')}
                className="w-full px-4 py-3 bg-muted/20 border border-border/50 rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-white font-medium transition-all"
              />
              {errors.name && (
                <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" /> Primary Email
              </label>
              <input
                type="email"
                placeholder="alex@ventures.com"
                {...register('email')}
                className="w-full px-4 py-3 bg-muted/20 border border-border/50 rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-white font-medium transition-all"
              />
              {errors.email && (
                <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-primary" /> Update Credentials
              </label>
              <input
                type="password"
                placeholder="Leave blank to maintain current"
                {...register('password')}
                className="w-full px-4 py-3 bg-muted/20 border border-border/50 rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-white font-medium transition-all"
              />
              {errors.password && (
                <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.password.message}</span>
              )}
            </div>

            {/* Role Display (ReadOnly) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Access Level
              </label>
              <select
                disabled
                className="select-premium w-full opacity-70 cursor-not-allowed"
                value={user?.role}
              >
                <option value="admin">Platform Administrator</option>
                <option value="founder">Venture Founder</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 text-[10px] font-black uppercase tracking-widest shadow-md active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating Profile...
                </>
              ) : (
                'Commit Profile Changes'
              )}
            </button>
          </form>
        </div>

        {/* Right: Preferences and display */}
        <div className="space-y-8">
          {/* Visual Mode Preferences */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="font-black text-xs text-foreground uppercase tracking-wider">Visual Display</h3>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Select interface mode</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeSelect('light')}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                  theme === 'light' ? "border-primary bg-primary/5" : "border-border/50 bg-muted/10 hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  theme === 'light' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary"
                )}>
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Luminous</span>
              </button>

              <button
                onClick={() => handleThemeSelect('dark')}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                  theme === 'dark' ? "border-primary bg-primary/5" : "border-border/50 bg-muted/10 hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  theme === 'dark' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary"
                )}>
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Obsidian</span>
              </button>
            </div>
          </div>

          {/* Quick Support / Info */}
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-primary/5 group-hover:rotate-12 transition-transform duration-500" />
            <div className="relative z-10">
              <h3 className="font-black text-xs text-primary uppercase tracking-wider">Venture Intelligence</h3>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-medium">
                Your profile data is encrypted and managed according to incubator security protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
