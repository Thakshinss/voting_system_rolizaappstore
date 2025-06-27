# Online Voting System

## Overview

This is a full-stack online voting system built with React, Express, and PostgreSQL. The application allows users to log in using their voter ID, cast votes for up to 3 candidates, and view real-time voting results. It includes an admin panel for managing candidates and monitoring voting progress.

## System Architecture

The application uses a **client-server architecture** with the following components:

- **Frontend**: React-based SPA with TypeScript
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database Connection**: Neon serverless PostgreSQL
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware

### Database Schema
The system uses two main tables:

1. **candidates**: Stores voter information and candidate data
   - `id`: Primary key
   - `name`: Candidate name
   - `voter_id`: Unique voter identifier
   - `has_voted`: Boolean flag for voting status
   - `votes_received`: Vote count
   - `created_at`: Timestamp

2. **votes**: Records individual vote transactions
   - `id`: Primary key
   - `voter_id`: Reference to voter
   - `voted_for_id`: Reference to candidate voted for
   - `created_at`: Timestamp

### Key Features
- **Authentication**: Voter ID-based login system
- **Voting Interface**: Multi-candidate selection (max 3 votes)
- **Real-time Results**: Live vote counting and statistics
- **Admin Panel**: Candidate management and voting status monitoring
- **Responsive Design**: Mobile-friendly interface

## Data Flow

1. **User Authentication**: Users log in with their voter ID
2. **Candidate Loading**: System fetches available candidates from database
3. **Vote Casting**: Users select up to 3 candidates and submit votes
4. **Vote Processing**: Backend validates votes and updates database
5. **Results Display**: Real-time vote counts and statistics are shown
6. **Admin Operations**: Admins can add candidates and monitor voting progress

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **drizzle-kit**: Database migrations and introspection
- **esbuild**: Server-side bundling for production

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Development**: `npm run dev` starts both client and server with hot reload
- **Production Build**: `npm run build` creates optimized bundles
- **Production Server**: `npm run start` runs the production server
- **Database**: PostgreSQL module enabled in Replit environment
- **Port Configuration**: Server runs on port 5000, exposed as port 80
- **Auto-scaling**: Configured for Replit's autoscale deployment target

### Build Process
1. Vite builds the React frontend to `dist/public`
2. esbuild bundles the Express server to `dist/index.js`
3. Static files are served from the built public directory
4. Database migrations are handled via `drizzle-kit push`

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Fixed React infinite loop error in voting page checkbox component
- June 27, 2025. Added 10 sample candidates and successfully tested voting functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```