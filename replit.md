# Hunt Schedule Management System

A full-stack Tibia MMO hunt schedule management application featuring period-based scheduling with role-based access control and a Dark Fantasy aesthetic.

## Architecture Overview

### Backend (C# ASP.NET Core)
Located in `Backend/HuntScheduleApi/`:

- **Framework**: ASP.NET Core 8.0 Web API
- **ORM**: Entity Framework Core with PostgreSQL (Npgsql)
- **Pattern**: Code First with seeded data

### Models
- `User` - Guild members with roleId (FK) and points
- `Role` - Lookup table for user roles (admin/user)
- `Character` - Player characters linked to users (optional) and servers (name, serverId, vocation, level, isMain, isExternal)
- `Server` - Game servers (Antica, Wintera, etc.)
- `Respawn` - Hunt locations with difficultyId (FK) and max players
- `Slot` - Time slots for hunting sessions (with serverId FK)
- `SchedulePeriod` - Weekly rotation periods (with serverId FK)
- `Request` - Hunt booking requests with statusId (FK) tracking
- `RequestPartyMember` - Join table linking Request to Character (party members for hunts)
- `RequestStatus` - Lookup table for status values (pending/approved/rejected/cancelled)
- `Difficulty` - Lookup table for difficulty levels (easy/medium/hard/nightmare)

### External Character Validation
- Party members can be existing guild characters or external characters not registered in the system
- External characters are validated against the TibiaData API (https://api.tibiadata.com/v4/character/{name})
- Validated external characters are stored with isExternal=true and externalVerifiedAt timestamp
- Server must match between the hunt request and the character's world

### API Endpoints
All endpoints are prefixed with `/api`:

- `/api/users` - User management and points
- `/api/roles` - Role lookup table (admin/user)
- `/api/characters` - Character management (CRUD, set-main)
- `/api/servers` - Server CRUD operations
- `/api/respawns` - Respawn area management
- `/api/slots` - Time slot configuration
- `/api/periods` - Schedule period management
- `/api/requests` - Hunt request booking and approval

### Frontend (React + TypeScript)
Located in `client/src/`:

- **Routing**: Wouter
- **State Management**: Zustand with API fallback
- **Styling**: Tailwind CSS with Dark Fantasy theme
- **Font**: Cinzel display font for headings

### Pages
- `/` - Dashboard with user stats and requests
- `/login` - User selection (demo mode)
- `/schedule` - Hunt schedule grid view
- `/admin` - Admin panel for managing periods, users, respawns

## Running the Application

### Current Setup (Node.js + Mock Data)
The default workflow runs `npm run dev` which serves the frontend with mock data.

### C# Backend Setup
To switch to the C# backend:

1. Configure the workflow to run: `bash start-backend.sh`
2. The script will:
   - Build the React frontend
   - Copy static files to wwwroot
   - Start the C# backend on port 5000

### Environment Variables
Required secrets:
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Replit)

## Database Schema

The application uses PostgreSQL with the following tables:
- Users
- Servers
- Respawns
- Slots
- SchedulePeriods
- Requests

Seed data is automatically created on first run.

## Design System

### Colors
- Primary: Slate/Gold palette
- Background: Dark fantasy theme
- Accent: Golden highlights

### Typography
- Display: Cinzel font for headings
- Body: System font stack

## User Preferences
- Dark Fantasy aesthetic theme
- Period-based scheduling (weekly rotations)
- Role-based access control (admin/user)
