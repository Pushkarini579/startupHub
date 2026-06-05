'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import mentorService, { GetMentorsResponse } from '../../../services/mentorService';
import startupService from '../../../services/startupService';
import { Mentor, Startup } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import {
  Users2,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Award,
  Building2,
  Loader2,
  Upload,
} from 'lucide-react';
import { cn, resolveMediaUrl, DEFAULT_AVATAR } from '../../../lib/utils';

const mentorSchema = z.object({
  name: z.string().min(2, 'Mentor name must be at least 2 characters'),
  expertise: z.string().min(2, 'Expertise area is required'),
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  startupAssigned: z.string().min(1, 'Startup assignment is required'),
});

type MentorSchema = z.infer<typeof mentorSchema>;

export default function MentorsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState<GetMentorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [expertise, setExpertise] = useState('');
  const [scope, setScope] = useState<'my' | 'all'>('my');

  // Reference selections
  const [startupsList, setStartupsList] = useState<Startup[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setScope('all');
    }
  }, [user]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await mentorService.getMentors({
        page,
        limit: 10,
        search: debouncedSearch,
        expertise,
        scope,
      });
      setData(res);
    } catch (err: any) {
      addToast('error', 'Failed to retrieve mentors', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupsDropdown = async () => {
    try {
      // Admins assign mentors to any startup; founders view mentors assigned to their startups
      const startupData = await startupService.getStartups({ scope: user?.role === 'admin' ? 'all' : 'my', limit: 100 });
      setStartupsList(startupData.startups);
    } catch (err) {
      console.warn('Failed to load startup options:', err);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [page, debouncedSearch, expertise, scope]);

  useEffect(() => {
    fetchStartupsDropdown();
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MentorSchema>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      name: '',
      expertise: '',
      email: '',
      startupAssigned: '',
    },
  });

  const handleOpenCreateModal = () => {
    reset({
      name: '',
      expertise: '',
      email: '',
      startupAssigned: startupsList[0]?._id || '',
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setEditingMentor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mentor: Mentor) => {
    const sId = typeof mentor.startupAssigned === 'object' ? mentor.startupAssigned._id : mentor.startupAssigned;

    reset({
      name: mentor.name,
      expertise: mentor.expertise,
      email: mentor.email,
      startupAssigned: sId,
    });
    setSelectedPhoto(null);
    setPhotoPreview(mentor.profileImage ? resolveMediaUrl(mentor.profileImage) : null);
    setEditingMentor(mentor);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (formDataFields: MentorSchema) => {
    setActionLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formDataFields.name);
      dataPayload.append('expertise', formDataFields.expertise);
      dataPayload.append('email', formDataFields.email);
      dataPayload.append('startupAssigned', formDataFields.startupAssigned);

      if (selectedPhoto) {
        dataPayload.append('profileImage', selectedPhoto);
      }

      if (editingMentor) {
        await mentorService.updateMentor(editingMentor._id, dataPayload);
        addToast('success', 'Mentor Profile Updated', 'Information saved successfully.');
      } else {
        await mentorService.createMentor(dataPayload);
        addToast('success', 'Mentor Added', 'New mentor profile added successfully.');
      }
      setIsModalOpen(false);
      fetchMentors();
    } catch (err: any) {
      addToast('error', 'Operation Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMentor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this mentor profile?')) {
      return;
    }
    try {
      await mentorService.deleteMentor(id);
      addToast('success', 'Mentor Deleted', 'Profile removed successfully.');
      fetchMentors();
    } catch (err: any) {
      addToast('error', 'Deletion Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and tools */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mentor Network</h2>
          <p className="text-xs text-muted-foreground mt-1">Connect with industry experts and advisors</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 self-start sm:self-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 text-sm shrink-0"
          >
            <Plus className="w-4.5 h-4.5" /> Add Mentor
          </button>
        )}
      </div>

      {/* Scope select for Founders */}
      {user?.role === 'founder' && (
        <div className="flex gap-2 p-1 bg-muted/20 border border-border rounded-xl max-w-xs select-none">
          <button
            onClick={() => { setScope('my'); setPage(1); }}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              scope === 'my' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            My Mentors
          </button>
          <button
            onClick={() => { setScope('all'); setPage(1); }}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              scope === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Advisors
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mentor name..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:border-primary/80"
          />
        </div>

        {/* Expertise Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted-foreground" />
          <select
            value={expertise}
            onChange={(e) => { setExpertise(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary/80 appearance-none cursor-pointer"
          >
            <option value="">All Expertise Areas</option>
            <option value="Tech Architecture">Tech Architecture & Cloud Scale</option>
            <option value="SaaS Growth">SaaS Growth Marketing & SEO</option>
            <option value="Venture Capital">Series Seed/A Venture Capital</option>
            <option value="Product-Market Fit">Product-Market Fit & Operations</option>
            <option value="Legal">Startup Legal & IP Protection</option>
          </select>
        </div>
      </div>

      {/* Advisors Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Loading advisors...</span>
        </div>
      ) : !data || data.mentors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border border-dashed rounded-2xl">
          <Users2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-bold text-base text-foreground mb-1">No Mentors Found</h3>
          <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
            There are no mentors matching your search bounds. Create profiles via administrative accounts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.mentors.map((mentor) => (
              <div
                key={mentor._id}
                className="flex flex-col justify-between border bg-card border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group p-5"
              >
                <div className="space-y-4">
                  {/* Photo and general */}
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.profileImage ? resolveMediaUrl(mentor.profileImage) : DEFAULT_AVATAR}
                      alt={mentor.name}
                      className="w-14 h-14 rounded-xl border border-border object-cover bg-muted shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {mentor.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5 shrink-0 text-primary" /> {mentor.expertise}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                    <a
                      href={`mailto:${mentor.email}`}
                      className="flex items-center gap-2 hover:text-foreground transition-colors truncate font-medium"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {mentor.email}
                    </a>
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Assigned Startup: {typeof mentor.startupAssigned === 'object' ? mentor.startupAssigned.startupName : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls for Admin */}
                {user?.role === 'admin' && (
                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border/40 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(mentor)}
                      className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-all"
                      title="Edit Mentor Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMentor(mentor._id)}
                      className="p-2 border border-border text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Delete Mentor Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 select-none">
              <span className="text-xs text-muted-foreground">
                Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalItems} mentors)
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

      {/* Admin CRUD Overlay form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {editingMentor ? 'Modify Mentor Record' : 'Add New Mentor Profile'}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Input organizational expertise alignment parameters below.
            </p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Profile Image Select */}
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

              {/* Mentor Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mentor Full Name</label>
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

              {/* Expertise Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Expertise Vertical</label>
                <select
                  {...register('expertise')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select expertise domain...</option>
                  <option value="Tech Architecture & Cloud Scale">Tech Architecture & Cloud Scale</option>
                  <option value="SaaS Growth Marketing & SEO">SaaS Growth Marketing & SEO</option>
                  <option value="Series Seed/A Venture Capital">Series Seed/A Venture Capital</option>
                  <option value="Product-Market Fit & Operations">Product-Market Fit & Operations</option>
                  <option value="Startup Legal & IP Protection">Startup Legal & IP Protection</option>
                </select>
                {errors.expertise && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.expertise.message}</span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Contact Email Address</label>
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

              {/* Startup Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Startup Alignment</label>
                <select
                  {...register('startupAssigned')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select startup assignment...</option>
                  {startupsList.map((s) => (
                    <option key={s._id} value={s._id}>{s.startupName}</option>
                  ))}
                </select>
                {errors.startupAssigned && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.startupAssigned.message}</span>
                )}
              </div>

              {/* Form Actions */}
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
                    'Save Details'
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
