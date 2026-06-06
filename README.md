# StartupHub – Startup Incubation & Management Platform
## Live Demo

### Application Links

**Frontend (Vercel):**
`https://startup-hub-eight.vercel.app`

**Backend API (Railway):**
`https://startuphub-production.up.railway.app`


StartupHub is a comprehensive dashboard designed to streamline the management of startup ecosystems. It provides a centralized platform for founders to manage their projects and for administrators to oversee the incubation process, including mentor assignments and analytics.

## Project Overview

This project was built as part of my internship assignment to develop a functional, full-stack management tool for startup incubators. The goal was to move away from fragmented spreadsheets and manual tracking, providing a unified interface for data-driven decision-making.

During the development of StartupHub, I focused on:
* Implementing a robust role-based access control (RBAC) system.
* Managing complex data relationships between users, startups, and their associated projects/mentors.
* Learning how to handle persistent file storage using Cloudinary with local fallbacks.
* Mastering deployment workflows for full-stack applications using Vercel and Railway.

## Features

* **User Authentication**: Secure Login, Registration, and Session management using JWT.
* **Role-Based Access Control**: Distinct views and permissions for Admins and Founders.
* **Dashboard Analytics**: Visual data representations of startup progress and project status.
* **Startup Management**: Full CRUD operations for managing startup profiles.
* **Project Tracking**: Task management within startups, including status updates and deadlines.
* **Mentor Management**: Database of mentors with the ability to assign them to specific startups.
* **Advanced Search & Filtering**: Efficient data retrieval across all modules.
* **Server-side Pagination**: Optimized performance for large datasets.
* **File Uploads**: Support for profile images and project attachments.
* **Responsive Design**: A premium dark-themed UI that works across desktop and mobile devices.

## Technology Stack

### Frontend
* **Next.js**: React framework for building the user interface.
* **TypeScript**: For type-safe development.
* **Tailwind CSS**: Utility-first CSS for custom styling.
* **Shadcn UI**: Accessible component primitives for a consistent look.

### Backend
* **Express.js**: Node.js web application framework.
* **TypeScript**: Ensuring consistency across the full stack.
* **JWT Authentication**: Secure token-based auth.

### Database & Storage
* **MongoDB Atlas**: Cloud-hosted NoSQL database.
* **Cloudinary**: For managing and serving image/file uploads.

### Deployment
* **Vercel**: Hosting the frontend application.
* **Railway**: Hosting the backend API and services.

## System Architecture

The application follows a standard Client-Server architecture:
1. **Frontend**: A Next.js application that handles routing, state management (Zustand), and UI rendering.
2. **Backend**: An Express server providing a RESTful API, handling business logic, authentication, and database interactions.
3. **External Services**: MongoDB Atlas for data persistence and Cloudinary for media storage.

## Database Design

The data model is built on MongoDB using Mongoose schemas with the following relationships:

* **Users**: The foundation of the system. A user can be either an `admin` or a `founder`.
* **Startups**: Each startup is owned by a `founder` (User).
* **Projects**: Every project belongs to a `startup` and is assigned to a specific `user` for accountability.
* **Mentors**: Mentors are external experts who are assigned to guide specific `startups`.

## Folder Structure

```text
.
├── backend/            # Express API source code
│   ├── src/
│   │   ├── config/     # Database and service configurations
│   │   ├── controllers/# Request handlers
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Auth and upload logic
├── frontend/           # Next.js application
│   ├── app/            # App router pages and layouts
│   ├── components/     # UI components and Shadcn integration
│   ├── services/       # API communication logic
│   └── hooks/          # Custom React hooks
└── README.md           # Project documentation
```

## Installation Guide

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd project2
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

## Environment Variables

You will need to create `.env` files in both the `frontend` and `backend` directories.

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```env
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running Locally

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Seed the Database (Optional)**:
   The application is configured to **auto-seed** the **Admin demo account** and associated demonstration data if they are missing. This ensures the recruiter experience is always ready. Newly registered users will always start with a clean workspace. You can also manually seed the database:
   ```bash
   cd backend
   npm run seed
   ```

## Deployment Process

The project is configured for a professional deployment workflow:
* **Frontend**: Deployed on **Vercel**, taking advantage of their edge network and Next.js optimizations.
* **Backend**: Hosted on **Railway**, which manages the Express server and environment variables.
* **Database**: Uses **MongoDB Atlas** for a scalable, managed database instance.
* **Storage**: **Cloudinary** handles all persistent file storage, ensuring images remain available across deployments.

### Demo Credentials

**Admin Account**

* Email: admin@startuphub.com
* Password: password123

### Notes for Reviewers

* The platform includes seeded demonstration data for evaluation purposes.
* New users can register their own accounts and will start with a clean workspace.
* The admin account provides access to a fully populated dashboard showcasing analytics, startups, projects, mentors, search, filtering, pagination, file uploads, and role-based access control features.



.

## Future Improvements

* **Real-time Notifications**: Implementing WebSockets for instant updates on project assignments.
* **Advanced Analytics**: Adding more granular reporting and export-to-PDF functionality for startup reports.
* **Messaging System**: A built-in chat for founders and mentors to communicate within the platform.

## Reflection

This project has been a massive learning experience for me. I was able to practice full-stack development concepts in a real-world scenario, from designing database schemas to handling complex frontend state.

Key takeaways:
* **Full-stack Integration**: Understanding how the frontend and backend interact through REST APIs.
* **Database Management**: Learning to model data effectively to support business requirements.
* **DevOps Basics**: Gaining hands-on experience with deployment platforms like Vercel and Railway, and understanding how to manage production-ready environment variables.

---
**Author**: Pushkarini
**License**: MIT
