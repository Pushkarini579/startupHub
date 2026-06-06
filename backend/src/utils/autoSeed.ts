import { User } from '../models/User';
import { Startup } from '../models/Startup';
import { Project } from '../models/Project';
import { Mentor } from '../models/Mentor';
import bcrypt from 'bcryptjs';

/**
 * Auto-seeds the database with demo data for a recruiter/admin experience.
 * Requirements:
 * 1. Exactly one recruiter/demo account: admin@startuphub.com
 * 2. Seed demo data (Startups, Projects, Mentors) only for the demo environment.
 * 3. New users should start with a clean workspace.
 * 4. Run only when database is empty.
 */
export const autoSeed = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    // 1. Ensure the primary Recruiter/Admin account exists
    let adminUser = await User.findOne({ email: 'admin@startuphub.com' });
    if (!adminUser) {
      console.log('[AutoSeed] Admin account missing. Creating...');
      adminUser = await User.create({
        name: 'System Admin (Demo)',
        email: 'admin@startuphub.com',
        password: commonPassword,
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
      });
      console.log('[AutoSeed] Admin account created.');
    } else {
      console.log('[AutoSeed] Admin account already exists.');
    }

    // 2. Ensure a hidden Demo Founder exists to own the seeded data
    let demoFounder = await User.findOne({ email: 'demo.founder@startuphub.internal' });
    if (!demoFounder) {
      console.log('[AutoSeed] Demo Founder missing. Creating...');
      demoFounder = await User.create({
        name: 'Demo Founder',
        email: 'demo.founder@startuphub.internal',
        password: commonPassword,
        role: 'founder',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      });
      console.log('[AutoSeed] Demo Founder created.');
    }

    // 3. Ensure Demo Startups exist
    const industries = ['AI/ML', 'Fintech', 'Healthtech', 'Clean Energy'];
    const fundingStages = ['Series A', 'Seed', 'Pre-Seed', 'Ideation'] as const;
    const startupNames = ['Nexus AI', 'FinFlow', 'BioSync', 'EcoCharge'];

    const startups = [];
    for (let i = 0; i < 4; i++) {
      let startup = await Startup.findOne({ startupName: startupNames[i] });
      if (!startup) {
        console.log(`[AutoSeed] Startup ${startupNames[i]} missing. Creating...`);
        startup = await Startup.create({
          startupName: startupNames[i],
          industry: industries[i],
          description: `This is a demo startup profile for ${startupNames[i]}. It is used to demonstrate the platform's capabilities to recruiters.`,
          fundingStage: fundingStages[i],
          logo: `https://images.unsplash.com/photo-${1618005182384 + i}?auto=format&fit=crop&q=80&w=150`,
          founderId: demoFounder._id,
          status: i === 3 ? 'Pending' : 'Approved',
          website: `https://www.${startupNames[i].toLowerCase()}.io`,
        });
      }
      startups.push(startup);
    }

    // 4. Ensure Demo Projects exist
    const projectTitles = [
      'Refine Neural Network Architecture',
      'Implement Payment Gateway',
      'Clinical Trial Phase 1',
      'Solar Panel Efficiency Audit',
    ];

    for (let i = 0; i < 4; i++) {
      const startup = startups[i];
      let project = await Project.findOne({ title: projectTitles[i], startupId: startup._id });
      if (!project) {
        console.log(`[AutoSeed] Project ${projectTitles[i]} missing. Creating...`);
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 10);

        await Project.create({
          title: projectTitles[i],
          description: `High-priority task for ${startup.startupName}. This milestone is critical for the next funding round.`,
          priority: i % 2 === 0 ? 'High' : 'Medium',
          status: i === 0 ? 'Completed' : 'In Progress',
          deadline,
          startupId: startup._id,
          assignedUser: demoFounder._id,
        });
      }
    }

    // 5. Ensure Demo Mentors exist
    const mentorNames = ['Sarah Jenkins', 'David Chen'];
    const expertise = ['Marketing & Growth', 'Technical Architecture'];

    for (let i = 0; i < 2; i++) {
      let mentor = await Mentor.findOne({ name: mentorNames[i] });
      if (!mentor) {
        console.log(`[AutoSeed] Mentor ${mentorNames[i]} missing. Creating...`);
        await Mentor.create({
          name: mentorNames[i],
          expertise: expertise[i],
          email: `${mentorNames[i].toLowerCase().replace(' ', '.')}@incubator.internal`,
          profileImage: `https://images.unsplash.com/photo-${1534528741775 + i}?auto=format&fit=crop&q=80&w=200`,
          startupAssigned: startups[i]._id,
        });
      }
    }

    console.log('[AutoSeed] Verification and incremental seeding completed.');
  } catch (error) {
    console.error('[AutoSeed] Error during demo seeding:', error);
  }
};
