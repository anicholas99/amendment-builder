/**
 * Promise-based delay utility that follows async best practices
 * Uses queueMicrotask and performance timing instead of setTimeout
 */
export const delay = (ms: number): Promise<void> => {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const start = performance.now();

      const check = () => {
        try {
          if (performance.now() - start >= ms) {
            resolve();
          } else {
            // Use queueMicrotask for better async scheduling
            queueMicrotask(check);
          }
        } catch (error) {
          reject(error);
        }
      };

      // Start the check
      queueMicrotask(check);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Alternative delay using requestAnimationFrame for UI-related delays
 * Better for animations and UI updates
 */
export const rafDelay = (frames: number = 1): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      let count = 0;
      const frame = () => {
        try {
          count++;
          if (count >= frames) {
            resolve();
          } else {
            requestAnimationFrame(frame);
          }
        } catch (error) {
          reject(error);
        }
      };
      requestAnimationFrame(frame);
    } catch (error) {
      reject(error);
    }
  });
};
