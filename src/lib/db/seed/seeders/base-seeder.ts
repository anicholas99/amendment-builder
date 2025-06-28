import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/monitoring/logger';

export interface SeederOptions {
  force?: boolean; // Force re-seeding even if data exists
  verbose?: boolean; // Enable verbose logging
}

export abstract class BaseSeeder {
  protected prisma: PrismaClient;
  protected options: SeederOptions;

  constructor(prisma: PrismaClient, options: SeederOptions = {}) {
    this.prisma = prisma;
    this.options = {
      force: false,
      verbose: true,
      ...options,
    };
  }

  /**
   * Check if seeding is needed
   */
  abstract shouldSeed(): Promise<boolean>;

  /**
   * Perform the actual seeding
   */
  abstract seed(): Promise<void>;

  /**
   * Clean up existing data before re-seeding
   */
  abstract cleanup(): Promise<void>;

  /**
   * Get the name of this seeder
   */
  abstract getName(): string;

  /**
   * Run the seeder
   */
  async run(): Promise<void> {
    const name = this.getName();

    try {
      this.log(`Starting ${name} seeder...`);

      const shouldSeed = await this.shouldSeed();

      if (!shouldSeed && !this.options.force) {
        this.log(`${name} seeder skipped - data already exists`);
        return;
      }

      if (this.options.force) {
        this.log(`Force seeding enabled - cleaning up existing data...`);
        await this.cleanup();
      }

      await this.seed();

      this.log(`${name} seeder completed successfully`);
    } catch (error) {
      logger.error(`${name} seeder failed`, { error });
      throw error;
    }
  }

  /**
   * Log a message if verbose mode is enabled
   */
  protected log(message: string): void {
    if (this.options.verbose) {
      logger.info(`[Seeder] ${message}`);
    }
  }

  /**
   * Generate a deterministic UUID from a seed string
   * Useful for creating consistent IDs across seed runs
   */
  protected generateId(seed: string): string {
    // Simple deterministic ID generation using crypto
    // Create a hash of the seed for deterministic results
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(seed).digest('hex');

    // Format as UUID v4
    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      '4' + hash.substring(13, 16),
      ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
        hash.substring(17, 20),
      hash.substring(20, 32),
    ].join('-');
  }

  /**
   * Create a date relative to now
   */
  protected daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   * Create a date in the future
   */
  protected daysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
