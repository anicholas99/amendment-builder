# 2.3 Data & Persistence

This document outlines the application's data persistence strategy, covering the database, the Prisma ORM, and the strict architectural patterns enforced for all data access.

## Table of Contents
- [Database](#-database)
- [ORM: Prisma](#-orm-prisma)
- [The Repository Pattern](#-the-repository-pattern)
- [Data Flow: A Strict Policy](#-data-flow-a-strict-policy)
- [Best Practices](#-best-practices)

---

## 🗄️ Database

-   **Primary Database**: The application uses **Microsoft SQL Server**.
-   **Local Development**: It is recommended to use a local instance of MS SQL Server 2022 (e.g., via Docker or the Developer Edition).
-   **Production & Staging**: The production environment runs on Azure SQL Database.

The database schema is managed declaratively using the `schema.prisma` file.

---

## 🔧 ORM: Prisma

[Prisma](https://www.prisma.io/) is used as the Object-Relational Mapper (ORM) to provide a type-safe interface to the database.

-   **Schema Definition**: The single source of truth for database models is `prisma/schema.prisma`.
-   **Migrations**: All database schema changes **must** be managed through Prisma Migrate.
    -   To create a new migration during development: `npx prisma migrate dev --name <migration-name>`
    -   To apply migrations in production: `npx prisma migrate deploy`
-   **Prisma Client**: A type-safe database client is generated from the schema. A singleton instance is used throughout the application to ensure efficient connection pooling.

---

## 🏛️ The Repository Pattern

This is the **most critical data access pattern** in the codebase.

**Rule**: All database operations **must** be executed through a function in a "repository" file located in `src/repositories/`.

-   **Purpose**: To create a stable, centralized, and secure data access layer.
-   **Structure**: Each repository typically corresponds to a major database model (e.g., `projectRepository.ts`, `userRepository.ts`).
-   **Responsibilities**:
    1.  **Encapsulation**: Repositories contain all the Prisma Client calls.
    2.  **Security**: Repositories are responsible for enforcing data access rules, most importantly **tenant isolation**. Every query that can access tenant-specific data must include a `tenantId` in its `where` clause.
    3.  **Type Safety**: They return clearly defined data types.
    4.  **Testability**: They provide a clear seam for mocking during unit tests.

### Example Repository Function

```typescript
// src/server/repositories/projectRepository.ts

import { prisma } from '@/lib/prisma';

/**
 * Finds a single project by its ID, ensuring it belongs to the correct tenant.
 */
export async function findProjectByIdAndTenant(
  projectId: string,
  tenantId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId, // Tenant security is enforced here!
    },
  });
}
```

---

## 🌊 Data Flow: A Strict Policy

To enforce the repository pattern and separation of concerns, the following data flow is **strictly enforced** on the backend:

**`API Route` -> `Server Service` -> `Repository` -> `Database`**

-   **API Routes (`pages/api`)**: Act as thin controllers. They **must not** contain any direct `prisma` calls. Their role is to call the appropriate server service.
-   **Server Services (`server/services`)**: Contain business logic. They orchestrate operations, calling one or more repository functions to achieve a goal.
-   **Repositories (`server/repositories`)**: The **only** layer that is permitted to import and use the Prisma client.

This strict flow is enforced by an ESLint rule (`no-direct-prisma-import`) that will fail the build if `prisma` is imported anywhere outside of the `src/server/repositories/` directory.

---

## ✨ Best Practices

-   **Use Transactions for Atomic Operations**: For operations that involve multiple database writes that must all succeed or fail together, use `prisma.$transaction()`.
-   **Select Only What You Need**: Use `select` or `include` to fetch only the data required, preventing over-fetching.
-   **Batch Operations**: For creating or updating many records at once, use `createMany` and `updateMany` for significantly better performance.
-   **Add Database Indexes**: For fields that are frequently used in `where` clauses, add an `@@index` to the model in `schema.prisma` to improve query performance. 