# 2.1 System Overview

This document provides a high-level overview of the Patent Drafter AI application's architecture, technology stack, and core design principles.

## Table of Contents
- [Guiding Philosophy](#-guiding-philosophy-separation-of-concerns)
- [Technology Stack](#-technology-stack)
- [Application Structure](#-application-structure)
- [Core Architectural Patterns](#-core-architectural-patterns)
- [Data Flow](#-data-flow)

---

## 🏛️ Guiding Philosophy: Separation of Concerns

Our architecture is built on a strict separation of concerns, with a clear boundary between:
-   **Client-Side Code**: React components, hooks, and client services (`src/components/`, `src/features/`, `src/client/services/`).
-   **Server-Side Code**: API routes, server services, and repositories (`src/pages/api/`, `src/server/`, `src/repositories/`).
-   **Shared Code**: Libraries, utilities, and types (`src/lib/`, `src/utils/`, `src/types/`).

This makes the codebase easier to navigate, debug, and extend.

---

## stack Technology Stack

The application is built with a modern, type-safe technology stack:

-   **Framework**: Next.js (App Router paradigm)
-   **Language**: TypeScript (with `strict` mode enabled)
-   **UI Library**: React with Chakra UI for the component system.
-   **Backend**: Next.js API Routes.
-   **Database ORM**: Prisma.
-   **Database**: Microsoft SQL Server.
-   **Authentication**: Auth0 (with a clear migration path to an internal IPD Identity solution).
-   **AI Services**: Azure OpenAI (primary), with abstractions for other providers like OpenAI.
-   **Deployment**: Docker and Azure App Service.
-   **State Management**: React Query (`@tanstack/react-query`) for server state and React Context for global UI state.

---

## 📁 Application Structure

The `src/` directory is organized to reflect the separation of concerns:

```
src/
├── components/           # Reusable UI components and layouts
├── features/            # Feature-specific modules (claim-refinement, patent-application, etc.)
│   ├── {feature}/
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific React hooks
│   │   └── utils/       # Feature-specific utilities
├── client/
│   └── services/        # Client-side API services that make API calls
├── server/
│   ├── services/        # Server-side business logic and external integrations
│   └── prompts/         # Reusable AI prompt templates
├── pages/
│   ├── api/             # API routes, which act as thin controllers
│   └── [tenant]/        # Tenant-aware application pages
├── repositories/        # Database access layer (using Prisma)
├── lib/                 # Core libraries (api client, logger, error handlers, etc.)
├── middleware/          # API middleware for auth, validation, etc.
├── utils/               # Simple, pure helper functions
├── types/               # Global TypeScript type definitions
├── contexts/            # React contexts for global state
├── hooks/               # Shared React hooks
└── ...                  # (Other folders: theme, styles, ui)
```

---

## 🏛️ Core Architectural Patterns

To maintain consistency and quality, the application relies on several key patterns:

1.  **Service Layer**: All external API calls from the client are made through a dedicated service layer (`src/client/services/`). This centralizes API interaction, error handling, and response validation logic.

2.  **Repository Pattern**: All database access is funneled through repositories (`src/repositories/`). This pattern ensures that all data queries are type-safe, consistently apply tenant isolation, and are easy to mock for testing.

3.  **Hook-Driven Data Fetching**: Client-side data fetching is exclusively managed by React Query hooks (`useQuery`, `useMutation`). This provides caching, automatic refetching, and consistent loading/error state management.

4.  **Centralized Middleware**: API routes are protected by a composable middleware chain (`src/middleware/`) that handles authentication, authorization, CSRF protection, and input validation before the request reaches the handler.

5.  **Type-Safe API**: API responses are validated at runtime using **Zod** schemas. This ensures that the data flowing from the backend to the frontend always matches the expected TypeScript types, preventing runtime errors.

---

## 🌊 Data Flow

The backend enforces a strict, one-way data flow. **API routes MUST NOT access the database directly.**

```mermaid
graph TD;
    subgraph Browser (Client-Side)
        A[React Component / Hook] --> B(Client Service);
    end

    subgraph Network
        B -- "apiFetch() to /api/..." --> C{API Route};
    end

    subgraph Server-Side
        C -- "Calls" --> D(Server Service);
        D -- "Orchestrates Logic" --> E(Repository);
        E -- "Accesses DB via Prisma" --> F[(Database)];
    end

    style B fill:#e6f2ff,stroke:#0052cc
    style D fill:#e6f2ff,stroke:#0052cc
    style E fill:#e6f2ff,stroke:#0052cc
```

1.  **React Component**: A user action triggers a call to a client service hook.
2.  **Client Service**: Makes an `apiFetch` call to the appropriate API route.
3.  **API Route (`pages/api`)**: A thin controller that validates the request and calls a server service.
4.  **Server Service (`src/server/services/`)**: Contains the core business logic. It orchestrates actions, calling one or more repositories.
5.  **Repository (`src/repositories/`)**: Executes the database query using Prisma, ensuring tenant security is applied.
6.  **Database**: Returns data to the repository. 