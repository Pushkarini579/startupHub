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
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, cn, resolveMediaUrl, DEFAULT_AVATAR } from '../../../lib/utils';

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
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
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
        search: debouncedSearch,
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
  }, [page, debouncedSearch, role, currentUser]);

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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">Identity Management</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Control platform access and organizational roles</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary gap-2 text-xs font-black uppercase tracking-widest h-10 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Provision Account
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border bg-card border-border/50 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search accounts by name or email identity..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/50 rounded-lg text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="select-premium min-w-[200px]"
          >
            <option value="">All Access Levels</option>
            <option value="admin">Platform Admin</option>
            <option value="founder">Venture Founder</option>
          </select>
        </div>
      </div>

      {/* Users Data View */}
      <div className="card-premium">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Member Identity</th>
                <th>Role Assignment</th>
                <th>Registration Date</th>
                <th className="text-right">Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="py-8 px-4">
                      <div className="h-4 bg-muted/40 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : !data || data.users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserIcon className="w-10 h-10 text-muted-foreground/30" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No member profiles discovered</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profileImage ? resolveMediaUrl(u.profileImage) : DEFAULT_AVATAR}
                          alt={u.name}
                          className="w-9 h-9 rounded-lg border border-border bg-muted object-cover shadow-inner"
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate uppercase tracking-tight">{u.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium truncate">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        "badge-accent",
                        u.role === 'admin' ? "bg-primary/20 text-primary border-primary/30" : "bg-accent/20 text-accent border-accent/30"
                      )}>
                        {u.role === 'admin' ? 'Administrative' : 'Founder'}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === currentUser?.id}
                        className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.id === currentUser?.id ? "Cannot delete own session" : "Revoke Access"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/5">
          <p className="pagination-info">
            Displaying <span>{(page - 1) * 10 + 1}-{Math.min(page * 10, data?.pagination?.totalItems || 0)}</span> of <span>{data?.pagination?.totalItems || 0}</span> Members
          </p>
          <div className="pagination-container">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="pagination-btn"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <span className="pagination-btn pagination-btn-active w-8 h-8 flex items-center justify-center text-[10px] font-black">
                {page}
              </span>
            </div>
            <button
              disabled={!data || page >= (data.pagination?.totalPages || 1)}
              onClick={() => setPage(page + 1)}
              className="pagination-btn"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
                  <img
                    src={photoPreview || DEFAULT_AVATAR}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />
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
