# PGHub - PG Accommodation Management System

## Overview

PGHub is a comprehensive full-stack web application designed for managing paying guest (PG) accommodations. It serves as a marketplace for students and working professionals to find accommodation, while providing property owners with tools to manage their properties, rooms, beds, and bookings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **Schema Management**: Drizzle ORM with migrations
- **Session Storage**: PostgreSQL table for session persistence
- **File Storage**: Not implemented (would typically use cloud storage)

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Management**: Express sessions with PostgreSQL backend
- **User Types**: Property owners and customers (tenants)

### Database Schema
- **Users**: Profile information, user type (owner/customer)
- **Properties**: Property details, location, amenities, pricing
- **Rooms**: Room configurations within properties
- **Beds**: Individual bed management with availability
- **Bookings**: Reservation system with status tracking
- **Messages**: Communication between users
- **Sessions**: Authentication session storage

### API Structure
- **RESTful Design**: Standard HTTP methods for CRUD operations
- **Route Organization**: Modular route handlers in `/server/routes.ts`
- **Data Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware

### User Interface Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Radix UI primitives with custom styling
- **Navigation**: Conditional routing based on authentication status
- **Dashboard**: Property owner management interface
- **Marketplace**: Property search and browsing for customers

## Data Flow

1. **User Authentication**: OpenID Connect flow through Replit Auth
2. **Session Management**: Server-side sessions stored in PostgreSQL
3. **API Requests**: Client-side requests through React Query
4. **Database Operations**: Type-safe queries through Drizzle ORM
5. **Real-time Updates**: Query invalidation for data consistency

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **express**: Web framework for Node.js
- **passport**: Authentication middleware

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code quality and formatting

### Third-party Services
- **Replit Auth**: Authentication provider
- **Neon Database**: PostgreSQL hosting
- **Replit Deployment**: Hosting platform integration

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Neon Database with development connection
- **Authentication**: Replit Auth development configuration

### Production Deployment
- **Build Process**: Vite builds client, ESBuild bundles server
- **Static Assets**: Served from `/dist/public` directory
- **Environment Variables**: Database URL, session secrets, auth configuration
- **Process Management**: Single Node.js process serving both API and static files

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `REPLIT_DOMAINS`: Allowed domains for authentication
- `ISSUER_URL`: OpenID Connect issuer URL

### Build Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build (client + server)
- `npm run start`: Production server
- `npm run db:push`: Database schema deployment