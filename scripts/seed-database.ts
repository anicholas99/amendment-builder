import { PrismaClient } from '@prisma/client';
import { ApplicationError, ErrorCode } from '../src/lib/error';
import { ensureUserTenantAccess } from '../src/repositories/tenantRepository';
import { createUser, findUserByEmail } from '../src/repositories/userRepository';
import { createProject } from '../src/repositories/project/core.repository';
import { inventionRepository } from '../src/repositories/inventionRepository';
import { ClaimRepository } from '../src/repositories/claimRepository';
import { createSearchHistory } from '../src/repositories/search/searchHistory.repository';

const prisma = new PrismaClient();

interface SeedData {
  tenants: Array<{
    name: string;
    slug: string;
    settings?: any;
    users: Array<{
      email: string;
      name: string;
      role: string;
      projects: Array<{
        name: string;
        textInput?: string;
        status: string;
        invention?: {
          title: string;
          abstract: string;
          technicalField: string;
          claims: Array<{
            number: number;
            text: string;
          }>;
        };
        searchHistory?: Array<{
          query: string;
          results?: string;
        }>;
      }>;
    }>;
  }>;
}

const seedData: SeedData = {
  tenants: [
    {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      settings: {
        dataRetentionPolicy: 'SOFT_DELETE',
        enableAuditLogs: true,
        maxProjectsPerUser: 50,
      },
      users: [
        {
          email: 'john.doe@acme-corp.com',
          name: 'John Doe',
          role: 'ADMIN',
          projects: [
            {
              name: 'Smart IoT Device Controller',
              textInput: 'An innovative IoT device controller that enables seamless integration between various smart home devices using advanced machine learning algorithms.',
              status: 'ACTIVE',
              invention: {
                title: 'Smart IoT Device Controller with Machine Learning',
                abstract: 'A system and method for controlling Internet of Things (IoT) devices using machine learning algorithms to optimize device performance and energy consumption.',
                technicalField: 'Internet of Things, Machine Learning, Smart Home Technology',
                claims: [
                  {
                    number: 1,
                    text: 'A smart IoT device controller comprising: a processor configured to execute machine learning algorithms; a communication module for interfacing with multiple IoT devices; and a control module for optimizing device performance based on learned patterns.',
                  },
                  {
                    number: 2,
                    text: 'The smart IoT device controller of claim 1, wherein the machine learning algorithms include neural networks for predicting device usage patterns.',
                  },
                  {
                    number: 3,
                    text: 'The smart IoT device controller of claim 1, further comprising an energy optimization module that reduces power consumption based on usage analytics.',
                  },
                ],
              },
              searchHistory: [
                {
                  query: 'IoT device controller machine learning',
                  results: JSON.stringify([
                    { title: 'Smart Home Automation System', patentNumber: 'US10123456' },
                    { title: 'IoT Device Management Platform', patentNumber: 'US10234567' },
                  ]),
                },
                {
                  query: 'machine learning device optimization',
                  results: JSON.stringify([
                    { title: 'AI-Powered Device Controller', patentNumber: 'US10345678' },
                  ]),
                },
              ],
            },
            {
              name: 'Blockchain Payment System',
              textInput: 'A secure blockchain-based payment system that ensures transaction integrity and reduces processing costs.',
              status: 'DRAFT',
              invention: {
                title: 'Secure Blockchain Payment Processing System',
                abstract: 'A blockchain-based payment processing system that provides enhanced security, reduced transaction costs, and improved transparency for digital payments.',
                technicalField: 'Blockchain Technology, Digital Payments, Cryptography',
                claims: [
                  {
                    number: 1,
                    text: 'A blockchain payment system comprising: a distributed ledger for recording transactions; a cryptographic module for securing transaction data; and a consensus mechanism for validating transactions.',
                  },
                  {
                    number: 2,
                    text: 'The blockchain payment system of claim 1, wherein the consensus mechanism utilizes proof-of-stake validation.',
                  },
                ],
              },
            },
          ],
        },
        {
          email: 'jane.smith@acme-corp.com',
          name: 'Jane Smith',
          role: 'USER',
          projects: [
            {
              name: 'Advanced Battery Management System',
              textInput: 'A sophisticated battery management system for electric vehicles that optimizes charging cycles and extends battery life.',
              status: 'ACTIVE',
              invention: {
                title: 'Advanced Battery Management System for Electric Vehicles',
                abstract: 'A battery management system that monitors and optimizes battery performance in electric vehicles through intelligent charging algorithms and thermal management.',
                technicalField: 'Electric Vehicles, Battery Technology, Energy Management',
                claims: [
                  {
                    number: 1,
                    text: 'A battery management system for electric vehicles comprising: a monitoring module for tracking battery parameters; a thermal management system for temperature control; and an optimization algorithm for charge cycle management.',
                  },
                  {
                    number: 2,
                    text: 'The battery management system of claim 1, wherein the optimization algorithm extends battery life by 25% through adaptive charging patterns.',
                  },
                ],
              },
              searchHistory: [
                {
                  query: 'electric vehicle battery management system',
                  results: JSON.stringify([
                    { title: 'EV Battery Controller', patentNumber: 'US10456789' },
                  ]),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'TechInnovate Solutions',
      slug: 'techinnovate',
      settings: {
        dataRetentionPolicy: 'SOFT_DELETE',
        enableAuditLogs: true,
        maxProjectsPerUser: 25,
      },
      users: [
        {
          email: 'admin@techinnovate.com',
          name: 'Tech Admin',
          role: 'ADMIN',
          projects: [
            {
              name: 'AI-Powered Medical Diagnosis System',
              textInput: 'An artificial intelligence system that assists medical professionals in diagnosing diseases using image analysis and pattern recognition.',
              status: 'ACTIVE',
              invention: {
                title: 'AI-Powered Medical Diagnosis System',
                abstract: 'An artificial intelligence system for medical diagnosis that analyzes medical images and patient data to provide accurate diagnostic recommendations.',
                technicalField: 'Medical Technology, Artificial Intelligence, Image Processing',
                claims: [
                  {
                    number: 1,
                    text: 'An AI-powered medical diagnosis system comprising: an image processing module for analyzing medical images; a machine learning model trained on medical data; and a diagnostic recommendation engine.',
                  },
                  {
                    number: 2,
                    text: 'The AI-powered medical diagnosis system of claim 1, wherein the machine learning model achieves 95% accuracy in disease detection.',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Give user time to cancel
    console.log('⚠️  This will populate the database with sample data!');
    console.log('Press Ctrl+C to cancel or wait 3 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📊 Seeding database with sample data...');

    for (const tenantData of seedData.tenants) {
      console.log(`🏢 Creating tenant: ${tenantData.name}`);
      
      // Create the first user for this tenant (admin)
      const firstUser = tenantData.users[0];
      let user = await findUserByEmail(firstUser.email);
      
      if (!user) {
        user = await createUser({
          email: firstUser.email,
          name: firstUser.name,
          role: firstUser.role,
          isVerified: true,
          resetToken: `seed-reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          verificationToken: `seed-verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }) as any;
        console.log(`👤 Created user: ${user!.email}`);
      } else {
        console.log(`👤 User already exists: ${user.email}`);
      }

      if (!user) {
        throw new ApplicationError(
          ErrorCode.DB_QUERY_ERROR,
          'Failed to create or find user'
        );
      }

      // Create tenant and associate with user
      let tenant;
      try {
        // First, create the tenant
        tenant = await prisma.tenant.create({
          data: {
            name: tenantData.name,
            slug: tenantData.slug,
            settings: tenantData.settings ? JSON.stringify(tenantData.settings) : null,
          },
        });
        console.log(`🏢 Created tenant: ${tenant.name} (${tenant.slug})`);
        
        // Then, create the user-tenant relationship
        await ensureUserTenantAccess(user.id, tenant.id, firstUser.role);
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
          console.log(`🏢 Tenant already exists: ${tenantData.slug}`);
          // Find existing tenant
          tenant = await prisma.tenant.findUnique({
            where: { slug: tenantData.slug },
          });
          if (!tenant) {
            throw new ApplicationError(
              ErrorCode.DB_QUERY_ERROR,
              'Failed to find existing tenant'
            );
          }
          
          // Ensure user-tenant relationship exists
          await ensureUserTenantAccess(user.id, tenant.id, firstUser.role);
        } else {
          throw error;
        }
      }

      // Create remaining users for this tenant
      for (const userData of tenantData.users.slice(1)) {
        let tenantUser = await findUserByEmail(userData.email);
        
        if (!tenantUser) {
          tenantUser = await createUser({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            isVerified: true,
            resetToken: `seed-reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            verificationToken: `seed-verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }) as any;
          console.log(`👤 Created user: ${tenantUser!.email}`);
        } else {
          console.log(`👤 User already exists: ${tenantUser.email}`);
        }

        if (!tenantUser) {
          throw new ApplicationError(
            ErrorCode.DB_QUERY_ERROR,
            'Failed to create or find tenant user'
          );
        }

        // Ensure user is associated with tenant
        await prisma.userTenant.upsert({
          where: {
            userId_tenantId: {
              userId: tenantUser.id,
              tenantId: tenant.id,
            },
          },
          update: {},
          create: {
            userId: tenantUser.id,
            tenantId: tenant.id,
            role: userData.role,
          },
        });
      }

      // Create projects for each user
      for (const userData of tenantData.users) {
        const user = await findUserByEmail(userData.email);
        if (!user) continue;

        for (const projectData of userData.projects) {
          console.log(`📋 Creating project: ${projectData.name}`);
          
          // Check if project already exists
          const existingProject = await prisma.project.findFirst({
            where: {
              name: projectData.name,
              userId: user.id,
              tenantId: tenant.id,
            },
          });

          if (existingProject) {
            console.log(`📋 Project already exists: ${projectData.name}`);
            continue;
          }

          const project = await createProject(
            {
              name: projectData.name,
              textInput: projectData.textInput,
              status: projectData.status as any,
            },
            user.id,
            tenant.id
          );

          console.log(`📋 Created project: ${project.name}`);

          // Create invention if provided
          if (projectData.invention) {
            const inventionData = projectData.invention;
            
            const invention = await inventionRepository.upsert({
              projectId: project.id,
              inventionData: {
                title: inventionData.title,
                abstract: inventionData.abstract,
                technicalField: inventionData.technicalField,
              },
            });

            console.log(`💡 Created invention: ${invention.title}`);

            // Create claims
            await ClaimRepository.createClaimsForInvention(
              invention.id,
              inventionData.claims
            );

            console.log(`📝 Created ${inventionData.claims.length} claims`);
          }

          // Create search history if provided
          if (projectData.searchHistory) {
            for (const searchData of projectData.searchHistory) {
              await createSearchHistory({
                query: searchData.query,
                results: searchData.results ? JSON.parse(searchData.results) : undefined,
                projectId: project.id,
                userId: user.id,
              });
            }

            console.log(`🔍 Created ${projectData.searchHistory.length} search history entries`);
          }

          // Create user privacy settings
          await prisma.userPrivacy.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              dataProcessingConsent: true,
              marketingConsent: false,
              consentedAt: new Date(),
              dataRetentionDays: 365,
            },
          });
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${seedData.tenants.length} tenants created`);
    console.log(`   - ${seedData.tenants.reduce((acc, t) => acc + t.users.length, 0)} users created`);
    console.log(`   - ${seedData.tenants.reduce((acc, t) => acc + t.users.reduce((acc2, u) => acc2 + u.projects.length, 0), 0)} projects created`);
    
    console.log('\n🎉 Database has been seeded with sample data!');
    console.log('You can now use the application with realistic test data.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    
    if (error instanceof ApplicationError) {
      console.error(`Application Error [${error.code}]: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase(); 