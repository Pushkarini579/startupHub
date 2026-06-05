'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import userService, { GetUsersResponse } from '../../../services/userService';
import { User } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Trash2,
  Mail,
  Calendar,
  Loader2,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import { formatDate, cn } from '../../../lib/utils';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'founder']),
});

type UserSchema = z.infer<typeof userSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [data, setData] = useState<GetUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Enforce admin-only access on mount
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      addToast('error', 'Unauthorized Access', 'You do not have administrative credentials.');
      router.push('/dashboard');
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        page,
        limit: 10,
        search,
        role,
      });
      setData(res);
    } catch (err: any) {
      addToast('error', 'Failed to retrieve users', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [page, search, role, currentUser]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'founder',
    },
  });

  const handleOpenCreateModal = () => {
    reset({
      name: '',
      email: '',
      password: 'password123', // default prefill
      role: 'founder',
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (formDataFields: UserSchema) => {
    setActionLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formDataFields.name);
      dataPayload.append('email', formDataFields.email);
      dataPayload.append('password', formDataFields.password);
      dataPayload.append('role', formDataFields.role);

      if (selectedPhoto) {
        dataPayload.append('profileImage', selectedPhoto);
      }

      await userService.createUser(dataPayload);
      addToast('success', 'Account Created', 'A new user profile was generated successfully.');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      addToast('error', 'Operation Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      addToast('warning', 'Action Prohibited', 'You cannot delete your own session account.');
      return;
    }
    if (!window.confirm('Are you absolutely sure you want to delete this user? Cascade deletions will permanently delete all startups, project tasks, and assignments they own.')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      addToast('success', 'User Deleted', 'Account and associated records clean-deleted successfully.');
      fetchUsers();
    } catch (err: any) {
      addToast('error', 'Deletion Failed', err.message);
    }
  };

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header toolbars */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Directory</h2>
          <p className="text-xs text-muted-foreground mt-1">Audit, register, and manage incubator member accounts</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 self-start sm:self-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 text-sm shrink-0"
        >
          <Plus className="w-4.5 h-4.5" /> Create Account
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:border-primary/80"
          />
        </div>

        {/* Role select */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted-foreground" />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary/80 appearance-none cursor-pointer"
          >
            <option value="">All Account Roles</option>
            <option value="admin">Administrators</option>
            <option value="founder">Founders</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Loading user files...</span>
        </div>
      ) : !data || data.users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border border-dashed rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-bold text-base text-foreground mb-1">No Accounts Logged</h3>
          <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
            There are no users registered matching this filter search. Add profiles to database.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Profile Member</th>
                    <th className="p-4">Contact Email</th>
                    <th className="p-4">Account Role</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4 text-right pr-6">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 text-xs text-muted-foreground font-medium transition-colors">
                      {/* Member */}
                      <td className="p-4 pl-6 text-foreground flex items-center gap-3">
                        <img
                          src={u.profileImage || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100'}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover bg-muted border border-border"
                        />
                        <span className="font-bold text-sm truncate max-w-[150px]">{u.name}</span>
                      </td>

                      {/* Email */}
                      <td className="p-4 truncate max-w-[200px]">
                        <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {u.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className={cn(
                          "uppercase font-extrabold px-2 py-0.5 rounded-md border text-[9px] tracking-wider",
                          u.role === 'admin'
                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}>
                          {u.role}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {(u as any).createdAt ? formatDate((u as any).createdAt) : 'N/A'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6">
                        <button
                          disabled={u.id === currentUser?.id}
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 border border-border text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 select-none">
              <span className="text-xs text-muted-foreground">
                Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalItems} users)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3.5 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3.5 py-1.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRUD Overlay Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-foreground mb-1">Create Member Account</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Establish new incubator user or operator login credentials below.
            </p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Photo Select */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="relative group cursor-pointer w-16 h-16 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-uploader" />
                <label htmlFor="photo-uploader" className="text-[10px] text-primary hover:underline font-bold cursor-pointer uppercase tracking-wider">
                  Upload photo image
                </label>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  {...register('name')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
                />
                {errors.name && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.name.message}</span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. elena@incubator.com"
                  {...register('email')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
                />
                {errors.email && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.email.message}</span>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Account Password</label>
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

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Account Authority Role</label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="founder">Founder Account</option>
                  <option value="admin">Administrator Account</option>
                </select>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Generate Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
