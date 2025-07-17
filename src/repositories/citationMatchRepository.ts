/**
 * Citation Match Repository
 *
 * Re-exports all citation match repository functions from modular files.
 * This maintains backward compatibility while organizing the code better.
 *
 * The functionality has been split into focused modules:
 * - Location management: ./citation/citationMatchLocationRepository
 * - Reasoning operations: ./citation/citationMatchReasoningRepository
 * - CRUD operations: ./citation/citationMatchCrudRepository
 * - Query operations: ./citation/citationMatchQueryRepository
 * - Transaction operations: ./citation/citationMatchTransactionRepository
 * - Deep analysis: ./citation/citationMatchDeepAnalysisRepository
 */

// Re-export everything from the modular repositories
export * from './citation';
