'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import startupService, { GetStartupsResponse } from '../../../services/startupService';
import { Startup } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { Input } from '@/components/ui/input';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, cn, resolveMediaUrl, DEFAULT_LOGO } from '../../../lib/utils';

const startupSchema = z.object({
  startupName: z.string().min(2, 'Startup name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fundingStage: z.enum(['Ideation', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Bootstrapped']),
  website: z.string().url('Must be a valid URL starting with http:// or https://').or(z.literal('')),
  status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
});

type StartupSchema = z.infer<typeof startupSchema>;

export default function StartupsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [data, setData] = useState<GetStartupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
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
        search: debouncedSearch,
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
  }, [page, debouncedSearch, industry, fundingStage, statusFilter, scope]);

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
      status: 'Pending',
    },
  });

  const handleOpenCreateModal = () => {
    reset({
      startupName: '',
      industry: '',
      description: '',
      fundingStage: 'Ideation',
      website: '',
      status: user?.role === 'admin' ? 'Approved' : 'Pending',
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
      status: startup.status,
    });
    setSelectedLogo(null);
    setLogoPreview(startup.logo ? resolveMediaUrl(startup.logo) : null);
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
      
      if (formDataFields.status) {
        dataPayload.append('status', formDataFields.status);
      }

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">Venture Directory</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Manage and track incubator startups</p>
        </div>
        {(user?.role === 'founder' || user?.role === 'admin') && (
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary gap-2 text-xs font-black uppercase tracking-widest h-10 shadow-md"
          >
            <Plus className="w-4 h-4" />
            {user?.role === 'admin' ? 'Create Venture' : 'Add Venture'}
          </button>
        )}
      </div>

      {/* Scope Toggles for Founders */}
      {user?.role === 'founder' && (
        <div className="flex items-center bg-muted/20 border border-border/50 rounded-lg p-1 max-w-xs">
          <button
            onClick={() => { setScope('my'); setPage(1); }}
            className={cn(
              "flex-1 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all",
              scope === 'my' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Portfolio
          </button>
          <button
            onClick={() => { setScope('all'); setPage(1); }}
            className={cn(
              "flex-1 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all",
              scope === 'all' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Global Directory
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 border bg-card border-border/50 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ventures by name or sector..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="select-filter min-w-[140px]"
          >
            <option value="">All Sectors</option>
            <option value="SaaS">SaaS</option>
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="AI/ML">AI/ML</option>
            <option value="E-commerce">E-commerce</option>
            <option value="EdTech">EdTech</option>
          </select>

          <select
            value={fundingStage}
            onChange={(e) => setFundingStage(e.target.value)}
            className="select-filter min-w-[140px]"
          >
            <option value="">All Stages</option>
            <option value="Ideation">Ideation</option>
            <option value="Pre-Seed">Pre-Seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Bootstrapped">Bootstrapped</option>
          </select>

          {user?.role === 'admin' && (
            <div className="flex items-center bg-muted/20 border border-border/50 rounded-lg p-1">
              <button
                onClick={() => { setScope('all'); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                  scope === 'all' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Global
              </button>
              <button
                onClick={() => { setScope('my'); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                  scope === 'my' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Portfolio
              </button>
            </div>
          )}

          {(user?.role === 'admin' || scope === 'my') && (
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="select-premium min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="card-premium">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Venture Detail</th>
                <th>Technology Sector</th>
                <th>Funding Stage</th>
                <th>Review Status</th>
                <th>Activity Date</th>
                <th className="text-right">Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-8 px-4">
                      <div className="h-4 bg-muted/40 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data?.startups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-10 h-10 text-muted-foreground/30" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No ventures matched your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.startups.map((startup) => (
                  <tr key={startup._id} className="hover:bg-muted/10 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={startup.logo ? resolveMediaUrl(startup.logo) : DEFAULT_LOGO}
                          alt={startup.startupName}
                          className="w-9 h-9 rounded-lg border border-border bg-muted object-cover shadow-inner"
                          onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate uppercase tracking-tight">{startup.startupName}</h4>
                          <a
                            href={startup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-primary hover:underline flex items-center gap-1 font-bold uppercase tracking-tighter mt-0.5"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            Launch Site
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-primary">{startup.industry}</span>
                    </td>
                    <td>
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{startup.fundingStage}</span>
                    </td>
                    <td>
                      <span className={cn(
                        "badge-accent",
                        startup.status === 'Approved' && "bg-accent/20 text-accent border-accent/30",
                        startup.status === 'Pending' && "bg-primary/20 text-primary border-primary/30",
                        startup.status === 'Rejected' && "bg-destructive/20 text-destructive border-destructive/30"
                      )}>
                        {startup.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {formatDate(startup.createdAt)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(startup)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
                          title="Modify Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStartup(startup._id)}
                          className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-sm"
                          title="Revoke Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            Displaying <span>{(page - 1) * 10 + 1}-{Math.min(page * 10, data?.pagination?.totalItems || 0)}</span> of <span>{data?.pagination?.totalItems || 0}</span> Ventures
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
              disabled={!data || page * 10 >= (data.pagination?.totalItems || 0)}
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
          
          <div className="bg-card border border-border/50 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <h3 className="text-xl font-black text-foreground mb-1 uppercase tracking-tighter">
              {editingStartup ? 'Modify Venture' : 'Register Venture'}
            </h3>
            <p className="text-[10px] text-muted-foreground mb-8 uppercase font-bold tracking-widest">
              Enter organizational parameters below
            </p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
              {/* Logo Select */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="relative group cursor-pointer w-20 h-20 rounded-2xl border-2 border-border bg-muted/20 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-primary/50 transition-all">
                  <img
                    src={logoPreview || DEFAULT_LOGO}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LOGO;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-uploader" />
                <label htmlFor="logo-uploader" className="text-[10px] text-primary hover:underline font-bold cursor-pointer uppercase tracking-widest">
                  Identity Logo
                </label>
              </div>

              {/* Startup Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Venture Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Nexus AI"
                  {...register('startupName')}
                />
                {errors.startupName && (
                  <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.startupName.message}</span>
                )}
              </div>

              {/* Industry Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Sector</label>
                <select
                  {...register('industry')}
                  className="select-premium w-full"
                >
                  <option value="">Select Sector...</option>
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
                  <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.industry.message}</span>
                )}
              </div>

              {/* Funding Stage & Status Select */}
              <div className="grid gap-5 grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Venture Stage</label>
                  <select
                    {...register('fundingStage')}
                    className="select-premium w-full"
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

                {user?.role === 'admin' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Review Status</label>
                  <select
                    {...register('status')}
                    className="select-premium w-full"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                )}
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Digital Presence (URL)</label>
                <Input
                  type="text"
                  placeholder="e.g. https://www.nexusai.io"
                  {...register('website')}
                />
                {errors.website && (
                  <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.website.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Venture Thesis</label>
                <textarea
                  rows={4}
                  placeholder="Outline the product vision, target market, and milestones..."
                  {...register('description')}
                  className="w-full px-4 py-3 bg-muted/20 border border-border/50 rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-white font-medium resize-none transition-all"
                />
                {errors.description && (
                  <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">{errors.description.message}</span>
                )}
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/30 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Commit Venture'
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
