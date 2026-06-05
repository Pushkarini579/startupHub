"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Startup_1 = require("../models/Startup");
const Project_1 = require("../models/Project");
const Mentor_1 = require("../models/Mentor");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startuphub';
const seedDatabase = async () => {
    try {
        console.log('Connecting to database for seeding...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Database connected successfully.');
        // 1. CLEAR EXISTING DATA
        console.log('Cleaning existing database collections...');
        await User_1.User.deleteMany({});
        await Startup_1.Startup.deleteMany({});
        await Project_1.Project.deleteMany({});
        await Mentor_1.Mentor.deleteMany({});
        console.log('Cleaned all collections.');
        // 2. CREATE USERS
        console.log('Creating users...');
        const salt = await bcryptjs_1.default.genSalt(10);
        const commonPassword = await bcryptjs_1.default.hash('password123', salt);
        // Create Admin
        const adminUser = await User_1.User.create({
            name: 'System Admin',
            email: 'admin@startuphub.com',
            password: commonPassword,
            role: 'admin',
            profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
        });
        // Create 5 Founders
        const founders = [];
        for (let i = 1; i <= 5; i++) {
            const founder = await User_1.User.create({
                name: `Founder Name ${i}`,
                email: `founder${i}@startuphub.com`,
                password: commonPassword,
                role: 'founder',
                profileImage: `https://images.unsplash.com/photo-${1500648767791 + i}?auto=format&fit=crop&q=80&w=200`,
            });
            founders.push(founder);
        }
        console.log(`Created 1 Admin user and 5 Founder users.`);
        // 3. CREATE STARTUPS
        console.log('Creating startups...');
        const industries = [
            'AI/ML',
            'Fintech',
            'Healthtech',
            'Clean Energy',
            'Cybersecurity',
            'SaaS',
            'Edtech',
            'Web3',
            'AR/VR',
            'Logistics',
        ];
        const fundingStages = [
            'Ideation',
            'Pre-Seed',
            'Seed',
            'Series A',
            'Series B',
            'Series C',
            'Bootstrapped',
        ];
        const startupNames = [
            'Nexus AI',
            'FinFlow',
            'BioSync Solutions',
            'EcoCharge Grid',
            'QuantumSafe',
            'SaaSify Core',
            'EduLearn Interactive',
            'Decentr Protocol',
            'MetaSpace VR',
            'CargoTrack',
        ];
        const startups = [];
        for (let i = 0; i < 10; i++) {
            // Assign 2 startups per founder (10 startups / 5 founders)
            const founderIndex = Math.floor(i / 2);
            const startup = await Startup_1.Startup.create({
                startupName: startupNames[i],
                industry: industries[i],
                description: `This is the official description for ${startupNames[i]}, a pioneering startup disrupting the ${industries[i]} market space with cutting-edge solutions and robust execution models.`,
                fundingStage: fundingStages[i % fundingStages.length],
                logo: `https://images.unsplash.com/photo-${1618005182384 + i}?auto=format&fit=crop&q=80&w=150`,
                founderId: founders[founderIndex]._id,
                status: i === 9 ? 'Pending' : 'Approved', // Let 1 startup be pending for admin review testing
                website: `https://www.${startupNames[i].toLowerCase().replace(/\s+/g, '')}.io`,
            });
            startups.push(startup);
        }
        console.log(`Created 10 startups (9 Approved, 1 Pending).`);
        // 4. CREATE PROJECTS
        console.log('Creating projects...');
        const projectStatuses = ['To Do', 'In Progress', 'Under Review', 'Completed'];
        const priorities = ['Low', 'Medium', 'High'];
        const projectTitles = [
            'Design High-Fidelity UI Mockups',
            'Build Authentication Endpoints',
            'Configure MDB Aggregations',
            'Launch Marketing Landing Page',
            'Initiate Seed Round Outreach',
            'Integrate Payment Gateways',
            'Implement Local Upload Storage',
            'Run User Interviews & Usability Tests',
            'Draft Business Development Strategy',
            'Establish CI/CD GitHub Workflows',
            'Draft Privacy Policy Guidelines',
            'Perform Penetration Security Scans',
            'Optimize React Bundling Overhead',
            'Establish Cloud Server Hosting',
            'Conduct Industry Legal Audit',
            'Design Dynamic Brand Kit Guidelines',
            'Create Customer Success SOPs',
            'Build Analytics Performance Widgets',
            'Deploy Real-time News Integrations',
            'Optimize DB Database Queries',
            'Set Up Logging & Telemetry Sentry',
            'Draft Seed Phase Pitch Deck PDF',
            'Recruit Frontend Intern Teams',
            'Publish API Documentation Guides',
            'Set Up GDPR Compliance Scans',
        ];
        for (let i = 0; i < 25; i++) {
            const startupIndex = i % 10;
            const startup = startups[startupIndex];
            // Assign project to the startup owner founder (so they can edit/complete their projects)
            const assignedUser = startup.founderId;
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + (i % 7) + 3); // deadlines set 3 to 10 days in the future
            await Project_1.Project.create({
                title: projectTitles[i],
                description: `This is the detailed description for the milestone task "${projectTitles[i]}". It needs to be completed thoroughly to support core startup milestones.`,
                priority: priorities[i % priorities.length],
                status: projectStatuses[i % projectStatuses.length],
                deadline,
                startupId: startup._id,
                assignedUser,
                attachment: i % 4 === 0 ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : '',
            });
        }
        console.log(`Created 25 projects across startups.`);
        // 5. CREATE MENTORS
        console.log('Creating mentors...');
        const expertiseAreas = [
            'Tech Architecture & Cloud Scale',
            'SaaS Growth Marketing & SEO',
            'Series Seed/A Venture Capital',
            'Product-Market Fit & Operations',
            'Startup Legal & IP Protection',
        ];
        const mentorNames = [
            'Sarah Jenkins',
            'David Chen',
            'Elena Rostova',
            'Marcus Aurelius',
            'Aisha Rahman',
        ];
        for (let i = 0; i < 5; i++) {
            // Assign to startup
            const startupIndex = i * 2; // spreads mentors across startups 0, 2, 4, 6, 8
            await Mentor_1.Mentor.create({
                name: mentorNames[i],
                expertise: expertiseAreas[i],
                email: `${mentorNames[i].toLowerCase().replace(/\s+/g, '')}@incubator.com`,
                profileImage: `https://images.unsplash.com/photo-${1534528741775 + i}?auto=format&fit=crop&q=80&w=200`,
                startupAssigned: startups[startupIndex]._id,
            });
        }
        console.log(`Created 5 mentors.`);
        console.log('Database seeding completed successfully.');
        mongoose_1.default.connection.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Error during database seeding:', error);
        mongoose_1.default.connection.close();
        process.exit(1);
    }
};
seedDatabase();
