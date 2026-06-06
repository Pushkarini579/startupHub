'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_AVATAR } from '../../lib/utils';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerFounder } = useAuth();
  const { addToast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterSchema) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', 'founder'); // Registrations default to founder
      
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      await registerFounder(formData);
      addToast('success', 'Profile Created Successfully', 'Your account has been registered. Welcome to StartupHub.');
      router.push('/dashboard');
    } catch (err: any) {
      setApiError(err.message || 'Error creating account');
      addToast('error', 'Registration Failed', err.message || 'Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 py-12">
      {/* Branding Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-6 select-none">
        <div className="flex items-center justify-center w-7 h-7 rounded border border-border bg-secondary text-primary">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-bold text-sm tracking-widest text-white uppercase">
          StartupHub
        </span>
      </Link>

      {/* Main card */}
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-black tracking-tighter text-white uppercase">Create Account</h2>
          <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-bold tracking-widest">Register as a startup founder</p>
        </div>

        {apiError && (
          <div className="p-3 text-[10px] bg-destructive/10 text-destructive border border-destructive/20 rounded-lg font-bold uppercase tracking-wider">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar upload wrapper */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-16 h-16 rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center relative group-hover:border-primary/50 transition-all shadow-inner">
                <img
                  src={previewUrl || DEFAULT_AVATAR}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Identity Photo (Optional)</span>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              placeholder="Alex Carter"
              {...register('name')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:border-primary/50 text-xs placeholder:text-muted-foreground/50 transition-all text-white font-medium"
            />
            {errors.name && (
              <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.name.message}</span>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:border-primary/50 text-xs placeholder:text-muted-foreground/50 transition-all text-white font-medium"
            />
            {errors.email && (
              <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/20 focus:outline-none focus:border-primary/50 text-xs placeholder:text-muted-foreground/50 transition-all text-white font-medium pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-sm active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <span>Register Founder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            Already registered?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
              Access Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
