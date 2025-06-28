import swaggerJsdoc from 'swagger-jsdoc';
import { environment } from './environment';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Patent Drafter AI API',
      version: '1.0.0',
      description:
        'Enterprise API for automated patent drafting and prior art search',
      contact: {
        name: 'API Support',
        email: 'support@patentdrafter.ai',
      },
      license: {
        name: 'Proprietary',
        url: 'https://patentdrafter.ai/license',
      },
    },
    servers: [
      {
        url: environment.appUrl,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Auth0 JWT token',
        },
        tenantHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-tenant-slug',
          description: 'Tenant identification header',
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-csrf-token',
          description: 'CSRF protection token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            tenantId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['draft', 'pending', 'filing', 'filed', 'granted'],
            },
            patentType: {
              type: 'string',
              enum: ['utility', 'design', 'plant', 'provisional'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClaimSet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  number: { type: 'integer' },
                  text: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['independent', 'dependent'],
                  },
                  dependsOn: {
                    type: 'array',
                    items: { type: 'integer' },
                  },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CitationMatch: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            searchHistoryId: { type: 'string', format: 'uuid' },
            patentNumber: { type: 'string' },
            title: { type: 'string' },
            abstract: { type: 'string' },
            relevanceScore: { type: 'number', format: 'float' },
            claimAnalysis: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: true,
                message: 'Authentication required',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access forbidden',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: true,
                message: 'Access forbidden for this tenant',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: true,
                message: 'Resource not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: true,
                message: 'Validation error',
                details: [{ path: 'email', message: 'Invalid email format' }],
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: true,
                message: 'An unexpected error occurred',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        tenantHeader: [],
      },
    ],
    tags: [
      {
        name: 'Projects',
        description: 'Patent project management',
      },
      {
        name: 'Claims',
        description: 'Patent claim management and refinement',
      },
      {
        name: 'Prior Art',
        description: 'Prior art search and analysis',
      },
      {
        name: 'AI',
        description: 'AI-powered features',
      },
      {
        name: 'Authentication',
        description: 'User authentication',
      },
      {
        name: 'Users',
        description: 'User management',
      },
      {
        name: 'Files',
        description: 'File uploads and document management',
      },
    ],
  },
  apis: ['./src/pages/api/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
