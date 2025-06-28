import { BaseSeeder } from './base-seeder';

export class UserSeeder extends BaseSeeder {
  getName(): string {
    return 'User';
  }

  async shouldSeed(): Promise<boolean> {
    const count = await this.prisma.user.count();
    return count === 0;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up users...');
    // Clean up related data first
    await this.prisma.userPreference.deleteMany({});
    await this.prisma.userTenant.deleteMany({});
    await this.prisma.user.deleteMany({});
  }

  async seed(): Promise<void> {
    // Get all tenants
    const tenants = await this.prisma.tenant.findMany();

    if (tenants.length === 0) {
      throw new Error('No tenants found. Please run TenantSeeder first.');
    }

    // User templates
    const userTemplates = [
      {
        role: 'ADMIN',
        name: 'Admin User',
        email: 'admin@{slug}.patentdrafter.ai',
      },
      {
        role: 'INVENTOR',
        name: 'John Inventor',
        email: 'john.inventor@{slug}.patentdrafter.ai',
      },
      {
        role: 'ATTORNEY',
        name: 'Sarah Attorney',
        email: 'sarah.attorney@{slug}.patentdrafter.ai',
      },
      {
        role: 'REVIEWER',
        name: 'Mike Reviewer',
        email: 'mike.reviewer@{slug}.patentdrafter.ai',
      },
    ];

    for (const tenant of tenants) {
      this.log(`Creating users for tenant: ${tenant.name}`);

      for (const template of userTemplates) {
        const userData = {
          id: this.generateId(
            `user-${tenant.slug}-${template.role.toLowerCase()}`
          ),
          email: template.email.replace('{slug}', tenant.slug),
          name: template.name,
          role: template.role,
          isVerified: true,
          lastLogin: this.daysAgo(Math.floor(Math.random() * 7)),
          createdAt: tenant.createdAt,
          updatedAt: this.daysAgo(Math.floor(Math.random() * 30)),
        };

        const user = await this.prisma.user.create({ data: userData });

        // Create user-tenant relationship
        await this.prisma.userTenant.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
            role: template.role,
          },
        });

        // Create user preferences
        const preferences = [
          { key: 'theme', value: 'light' },
          { key: 'notifications.email', value: 'true' },
          { key: 'notifications.inApp', value: 'true' },
          { key: 'defaultView', value: 'dashboard' },
          { key: 'language', value: 'en' },
        ];

        for (const pref of preferences) {
          await this.prisma.userPreference.create({
            data: {
              userId: user.id,
              key: pref.key,
              value: pref.value,
            },
          });
        }

        this.log(`Created user: ${userData.email} (${userData.role})`);
      }
    }
  }
}
