/**
 * Tests for ProsecutionTimelineService
 * 
 * Verifies timeline-aware Office Action status determination
 */

import { ProsecutionTimelineService, USPTODocument } from '../prosecutionTimeline.server-service';
import { ProsecutionEventType } from '@/lib/api/uspto/types/prosecution-events';

describe('ProsecutionTimelineService', () => {
  // Helper to create test documents
  const createDoc = (
    code: string, 
    mailDate: string, 
    id: string = `doc-${code}-${mailDate}`
  ): USPTODocument => ({
    documentId: id,
    documentCode: code,
    description: `Test ${code}`,
    mailDate,
  });

  describe('buildTimelineSequence', () => {
    it('should sort documents by mail date', () => {
      const docs = [
        createDoc('CTNF', '2024-03-01'),
        createDoc('APP.FILE.REC', '2023-01-01'),
        createDoc('A', '2024-06-01'),
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);

      expect(timeline).toHaveLength(3);
      expect(timeline[0].type).toBe(ProsecutionEventType.APPLICATION_FILED);
      expect(timeline[1].type).toBe(ProsecutionEventType.NON_FINAL_OA);
      expect(timeline[2].type).toBe(ProsecutionEventType.RESPONSE_FILED);
    });

    it('should filter out non-milestone documents', () => {
      const docs = [
        createDoc('CTNF', '2024-01-01'),
        createDoc('MISC', '2024-02-01'), // Not a milestone
        createDoc('A', '2024-03-01'),
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);

      expect(timeline).toHaveLength(2);
      expect(timeline[0].documentCode).toBe('CTNF');
      expect(timeline[1].documentCode).toBe('A');
    });
  });

  describe('findCurrentOfficeAction', () => {
    it('should return the latest OA when no response exists', () => {
      const docs = [
        createDoc('APP.FILE.REC', '2023-01-01'),
        createDoc('CTNF', '2023-06-01'),
        createDoc('CTNF', '2024-01-01'), // Latest OA, no response
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const currentOA = ProsecutionTimelineService.findCurrentOfficeAction(timeline);

      expect(currentOA).not.toBeNull();
      expect(currentOA?.documentCode).toBe('CTNF');
      expect(currentOA?.date).toEqual(new Date('2024-01-01'));
    });

    it('should return null when all OAs have been responded to', () => {
      const docs = [
        createDoc('CTNF', '2023-06-01'),
        createDoc('A', '2023-09-01'),     // Response to first OA
        createDoc('CTNF', '2024-01-01'),
        createDoc('A', '2024-03-01'),     // Response to second OA
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const currentOA = ProsecutionTimelineService.findCurrentOfficeAction(timeline);

      expect(currentOA).toBeNull();
    });

    it('should handle subsequent OA as implicit response', () => {
      const docs = [
        createDoc('CTNF', '2023-06-01'),
        createDoc('CTFR', '2024-01-01'), // Final OA implies response to Non-Final
        // No response to Final OA yet
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const currentOA = ProsecutionTimelineService.findCurrentOfficeAction(timeline);

      expect(currentOA).not.toBeNull();
      expect(currentOA?.documentCode).toBe('CTFR');
      expect(currentOA?.type).toBe(ProsecutionEventType.FINAL_OA);
    });

    it('should handle Notice of Allowance as final event', () => {
      const docs = [
        createDoc('CTNF', '2023-06-01'),
        createDoc('A', '2023-09-01'),
        createDoc('NOA', '2024-01-01'), // Notice of Allowance
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const currentOA = ProsecutionTimelineService.findCurrentOfficeAction(timeline);

      expect(currentOA).toBeNull();
    });

    it('should handle RCE as response', () => {
      const docs = [
        createDoc('CTFR', '2023-06-01'), // Final OA
        createDoc('RCEX', '2023-08-01'), // RCE filed as response
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const currentOA = ProsecutionTimelineService.findCurrentOfficeAction(timeline);

      expect(currentOA).toBeNull();
    });
  });

  describe('calculateDeadline', () => {
    it('should calculate 3-month deadline for Non-Final OA', () => {
      const oa = {
        id: 'oa-1',
        date: new Date('2024-01-01'),
        type: ProsecutionEventType.NON_FINAL_OA,
        documentCode: 'CTNF',
        metadata: {},
      };

      const deadline = ProsecutionTimelineService.calculateDeadline(oa, []);

      expect(deadline).toEqual(new Date('2024-04-01'));
    });

    it('should calculate 2-month deadline for Final OA', () => {
      const oa = {
        id: 'oa-1',
        date: new Date('2024-01-01'),
        type: ProsecutionEventType.FINAL_OA,
        documentCode: 'CTFR',
        metadata: {},
      };

      const deadline = ProsecutionTimelineService.calculateDeadline(oa, []);

      expect(deadline).toEqual(new Date('2024-03-01'));
    });

    it('should extend deadline for extension documents', () => {
      const oa = {
        id: 'oa-1',
        date: new Date('2024-01-01'),
        type: ProsecutionEventType.NON_FINAL_OA,
        documentCode: 'CTNF',
        metadata: {},
      };

      const docs = [
        createDoc('XT/', '2024-02-01'), // Extension filed
      ];

      const deadline = ProsecutionTimelineService.calculateDeadline(oa, docs);

      expect(deadline).toEqual(new Date('2024-05-01')); // 3 months + 1 extension
    });
  });

  describe('getOfficeActionStatus', () => {
    it('should return PENDING_RESPONSE for current OA', () => {
      const docs = [
        createDoc('CTNF', '2024-01-01'),
      ];

      const status = ProsecutionTimelineService.getOfficeActionStatus(docs, docs[0]);

      expect(status).toBe('PENDING_RESPONSE');
    });

    it('should return COMPLETED for historical OA', () => {
      const docs = [
        createDoc('CTNF', '2023-06-01'),
        createDoc('A', '2023-09-01'),
        createDoc('CTNF', '2024-01-01'),
      ];

      const status = ProsecutionTimelineService.getOfficeActionStatus(docs, docs[0]);

      expect(status).toBe('COMPLETED');
    });
  });

  describe('getApplicationStatus', () => {
    it('should return ALLOWED when Notice of Allowance exists', () => {
      const docs = [
        createDoc('CTNF', '2023-06-01'),
        createDoc('A', '2023-09-01'),
        createDoc('NOA', '2024-01-01'),
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const status = ProsecutionTimelineService.getApplicationStatus(timeline);

      expect(status).toBe('ALLOWED');
    });

    it('should return PENDING_RESPONSE when OA needs response', () => {
      const docs = [
        createDoc('CTNF', '2024-01-01'),
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const status = ProsecutionTimelineService.getApplicationStatus(timeline);

      expect(status).toBe('PENDING_RESPONSE');
    });

    it('should return PENDING_EXAMINATION when all OAs responded', () => {
      const docs = [
        createDoc('CTNF', '2023-06-01'),
        createDoc('A', '2023-09-01'),
      ];

      const timeline = ProsecutionTimelineService.buildTimelineSequence(docs);
      const status = ProsecutionTimelineService.getApplicationStatus(timeline);

      expect(status).toBe('PENDING_EXAMINATION');
    });
  });
});