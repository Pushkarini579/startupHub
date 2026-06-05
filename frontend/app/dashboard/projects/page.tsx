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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Projects & Tasks</h2>
          <p className="text-xs text-muted-foreground">Plan, manage, and execute incubator milestones</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          disabled={startupsList.length === 0}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-xs shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title={startupsList.length === 0 ? "You must have at least one startup to create a project" : ""}
        >
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-card p-3 rounded-lg border border-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Startup filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={startupId}
            onChange={(e) => { setStartupId(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer"
          >
            <option value="">All Startups</option>
            {startupsList.map((s) => (
              <option key={s._id} value={s._id}>{s.startupName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Rows Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Loading tasks...</span>
        </div>
      ) : !data || data.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border border-dashed rounded-lg">
          <FolderKanban className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-sm text-foreground mb-1">No Project Tasks</h3>
          <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
            There are no projects or tasks active in this section. Register a startup first and create tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {data.projects.map((project) => (
              <div
                key={project._id}
                className="flex flex-col justify-between border bg-card border-border rounded-lg shadow-sm hover:border-zinc-700/80 transition-colors p-5"
              >
                <div className="space-y-4">
                  {/* Row header */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {typeof project.startupId === 'object' ? project.startupId.startupName : 'Startup'}
                    </span>

                    {/* Quick status toggle dropdown */}
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(project.status)}
                      <select
                        value={project.status}
                        onChange={(e) => handleQuickStatusChange(project, e.target.value as any)}
                        className="text-xs font-semibold text-muted-foreground bg-transparent border-none focus:outline-none cursor-pointer hover:text-foreground"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h4 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                    {/* Priority Badge */}
                    <span className={cn(
                      "text-[9px] uppercase font-extrabold border px-2 py-0.5 rounded-md tracking-wider shrink-0",
                      getPriorityColor(project.priority)
                    )}>
                      {project.priority} Priority
                    </span>

                    {/* Deadline */}
                    <span className="flex items-center gap-1 shrink-0 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> Due {formatDate(project.deadline)}
                    </span>

                    {/* Assignee */}
                    <span className="flex items-center gap-1.5 shrink-0 truncate max-w-[150px] font-medium">
                      <UserIcon className="w-3.5 h-3.5" />
                      Assigned to {typeof project.assignedUser === 'object' ? project.assignedUser.name : 'User'}
                    </span>

                    {/* Document */}
                    {project.attachment && (
                      <a
                        href={resolveMediaUrl(project.attachment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline font-bold shrink-0"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> View Attachment
                      </a>
                    )}
                  </div>
                </div>

                {/* Edit Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border/40 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-all"
                    title="Edit Task Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="p-2 border border-border text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Delete Project Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 select-none">
              <span className="text-xs text-muted-foreground">
                Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalItems} tasks)
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
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
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
                  className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-xs text-muted-foreground focus:outline-none focus:border-primary cursor-pointer"
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
