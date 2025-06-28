# Repository Pattern Guide

The repository layer provides a clean abstraction over database operations, ensuring consistent data access patterns across the application.

## 🎯 Purpose

Repositories serve as the single source of truth for all database operations:
- **Encapsulation**: Hide Prisma implementation details from the rest of the app
- **Type Safety**: Provide strongly-typed interfaces for all queries
- **Error Handling**: Consistent error handling and logging
- **Testing**: Easy to mock for unit tests
- **Security**: Enforce tenant isolation and access control

## 📁 Repository Structure

```
repositories/
├── projectRepository.ts          # Project-related queries
├── userRepository.ts             # User management
├── citationRepository.ts         # Main entry point - re-exports citation functions
├── citationCoreRepository.ts     # Complex transactional citation operations
├── citationJobRepository.ts      # Citation job management
├── citationMatchRepository.ts    # Citation match operations
├── citationQueryRepository.ts    # Complex citation queries with options
├── citationReasoningRepository.ts # Citation reasoning data access
├── citationDeepAnalysisRepository.ts # Deep analysis queries
├── citationTransformService.ts   # Citation data transformation utilities
├── documentRepository.ts         # Document handling
├── searchRepository.ts           # Search history
└── __tests__/                   # Repository tests
```

## 🔧 Repository Pattern

### Citation Repository Architecture

The citation functionality has been split into specialized repositories for better maintainability:

- **`citationRepository.ts`** - Main entry point that re-exports all citation functions
- **`citationCoreRepository.ts`** - Complex transactional operations (e.g., `saveCitationResultsAndConsolidate`)
- **`citationJobRepository.ts`** - CRUD operations for citation jobs
- **`citationMatchRepository.ts`** - CRUD operations for citation matches
- **`citationQueryRepository.ts`** - Complex queries with multiple options
- **`citationReasoningRepository.ts`** - Data access for reasoning operations
- **`citationDeepAnalysisRepository.ts`** - Queries for deep analysis functionality
- **`citationTransformService.ts`** - Data transformation utilities and type definitions

This modular approach allows for:
- Better code organization and discoverability
- Easier testing of individual components
- Clear separation of concerns
- Reduced file sizes and complexity

### Basic Structure

```typescript
import { getPrismaClient } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';

// Define return types
interface ProjectWithRelations {
  id: string;
  name: string;
  claimSets: ClaimSet[];
  // ... other fields
}

// Repository functions
export async function findProjectById(
  projectId: string,
  tenantId: string
): Promise<ProjectWithRelations | null> {
  const prisma = getPrismaClient();
  
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId, // Always include tenant check!
      },
      include: {
        claimSets: true,
      },
    });
    
    return project;
  } catch (error) {
    logger.error('Error finding project', { projectId, error });
    throw new DatabaseError('Failed to retrieve project');
  }
}
```

## 🛡️ Security Patterns

### Tenant Isolation

**ALWAYS** include tenant checks in queries:

```typescript
// ✅ Good: Includes tenant check
export async function findProjectsByTenant(
  tenantId: string,
  userId: string
) {
  return prisma.project.findMany({
    where: {
      tenantId,  // Required!
      userId,
    },
  });
}

// ❌ Bad: Missing tenant check
export async function findProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId }, // Vulnerable!
  });
}
```

### Access Control

Check user permissions within repositories:

```typescript
export async function updateProjectWithAuth(
  projectId: string,
  userId: string,
  tenantId: string,
  data: UpdateData
) {
  // First verify access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,     // User must own the project
      tenantId,   // Must be in same tenant
    },
  });
  
  if (!project) {
    throw new ForbiddenError('Access denied');
  }
  
  // Then perform update
  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}
```

## 🎯 Best Practices

### 1. **Return Specific Types**

```typescript
// ✅ Good: Specific return type
export async function getProjectClaims(
  projectId: string
): Promise<Claim[]> {
  // Implementation
}

// ❌ Bad: Generic Prisma type
export async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}
```

### 2. **Handle Errors Appropriately**

```typescript
export async function createProject(data: CreateProjectData) {
  try {
    return await prisma.project.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new DuplicateError('Project name already exists');
      }
    }
    logger.error('Failed to create project', { error });
    throw new DatabaseError('Failed to create project');
  }
}
```

### 3. **Use Transactions When Needed**

```typescript
export async function transferProject(
  projectId: string,
  fromUserId: string,
  toUserId: string
) {
  return prisma.$transaction(async (tx) => {
    // Verify ownership
    const project = await tx.project.findFirst({
      where: { id: projectId, userId: fromUserId },
    });
    
    if (!project) {
      throw new ForbiddenError('Not authorized');
    }
    
    // Update ownership
    const updated = await tx.project.update({
      where: { id: projectId },
      data: { userId: toUserId },
    });
    
    // Log the transfer
    await tx.auditLog.create({
      data: {
        action: 'PROJECT_TRANSFERRED',
        projectId,
        fromUserId,
        toUserId,
      },
    });
    
    return updated;
  });
}
```

### 4. **Optimize Queries**

```typescript
// ✅ Good: Select only needed fields
export async function getProjectList(tenantId: string) {
  return prisma.project.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  });
}

// ❌ Bad: Fetching everything
export async function getProjects(tenantId: string) {
  return prisma.project.findMany({
    where: { tenantId },
    include: {
      claimSets: true,
      citations: true,
      documents: true,
      // Fetching too much data!
    },
  });
}
```

## 🧪 Testing Repositories

Example test structure:

```typescript
import { createProject } from '../projectRepository';
import { getPrismaClient } from '@/lib/prisma';

jest.mock('@/lib/prisma');

describe('ProjectRepository', () => {
  const mockPrisma = {
    project: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  
  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);
  });
  
  it('should create a project', async () => {
    const projectData = { name: 'Test Project' };
    mockPrisma.project.create.mockResolvedValue({
      id: '123',
      ...projectData,
    });
    
    const result = await createProject(
      projectData,
      'user123',
      'tenant123'
    );
    
    expect(mockPrisma.project.create).toHaveBeenCalledWith({
      data: {
        ...projectData,
        userId: 'user123',
        tenantId: 'tenant123',
      },
    });
    expect(result.id).toBe('123');
  });
});
```

## 📋 Common Patterns

### Pagination

```typescript
export async function getProjectsPaginated(
  tenantId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const skip = (page - 1) * pageSize;
  
  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where: { tenantId },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({
      where: { tenantId },
    }),
  ]);
  
  return {
    data: projects,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
```

### Soft Deletes

```typescript
export async function deleteProject(
  projectId: string,
  tenantId: string
) {
  // Soft delete by setting deletedAt
  return prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });
}

export async function findActiveProjects(tenantId: string) {
  return prisma.project.findMany({
    where: {
      tenantId,
      deletedAt: null, // Only active projects
    },
  });
}
```

## ⚠️ Common Pitfalls

1. **Forgetting tenant checks** - Always include tenantId in queries
2. **Over-fetching data** - Use `select` to get only needed fields
3. **N+1 queries** - Use `include` for related data in one query
4. **Not handling errors** - Always wrap in try-catch with logging
5. **Exposing internal errors** - Transform to user-friendly messages

## 🔗 Related Documentation

- [Database Schema](../../prisma/schema.prisma)
- [Error Handling](../utils/error-handling/README.md)
- [Testing Guide](../../docs/testing.md)
- [Security Patterns](../../docs/security.md) 