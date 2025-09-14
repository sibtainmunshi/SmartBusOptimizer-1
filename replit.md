# TransitFlow - Smart Bus Management System

## Overview

TransitFlow is a comprehensive bus management and booking platform that combines real-time tracking, smart scheduling, and predictive analytics. The system provides both passenger-facing features (ticket booking, live tracking) and administrative tools (dashboard, analytics) for managing bus operations efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Real-time Communication**: WebSocket implementation for live bus tracking and updates
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with centralized error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection Pooling**: Neon serverless connection pooling for scalability
- **Data Models**: Users, routes, buses, schedules, bookings, locations, and demand predictions

### Authentication and Authorization
- **Session-based Authentication**: Express sessions stored in PostgreSQL
- **User Roles**: Regular users and admin users with different permissions
- **Secure Password Handling**: Password hashing and validation
- **Protected Routes**: Route-level protection for admin features

### External Dependencies
- **Database**: Neon PostgreSQL for serverless database hosting
- **Maps Integration**: OpenStreetMap with Leaflet for bus tracking visualization
- **Charts**: Chart.js for analytics and data visualization
- **WebSocket**: Native WebSocket implementation for real-time features
- **Payment Processing**: Prepared for integration (payment forms implemented)
- **CSS Framework**: Tailwind CSS for utility-first styling
- **Icon Library**: Lucide React for consistent iconography

### Key Features
- **Smart Booking System**: Multi-step booking with seat selection and passenger details
- **Live Bus Tracking**: Real-time GPS tracking with WebSocket updates
- **Predictive Analytics**: Demand forecasting using simple time-series analysis
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Theme**: CSS variable-based theming system