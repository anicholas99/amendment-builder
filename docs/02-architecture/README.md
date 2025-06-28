# 2. Architecture

This section provides a comprehensive overview of the Patent Drafter AI system architecture. The documents here are intended to give developers a deep understanding of the application's design, from high-level patterns to specific implementation details.

## Table of Contents

1.  **[System Overview](01-system-overview.md)**
    A high-level look at the tech stack, core libraries, and the key architectural patterns that govern the codebase. Start here to understand the big picture.

2.  **[Authentication](02-authentication.md)**
    A detailed breakdown of the authentication and authorization flow, including the current Auth0 implementation, session management with `getSession`, and the strategic plan for migrating to IPD Identity.

3.  **[Data & Persistence](03-data-and-persistence.md)**
    An explanation of how data is managed, including the database schema, the use of Prisma as an ORM, and the implementation of the Repository Pattern for type-safe, centralized data access.

4.  **[API Design](04-api-design.md)**
    Covers the conventions and standards for building API routes in Next.js, including middleware composition, request/response validation, tenant security guards, and consistent error handling.

5.  **[Async Processing](05-async-processing.md)**
    Details the system's approach to handling long-running background tasks, such as citation extraction and semantic searches, within the main application thread to simplify deployment. 