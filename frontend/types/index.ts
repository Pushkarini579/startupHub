export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'founder';
  profileImage: string;
}

export interface Startup {
  _id: string;
  startupName: string;
  industry: string;
  description: string;
  fundingStage: 'Ideation' | 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Bootstrapped';
  logo: string;
  founderId: User | string;
  status: 'Pending' | 'Approved' | 'Rejected';
  website: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Under Review' | 'Completed';
  deadline: string;
  startupId: Startup | string;
  assignedUser: User | string;
  attachment: string;
  createdAt: string;
}

export interface Mentor {
  _id: string;
  name: string;
  expertise: string;
  email: string;
  profileImage: string;
  startupAssigned: Startup | string;
  createdAt: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

export interface AnalyticsCards {
  totalUsers: number;
  totalStartups: number;
  activeStartups: number;
  totalProjects: number;
  completedProjects: number;
  activeMentors: number;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  startups?: number;
  projects?: number;
}

export interface ActivityLog {
  id: string;
  type: 'startup' | 'project' | 'mentor';
  title: string;
  description: string;
  time: string;
}

export interface AnalyticsResponse {
  cards: AnalyticsCards;
  charts: {
    industryStats: ChartDataPoint[];
    stageStats: ChartDataPoint[];
    projectStatusStats: ChartDataPoint[];
    growthChartData: ChartDataPoint[];
    projectActivityChartData: ChartDataPoint[];
  };
  activities: ActivityLog[];
}
