import { useState, useRef, useEffect } from 'react';

interface UseAnalysisProgressOptions {
  isAnalyzing: boolean;
  estimatedDurationMs?: number;
}

/**
 * Custom hook for managing analysis progress simulation
 * Extracts the complex progress timer logic from components
 */
export const useAnalysisProgress = ({
  isAnalyzing,
  estimatedDurationMs = 15000, // 15 seconds default
}: UseAnalysisProgressOptions) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animateProgress = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsedTime = timestamp - startTimeRef.current;
      const progress = Math.min(100, (elapsedTime / estimatedDurationMs) * 100);
      setAnalysisProgress(progress);

      if (elapsedTime < estimatedDurationMs) {
        animationFrameRef.current = requestAnimationFrame(animateProgress);
      } else {
        setAnalysisProgress(100);
      }
    };

    if (isAnalyzing) {
      setAnalysisProgress(0);
      startTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animateProgress);
    } else {
      setAnalysisProgress(0); // Reset when not analyzing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, estimatedDurationMs]);

  return analysisProgress;
};
