"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const User_1 = require("../models/User");
const Startup_1 = require("../models/Startup");
const Project_1 = require("../models/Project");
const Mentor_1 = require("../models/Mentor");
const getAnalytics = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const isAdmin = req.user.role === 'admin';
        const userId = req.user._id;
        // Build filters based on role
        let startupQuery = {};
        let projectQuery = {};
        let mentorQuery = {};
        let userQuery = {};
        if (!isAdmin) {
            // Find startups owned by founder
            const myStartups = await Startup_1.Startup.find({ founderId: userId }).select('_id');
            const myStartupIds = myStartups.map((s) => s._id);
            startupQuery = { founderId: userId };
            projectQuery = { startupId: { $in: myStartupIds } };
            mentorQuery = { startupAssigned: { $in: myStartupIds } };
            // Count team members who are assigned to founder's projects
            const assignedUserIds = await Project_1.Project.distinct('assignedUser', projectQuery);
            userQuery = { _id: { $in: assignedUserIds } };
        }
        // 1. CARDS DATA
        const totalStartups = await Startup_1.Startup.countDocuments(startupQuery);
        const activeStartups = await Startup_1.Startup.countDocuments({ ...startupQuery, status: 'Approved' });
        const totalProjects = await Project_1.Project.countDocuments(projectQuery);
        const completedProjects = await Project_1.Project.countDocuments({ ...projectQuery, status: 'Completed' });
        const activeMentors = await Mentor_1.Mentor.countDocuments(mentorQuery);
        const totalUsers = isAdmin ? await User_1.User.countDocuments() : (await User_1.User.countDocuments(userQuery) + 1); // include self
        // 2. CHART: Industry Distribution
        const industryStats = await Startup_1.Startup.aggregate([
            { $match: startupQuery },
            { $group: { _id: '$industry', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } },
        ]);
        // 3. CHART: Funding Stage Distribution
        const stageStats = await Startup_1.Startup.aggregate([
            { $match: startupQuery },
            { $group: { _id: '$fundingStage', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } },
        ]);
        // 4. CHART: Project Status Distribution
        const projectStatusStats = await Project_1.Project.aggregate([
            { $match: projectQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { name: '$_id', value: '$count', _id: 0 } },
        ]);
        // 5. CHART: Startup Growth Chart (Created per month)
        // We group by year and month
        const growthStats = await Startup_1.Startup.aggregate([
            { $match: startupQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        // Format growthStats for recharts (e.g. "Jan 26")
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedGrowth = growthStats.map((item) => {
            const monthLabel = monthNames[item._id.month - 1];
            const shortYear = item._id.year.toString().slice(-2);
            return {
                name: `${monthLabel} ${shortYear}`,
                startups: item.count,
            };
        });
        // Fallback/Default growth structure if empty
        const growthChartData = formattedGrowth.length > 0 ? formattedGrowth : [
            { name: 'Jan 26', startups: 1 },
            { name: 'Feb 26', startups: 2 },
            { name: 'Mar 26', startups: 4 },
            { name: 'Apr 26', startups: 5 },
            { name: 'May 26', startups: 8 },
            { name: 'Jun 26', startups: totalStartups || 10 },
        ];
        // 6. CHART: Monthly Project Activity (Created per month)
        const projectActivityStats = await Project_1.Project.aggregate([
            { $match: projectQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const formattedProjectActivity = projectActivityStats.map((item) => {
            const monthLabel = monthNames[item._id.month - 1];
            const shortYear = item._id.year.toString().slice(-2);
            return {
                name: `${monthLabel} ${shortYear}`,
                projects: item.count,
            };
        });
        const projectActivityChartData = formattedProjectActivity.length > 0 ? formattedProjectActivity : [
            { name: 'Jan 26', projects: 2 },
            { name: 'Feb 26', projects: 5 },
            { name: 'Mar 26', projects: 8 },
            { name: 'Apr 26', projects: 12 },
            { name: 'May 26', projects: 18 },
            { name: 'Jun 26', projects: totalProjects || 25 },
        ];
        // 7. RECENT ACTIVITIES FEED
        // Startup registrations
        const recentStartups = await Startup_1.Startup.find(startupQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('founderId', 'name');
        // Project updates
        const recentProjects = await Project_1.Project.find(projectQuery)
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('startupId', 'startupName')
            .populate('assignedUser', 'name');
        // Mentor assignments
        const recentMentors = await Mentor_1.Mentor.find(mentorQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('startupAssigned', 'startupName');
        const activities = [];
        recentStartups.forEach((s) => {
            activities.push({
                id: s._id,
                type: 'startup',
                title: 'New Startup Registered',
                description: `"${s.startupName}" was created by ${s.founderId ? s.founderId.name : 'Founder'} (${s.status} approval status)`,
                time: s.createdAt,
            });
        });
        recentProjects.forEach((p) => {
            activities.push({
                id: p._id,
                type: 'project',
                title: 'Project Updated',
                description: `Task "${p.title}" for "${p.startupId.startupName}" set to "${p.status}" (Assigned to ${p.assignedUser ? p.assignedUser.name : 'Unassigned'})`,
                time: p.updatedAt,
            });
        });
        recentMentors.forEach((m) => {
            activities.push({
                id: m._id,
                type: 'mentor',
                title: 'Mentor Assigned',
                description: `Mentor ${m.name} (${m.expertise}) linked to startup "${m.startupAssigned.startupName}"`,
                time: m.createdAt,
            });
        });
        // Sort chronologically (newest first) and limit to 10
        const sortedActivities = activities
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 10);
        return res.status(200).json({
            cards: {
                totalUsers,
                totalStartups,
                activeStartups,
                totalProjects,
                completedProjects,
                activeMentors,
            },
            charts: {
                industryStats: industryStats.length > 0 ? industryStats : [
                    { name: 'SaaS', value: 3 },
                    { name: 'Fintech', value: 2 },
                    { name: 'AI/ML', value: 3 },
                    { name: 'Healthtech', value: 1 },
                    { name: 'Clean Energy', value: 1 },
                ],
                stageStats: stageStats.length > 0 ? stageStats : [
                    { name: 'Ideation', value: 2 },
                    { name: 'Pre-Seed', value: 3 },
                    { name: 'Seed', value: 3 },
                    { name: 'Series A', value: 2 },
                ],
                projectStatusStats: projectStatusStats.length > 0 ? projectStatusStats : [
                    { name: 'To Do', value: 5 },
                    { name: 'In Progress', value: 10 },
                    { name: 'Under Review', value: 4 },
                    { name: 'Completed', value: 6 },
                ],
                growthChartData,
                projectActivityChartData,
            },
            activities: sortedActivities,
        });
    }
    catch (error) {
        console.error('Get Analytics Error:', error);
        return res.status(500).json({ message: 'Server error generating analytics' });
    }
};
exports.getAnalytics = getAnalytics;
