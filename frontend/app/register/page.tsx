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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-6 py-12">
      {/* Branding Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-6 select-none">
        <div className="flex items-center justify-center w-7 h-7 rounded border border-zinc-800 bg-zinc-900 text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-white">
          StartupHub
        </span>
      </Link>

      {/* Main card */}
      <div className="max-w-md w-full p-8 rounded-xl border border-zinc-800 bg-zinc-900/30 shadow-sm space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight text-white">Create Account</h2>
          <p className="text-xs text-zinc-500 mt-1.5">Register as a startup founder to launch your profile</p>
        </div>

        {apiError && (
          <div className="p-3 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar upload wrapper */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-16 h-16 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center relative">
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
            <span className="text-[10px] text-zinc-500 font-medium">Upload profile photo (optional)</span>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              placeholder="Alex Carter"
              {...register('name')}
              className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 focus:outline-none focus:border-zinc-700 text-xs placeholder:text-zinc-600 transition-colors text-white"
            />
            {errors.name && (
              <span className="text-[11px] text-rose-400 font-medium">{errors.name.message}</span>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 focus:outline-none focus:border-zinc-700 text-xs placeholder:text-zinc-600 transition-colors text-white"
            />
            {errors.email && (
              <span className="text-[11px] text-rose-400 font-medium">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-zinc-800 bg-zinc-950 focus:outline-none focus:border-zinc-700 text-xs placeholder:text-zinc-600 transition-colors text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-rose-400 font-medium">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-xs shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center border-t border-zinc-800/60 pt-4">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Access Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
