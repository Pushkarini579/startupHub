'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import projectService, { GetProjectsResponse } from '../../../services/projectService';
import startupService from '../../../services/startupService';
import { Project, Startup, User } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Paperclip,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  User as UserIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, cn, resolveMediaUrl } from '../../../lib/utils';

const projectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['To Do', 'In Progress', 'Under Review', 'Completed']),
  deadline: z.string().min(1, 'Deadline is required'),
  startupId: z.string().min(1, 'Startup is required'),
  assignedUser: z.string().min(1, 'Assignee is required'),
});

type ProjectSchema = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState<GetProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [startupId, setStartupId] = useState('');

  // Dropdown list options
  const [startupsList, setStartupsList] = useState<Startup[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects({
        page,
        limit: 10,
        search: debouncedSearch,
        status,
        priority,
        startupId,
      });
      setData(res);
    } catch (err: any) {
      addToast('error', 'Failed to retrieve projects', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Founders see their owned startups; Admins see all approved startups
      const startupData = await startupService.getStartups({ scope: user?.role === 'admin' ? 'all' : 'my', limit: 100 });
      setStartupsList(startupData.startups);

      // Admins fetch user list. Founders can fetch user list or default assign tasks.
      // We list users so tasks can be assigned to different members.
      const userData = await projectService.getAssignees();
      setUsersList(userData.users);
    } catch (err) {
      console.warn('Failed to retrieve reference lists for forms:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, debouncedSearch, status, priority, startupId]);

  useEffect(() => {
    fetchDropdownData();
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectSchema>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'To Do',
      deadline: '',
      startupId: '',
      assignedUser: '',
    },
  });

  const handleOpenCreateModal = () => {
    reset({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'To Do',
      deadline: '',
      startupId: startupsList[0]?._id || '',
      assignedUser: user?.id || '',
    });
    setSelectedFile(null);
    setFileName(null);
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    const sId = typeof project.startupId === 'object' ? project.startupId._id : project.startupId;
    const uId = typeof project.assignedUser === 'object'
      ? (project.assignedUser.id || (project.assignedUser as { _id?: string })._id || '')
      : project.assignedUser;
    const formattedDate = project.deadline ? new Date(project.deadline).toISOString().substring(0, 10) : '';

    reset({
      title: project.title,
      description: project.description,
      priority: project.priority,
      status: project.status,
      deadline: formattedDate,
      startupId: sId,
      assignedUser: uId,
    });
    setSelectedFile(null);
    setFileName(project.attachment ? 'Current File Attached' : null);
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleFormSubmit = async (formDataFields: ProjectSchema) => {
    setActionLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('title', formDataFields.title);
      dataPayload.append('description', formDataFields.description);
      dataPayload.append('priority', formDataFields.priority);
      dataPayload.append('status', formDataFields.status);
      dataPayload.append('deadline', formDataFields.deadline);
      dataPayload.append('startupId', formDataFields.startupId);
      dataPayload.append('assignedUser', formDataFields.assignedUser);

      if (selectedFile) {
        dataPayload.append('attachment', selectedFile);
      }

      if (editingProject) {
        await projectService.updateProject(editingProject._id, dataPayload);
        addToast('success', 'Project Task Updated', 'Changes were saved successfully.');
      } else {
        await projectService.createProject(dataPayload);
        addToast('success', 'Project Task Created', 'New task added to project board.');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      addToast('error', 'Operation Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusChange = async (project: Project, newStatus: Project['status']) => {
    try {
      const dataPayload = new FormData();
      dataPayload.append('status', newStatus);
      await projectService.updateProject(project._id, dataPayload);
      addToast('success', 'Status Updated', `Task set to "${newStatus}".`);
      fetchProjects();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project task?')) {
      return;
    }
    try {
      await projectService.deleteProject(id);
      addToast('success', 'Task Deleted', 'The task has been deleted.');
      fetchProjects();
    } catch (err: any) {
      addToast('error', 'Deletion Failed', err.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Under Review':
        return <AlertCircle className="w-4 h-4 text-pink-400" />;
      case 'In Progress':
        return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
      default:
        return <FolderKanban className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">Project Pipeline</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Manage tasks and venture milestones</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary gap-2 text-xs font-black uppercase tracking-widest h-10 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Initiate Project
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border bg-card border-border/50 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks by title or milestone..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/50 rounded-lg text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="select-filter min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="select-filter min-w-[140px]"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={startupId}
            onChange={(e) => { setStartupId(e.target.value); setPage(1); }}
            className="select-filter min-w-[160px]"
          >
            <option value="">All Ventures</option>
            {startupsList.map((s) => (
              <option key={s._id} value={s._id}>{s.startupName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects List Card View */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted/20 border border-border/50 rounded-xl animate-pulse" />
          ))
        ) : data?.projects.length === 0 ? (
          <div className="col-span-full py-20 text-center card-premium">
            <FolderKanban className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No projects matched your criteria</p>
          </div>
        ) : (
          data?.projects.map((project) => (
            <div key={project._id} className="card-premium p-5 flex flex-col justify-between hover:border-primary/30 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "badge-accent",
                    project.priority === 'High' && "bg-destructive/10 text-destructive border-destructive/20",
                    project.priority === 'Medium' && "bg-primary/10 text-primary border-primary/20",
                    project.priority === 'Low' && "bg-accent/10 text-accent border-accent/20"
                  )}>
                    {project.priority} Priority
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    {typeof project.startupId === 'object' ? project.startupId.startupName : 'General'}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-bold text-sm text-foreground uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 font-medium">{project.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    project.status === 'Completed' ? "bg-accent/20 text-accent border-accent/30" : "bg-secondary text-muted-foreground border-border"
                  )}>
                    {project.status}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.deadline)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                    {typeof project.assignedUser === 'object' && project.assignedUser.profileImage ? (
                      <img src={resolveMediaUrl(project.assignedUser.profileImage)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {typeof project.assignedUser === 'object' ? project.assignedUser.name : 'Unassigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="px-6 py-4 border border-border/50 rounded-xl flex items-center justify-between bg-muted/5 mt-6">
          <p className="pagination-info">
            Displaying Page <span>{data.pagination.page}</span> of <span>{data.pagination.totalPages}</span>
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
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="pagination-btn"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Forms Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {editingProject ? 'Modify Project Task' : 'Create New Project'}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Establish project milestones and assign team members below.
            </p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Set up OAuth Endpoints"
                  {...register('title')}
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary text-foreground"
                />
                {errors.title && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.title.message}</span>
                )}
              </div>

              {/* Startup Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Startup Project Owner</label>
                <select
                  {...register('startupId')}
                  className="select-premium w-full"
                >
                  <option value="">Select organizational startup...</option>
                  {startupsList.map((s) => (
                    <option key={s._id} value={s._id}>{s.startupName}</option>
                  ))}
                </select>
                {errors.startupId && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.startupId.message}</span>
                )}
              </div>

              {/* Assignee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Assignee Target</label>
                <select
                  {...register('assignedUser')}
                  className="select-premium w-full"
                >
                  <option value="">Select team member...</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                  {/* Fallback option if user is not loaded */}
                  {!usersList.some((u) => u.id === user?.id) && (
                    <option value={user?.id}>{user?.name} (You)</option>
                  )}
                </select>
                {errors.assignedUser && (
                  <span className="text-[11px] text-rose-400 font-medium">{errors.assignedUser.message}</span>
                )}
              </div>

              {/* Priority & Status */}
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    {...register('priority')}
                    className="select-premium w-full"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Task Status</label>
                  <select
                    {...register('status')}
                    className="select-premium w-full"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Deadline & Upload */}
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Due Deadline</label>
                  <input
                    type="date"
                    {...register('deadline')}
                    className="w-full px-4 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:outline-none focus:border-primary text-muted-foreground cursor-pointer"
                  />
                  {errors.deadline && (
                    <span className="text-[11px] text-rose-400 font-medium">{errors.deadline.message}</span>
                  )}
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-xs font-semibold text-foreground mb-1.5">Attachment (e.g. Pitch PDF)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="attachment-uploader"
                    />
                    <label
                      htmlFor="attachment-uploader"
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-muted/20 hover:bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground font-semibold cursor-pointer truncate"
                    >
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      {fileName ? fileName : 'Upload File'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description Details</label>
                <textarea
                  rows={4}
                  placeholder="Outline the parameters, task steps, and expected deliverables..."
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
