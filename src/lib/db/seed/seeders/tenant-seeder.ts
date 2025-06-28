import { BaseSeeder } from './base-seeder';
import { PrismaClient } from '@prisma/client';

export class TenantSeeder extends BaseSeeder {
  getName(): string {
    return 'Tenant';
  }

  async shouldSeed(): Promise<boolean> {
    const count = await this.prisma.tenant.count();
    return count === 0;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up tenants...');

    // Delete in correct order to respect foreign keys
    await this.prisma.project.deleteMany({});
    await this.prisma.user.deleteMany({});
    await this.prisma.tenant.deleteMany({});
  }

  async seed(): Promise<void> {
    const tenantsData = [
      {
        id: this.generateId('tenant-acme'),
        name: 'ACME Corporation',
        slug: 'acme',
        domain: 'acme.patentdrafter.ai',
        settings: {
          primaryColor: '#0066CC',
          logoUrl: '/images/tenants/acme-logo.png',
          features: {
            advancedSearch: true,
            aiSuggestions: true,
            collaborativeEditing: true,
          },
        },
        createdAt: this.daysAgo(365),
        updatedAt: this.daysAgo(30),
      },
      {
        id: this.generateId('tenant-techstartup'),
        name: 'TechStartup Inc',
        slug: 'techstartup',
        domain: 'techstartup.patentdrafter.ai',
        settings: {
          primaryColor: '#00AA55',
          logoUrl: '/images/tenants/techstartup-logo.png',
          features: {
            advancedSearch: true,
            aiSuggestions: true,
            collaborativeEditing: false,
          },
        },
        createdAt: this.daysAgo(180),
        updatedAt: this.daysAgo(7),
      },
      {
        id: this.generateId('tenant-development'),
        name: 'Development Tenant',
        slug: 'development',
        domain: 'localhost:3000',
        settings: {
          primaryColor: '#FF6B6B',
          logoUrl: null,
          features: {
            advancedSearch: true,
            aiSuggestions: true,
            collaborativeEditing: true,
            debugMode: true,
          },
        },
        createdAt: this.daysAgo(30),
        updatedAt: new Date(),
      },
    ];

    const tenantsToCreate = tenantsData.map(tenant => ({
      ...tenant,
      settings: tenant.settings ? JSON.stringify(tenant.settings) : null,
    }));

    for (const tenant of tenantsToCreate) {
      await this.prisma.tenant.create({
        data: tenant,
      });
      this.log(`Created tenant: ${tenant.name} (${tenant.slug})`);
    }
  }
}
