import { WithId } from '../firebase/core';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  context: string,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T | null> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${context}:`, error);
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  return null;
};