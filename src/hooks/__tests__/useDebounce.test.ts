/**
 * Unit tests for useDebounce hook
 */
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 499ms
    act(() => {
      jest.advanceTimersByTime(499);
    });
    
    // Value should still not be updated
    expect(result.current).toBe('initial');

    // Fast-forward time by 1ms more (total 500ms)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    
    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset debounce timer on multiple rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // First update
    rerender({ value: 'update1', delay: 500 });
    
    // Fast-forward by 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Second update before first debounce completes
    rerender({ value: 'update2', delay: 500 });
    
    // Fast-forward by another 300ms (total 600ms from first update, but only 300ms from second)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Value should still be initial because second timer was reset
    expect(result.current).toBe('initial');

    // Fast-forward by 200ms more to complete the second timer
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Now value should be update2
    expect(result.current).toBe('update2');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    // Update with new delay
    rerender({ value: 'updated', delay: 200 });
    
    // Fast-forward by 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Value should be updated with the new delay
    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'updated', delay: 0 });
    
    // With zero delay, update should happen in next tick
    act(() => {
      jest.advanceTimersByTime(0);
    });
    
    expect(result.current).toBe('updated');
  });

  it('should handle object values', () => {
    const initialObj = { name: 'initial' };
    const updatedObj = { name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 500 } }
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj, delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe(updatedObj);
  });

  it('should cleanup timeout on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    
    // Unmount before timeout completes
    unmount();
    
    // Fast-forward past the timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // No errors should occur (cleanup worked)
  });

  it('should work with undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: undefined, delay: 500 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'defined', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('defined');

    rerender({ value: undefined, delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBeUndefined();
  });
});