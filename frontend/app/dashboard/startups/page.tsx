'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import startupService, { GetStartupsResponse } from '../../../services/startupService';
import { Startup } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Globe,
  Loader2,
  Upload,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { formatDate, cn } from '../../../lib/utils';

const startupSchema = z.object({
  startupName: z.string().min(2, 'Startup name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fundingStage: z.enum(['Ideation', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Bootstrapped']),
  website: z.string().url('Must be a valid URL starting with http:// or https://').or(z.literal('')),
});

type StartupSchema = z.infer<typeof startupSchema>;

export default function StartupsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [data, setData] = useState<GetStartupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [fundingStage, setFundingStage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scope, setScope] = useState<'my' | 'all'>('my');

  // Modal forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Initialize page default scopes
  useEffect(() => {
    if (user?.role === 'admin') {
      setScope('all');
    }
  }, [user]);

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const res = await startupService.getStartups({
        page,
        limit: 10,
        search,
        industry,
        fundingStage,
        status: statusFilter,
        scope,
      });
      setData(res);
    } catch (err: any) {
      addToast('error', 'Failed to retrieve startups', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [page, search, industry, fundingStage, statusFilter, scope]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StartupSchema>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      startupName: '',
      industry: '',
      description: '',
      fundingStage: 'Ideation',
      website: '',
    },
  });

  const handleOpenCreateModal = () => {
    reset({
      startupName: '',
      industry: '',
      description: '',
      fundingStage: 'Ideation',
      website: '',
    });
    setSelectedLogo(null);
    setLogoPreview(null);
    setEditingStartup(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (startup: Startup) => {
    reset({
      startupName: startup.startupName,
      industry: startup.industry,
      description: startup.description,
      fundingStage: startup.fundingStage,
      website: startup.website,
    });
    setSelectedLogo(null);
    setLogoPreview(startup.logo || null);
    setEditingStartup(startup);
    setIsModalOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (formDataFields: StartupSchema) => {
    setActionLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('startupName', formDataFields.startupName);
      dataPayload.append('industry', formDataFields.industry);
      dataPayload.append('description', formDataFields.description);
      dataPayload.append('fundingStage', formDataFields.fundingStage);
      dataPayload.append('website', formDataFields.website);
      
      if (selectedLogo) {
        dataPayload.append('logo', selectedLogo);
      }

      if (editingStartup) {
        await startupService.updateStartup(editingStartup._id, dataPayload);
        addToast('success', 'Startup Profile Updated', 'Information has been saved successfully.');
      } else {
        await startupService.createStartup(dataPayload);
        addToast('success', 'Startup Registered', 'Your startup has been registered and is pending approval.');
      }
      setIsModalOpen(false);
      fetchStartups();
    } catch (err: any) {
      addToast('error', 'Operation Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveStatus = async (id: string, approveStatus: 'Approved' | 'Rejected') => {
    try {
      await startupService.approveStartup(id, approveStatus);
      addToast('success', `Startup ${approveStatus}`, `The startup has been marked as ${approveStatus}.`);
      fetchStartups();
    } catch (err: any) {
      addToast('error', 'Status Update Failed', err.message);
    }
  };

  const handleDeleteStartup = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this startup? All projects and files associated with it will be permanently removed.')) {
      return;
    }
    try {
      await startupService.deleteStartup(id);
      addToast('success', 'Startup Profile Deleted', 'The profile was successfully deleted.');
      fetchStartups();
    } catch (err: any) {
      addToast('error', 'Deletion Failed', err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header and triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Startup Registry</h2>
          <p className="text-xs text-muted-foreground">Manage and track incubator portfolio organizations</p>
        </div>
        {user?.role === 'founder' && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-xs shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Register Startup
          </button>
        )}
      </div>

      {/* Scope Toggles for Founders */}
      {user?.role === 'founder' && (
        <div className="flex gap-1.5 p-1 bg-zinc-900/40 border border-border rounded-lg max-w-xs select-none">
          <button
            onClick={() => { setScope('my'); setPage(1); }}
            className={cn(
              "flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all",
              scope === 'my' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            My Startups
          </button>
          <button
            onClick={() => { setScope('all'); setPage(1); }}
            className={cn(
              "flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all",
              scope === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Browse Approved
          </button>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-card p-3 rounded-lg border border-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search startup name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Industry filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={industry}
            onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="">All Industries</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Fintech">Fintech</option>
            <option value="Healthtech">Healthtech</option>
            <option value="Clean Energy">Clean Energy</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="SaaS">SaaS</option>
            <option value="Edtech">Edtech</option>
            <option value="Web3">Web3</option>
            <option value="AR/VR">AR/VR</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>

        {/* Funding Stage filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={fundingStage}
            onChange={(e) => { setFundingStage(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="">All Funding Stages</option>
            <option value="Ideation">Ideation</option>
            <option value="Pre-Seed">Pre-Seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="Bootstrapped">Bootstrapped</option>
          </select>
        </div>

        {/* Admin Approval Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Syncing directories...</span>
        </div>
      ) : !data || data.startups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border border-dashed rounded-lg">
          <Building2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-sm text-foreground mb-1">No Startups Found</h3>
          <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
            There are no startups matching your filter or scope requirements. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.startups.map((startup) => (
              <div
                key={startup._id}
                className="flex flex-col justify-between border bg-card border-border rounded-lg shadow-sm hover:border-zinc-700/80 transition-colors p-5"
              >
                {/* Logo and info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-10 h-10 rounded bg-muted/40 border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {startup.logo ? (
                        <img src={startup.logo} alt={startup.startupName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border tracking-wide",
                      getStatusBadge(startup.status)
                    )}>
                      {startup.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                      {startup.startupName}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-semibold uppercase tracking-wider">
                      <span>{startup.industry}</span>
                      <span>•</span>
                      <span>{startup.fundingStage}</span>
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {startup.description}
                  </p>

                  <div className="flex flex-col gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    {startup.website && (
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-foreground transition-colors truncate font-medium"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {startup.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Registered on {formatDate(startup.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Founder: {typeof startup.founderId === 'object' ? startup.founderId.name : 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* CRUD Controls based on Roles */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border/40 shrink-0">
                  {/* Founder actions for their own startups */}
                  {user?.role === 'founder' && scope === 'my' && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(startup)}
                        className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-all"
                        title="Edit Startup Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStartup(startup._id)}
                        className="p-2 border border-border text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Startup Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Admin actions (Approve, Reject, Delete) */}
                  {user?.role === 'admin' && (
                    <>
                      {startup.status !== 'Approved' && (
                        <button
                          onClick={() => handleApproveStatus(startup._id, 'Approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {startup.status !== 'Rejected' && (
                        <button
                          onClick={() => handleApproveStatus(startup._id, 'Rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteStartup(startup._id)}
                        className="p-2 border border-border text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Startup Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 select-none">
              <span className="text-xs text-muted-foreground">
                Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalItems} startups)
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
            <h3 className="text-lg font-bold text-foreground mb-1">
              {editingStartup ? 'Edit Startup Profile' : 'Register New Startup'}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Enter organizational parameters below to build the portfolio profile.
            </p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Logo Select */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="relative group cursor-pointer w-16 h-16 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-uploader" />
                <label htmlFor="logo-uploader" className="text-[10px] text-primary hover:underline font-bold cursor-pointer uppercase tracking-wider">
                  Upload logo image
                </label>
              </div>

              {/* Startup Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Startup Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nexus AI"
                  {...register('startupName')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
                />
                {errors.startupName && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.startupName.message}</span>
                )}
              </div>

              {/* Industry Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Industry / Market Vertical</label>
                <select
                  {...register('industry')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select industry vertical...</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Healthtech">Healthtech</option>
                  <option value="Clean Energy">Clean Energy</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Edtech">Edtech</option>
                  <option value="Web3">Web3</option>
                  <option value="AR/VR">AR/VR</option>
                  <option value="Logistics">Logistics</option>
                </select>
                {errors.industry && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.industry.message}</span>
                )}
              </div>

              {/* Funding Stage Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Funding Stage</label>
                <select
                  {...register('fundingStage')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Ideation">Ideation</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="Bootstrapped">Bootstrapped</option>
                </select>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Website URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.nexusai.io"
                  {...register('website')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
                />
                {errors.website && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.website.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description Summary</label>
                <textarea
                  rows={4}
                  placeholder="Outline the product vision, target market vertical, and milestones..."
                  {...register('description')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground resize-none"
                />
                {errors.description && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.description.message}</span>
                )}
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
