# Hunt Schedule Management System

A full-stack Tibia MMO hunt schedule management application featuring period-based scheduling with role-based access control and a Dark Fantasy aesthetic.

## Architecture Overview

### Three-Layer Architecture
The backend follows a clean three-layer architecture with separated concerns:

```
HuntSchedule.sln
├── HuntSchedule.Api/         (API Layer - Controllers)
├── HuntSchedule.Services/    (Business Logic Layer)
└── HuntSchedule.Persistence/ (Data Access Layer)
```

**Dependency Chain**: API → Services → Persistence

### API Layer (`Backend/HuntSchedule.Api/`)
- **Framework**: ASP.NET Core 8.0 Web API
- **Controllers**: Thin controllers that inject and use services
- **No direct DbContext access** - all data operations go through services
- **DTOs**: Uses DTOs from Services layer for request/response

### Services Layer (`Backend/HuntSchedule.Services/`)
- **Business Logic**: All business rules implemented here
- **Interfaces**: `Interfaces/` folder contains service contracts
- **Implementations**: `Implementations/` folder contains service logic
- **External**: TibiaData API validator for character validation
- **DTOs**: Request/response DTOs for API operations
- **Results**: ServiceResult pattern for operation outcomes

### Persistence Layer (`Backend/HuntSchedule.Persistence/`)
- **ORM**: Entity Framework Core with PostgreSQL (Npgsql)
- **Entities**: Domain models in `Entities/` folder
- **Context**: AppDbContext with configurations and seed data
- **Repository Pattern**: Generic base repository + specific repositories
- **Unit of Work Pattern**: Transaction management across repositories

### Entity Models
Located in `Backend/HuntSchedule.Persistence/Entities/`:
- `User` - Guild members with roleId (FK) and points
- `Role` - Lookup table for user roles (admin/user)
- `Character` - Player characters linked to users (optional) and servers
- `Server` - Game servers (Antica, Wintera, etc.)
- `Respawn` - Hunt locations with difficultyId (FK) and max players
- `Slot` - Time slots for hunting sessions (with serverId FK)
- `SchedulePeriod` - Weekly rotation periods (with serverId FK)
- `Request` - Hunt booking requests with statusId (FK) tracking
- `RequestPartyMember` - Join table linking Request to Character
- `RequestStatus` - Lookup table for status values
- `Difficulty` - Lookup table for difficulty levels

### TibiaData Character Validation
- Located in `Backend/HuntSchedule.Services/External/`
- All character operations validated against TibiaData API
- Character creation: Name must exist on Tibia.com, vocation/level synced
- Character update: Re-validates if name or server changes
- External characters stored with isExternal=true and externalVerifiedAt
- Server must match character's actual world

### API Endpoints
All endpoints prefixed with `/api`:

**Authentication:**
- `POST /api/auth/login` - Username/password login with BCrypt verification
- `POST /api/auth/logout` - Session destruction
- `GET /api/auth/me` - Get current authenticated user

**Resources:**
- `/api/users` - User management and points
- `/api/roles` - Role lookup table (admin/user)
- `/api/characters` - Character management (CRUD, set-main)
- `/api/servers` - Server CRUD operations
- `/api/respawns` - Respawn area management
- `/api/slots` - Time slot configuration
- `/api/periods` - Schedule period management
- `/api/requests` - Hunt request booking and approval
- `/api/statuses` - Request status lookup
- `/api/difficulties` - Difficulty level lookup

### Authentication
- **Password Hashing**: BCrypt.Net-Next with salt rounds
- **Session Management**: ASP.NET Core session middleware with distributed memory cache
- **Password Security**: Passwords stored as BCrypt hashes, never returned in API responses
- **Demo Credentials**: 
  - Admin: `admin` / `admin123`
  - Player: `player1` / `player123`

### Frontend (React + TypeScript)
Located in `client/src/`:

- **Routing**: Wouter
- **State Management**: Zustand with API fallback
- **Styling**: Tailwind CSS with Dark Fantasy theme
- **Font**: Cinzel display font for headings
- **Internationalization**: react-i18next with 5 languages

### Multi-Language Support (i18n)
Located in `client/src/i18n/`:

**Supported Languages:**
- English (en) - Default
- Portuguese (pt)
- Spanish (es)
- German (de)
- Polish (pl)

**Implementation:**
- Uses `react-i18next` with `i18next-browser-languagedetector`
- Translation files in `client/src/i18n/locales/*.json`
- Language selector in sidebar (desktop) and header (mobile)
- Language preference persisted in localStorage
- Uses `i18n.resolvedLanguage` for reliable locale detection

### Pages
- `/` - Dashboard with user stats and requests
- `/login` - User selection (demo mode)
- `/schedule` - Hunt schedule grid view
- `/characters` - My Characters page for linking Tibia characters to account
- `/profile` - My Profile page displaying user account information, points, role, and language settings
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
- Users, Roles
- Characters, Servers
- Respawns, Difficulties
- Slots, SchedulePeriods
- Requests, RequestPartyMembers, RequestStatuses

Seed data is automatically created on first run.

## Design Patterns

### Repository Pattern
- Generic `IRepository<T>` base interface
- Specific repositories for complex queries (e.g., `ICharacterRepository`, `IRequestRepository`)
- Repositories handle data access abstraction

### Unit of Work Pattern
- `IUnitOfWork` manages all repositories
- Transaction support via `BeginTransactionAsync()`
- Single `SaveChangesAsync()` for atomic operations

### Service Layer Pattern
- Services contain all business logic
- Controllers are thin wrappers that call services
- `ServiceResult<T>` for returning operation outcomes with ErrorType and ErrorMessage

### Backend Localization (C# Resources)
- **Resource Files**: Located in `Backend/HuntSchedule.Services/Resources/`
  - `ErrorMessages.resx` - Default (English)
  - `ErrorMessages.pt.resx` - Portuguese
  - `ErrorMessages.es.resx` - Spanish
  - `ErrorMessages.de.resx` - German
  - `ErrorMessages.pl.resx` - Polish
- **LocalizationService**: `ILocalizationService` interface with `LocalizationService` implementation
  - Uses `ResourceManager` to load culture-specific error messages
  - Thread-safe via `CultureInfo.CurrentUICulture`
  - Registered as singleton in DI container
- **ServiceResult Pattern**:
  - `ErrorType` enum: `None`, `NotFound`, `Validation`, `Conflict`
  - Controllers check `ErrorType` (not message text) for HTTP status decisions
  - `ErrorMessage` contains localized user-facing text
- **Request Localization**: Configured in Program.cs with supported cultures
- **Error Keys**: `UserNotFound`, `ServerNotFound`, `CharacterNotFoundOnTibia`, `CharacterServerMismatch`, etc.

## Design System

### Colors
- Primary: Slate/Gold palette
- Background: Dark fantasy theme
- Accent: Golden highlights

### Typography
- Display: Cinzel font for headings
- Body: System font stack

## Email Notifications

### Gmail Integration (Configured)
- Gmail connector is set up for sending transactional emails
- Notification service created in `server/gmail.ts`
- Functions available: `sendRequestApprovalEmail()`, `sendRequestRejectionEmail()`

### WhatsApp Integration (Pending)
- Twilio integration was dismissed - can be set up later for WhatsApp messaging
- When ready, set up the Twilio connector and create a similar notification service

### Integration Notes
- Users must have email in their profile to receive notifications
- Email notifications include: respawn name, time slot, period name
- Styled HTML emails matching the Dark Fantasy theme

## User Preferences
- Dark Fantasy aesthetic theme
- Period-based scheduling (weekly rotations)
- Role-based access control (admin/user)
- Clean architecture with separated layers
- One class per file convention
- Business logic in services, not controllers
- Multi-language support (EN, PT, ES, DE, PL)
