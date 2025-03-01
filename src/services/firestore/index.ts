import {
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

// Re-export all Firestore services
export * from './users';
export * from './messaging';
export * from './groups';
export * from './friends';

// Export service namespaces for organization
import * as users from './users';
import * as messaging from './messaging';
import * as groups from './groups';
import * as friends from './friends';

// Retry operation with exponential backoff
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 100;

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retryCount: number = 0
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retryCount >= MAX_RETRIES || error.code === 'permission-denied') {
      throw error;
    }

    const backoffTimeMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
    console.warn(`Retrying operation after ${backoffTimeMs}ms due to error:`, error);
    await new Promise(resolve => setTimeout(resolve, backoffTimeMs));
    return retryOperation(operation, retryCount + 1);
  }
};

// Export as namespaces for when you want to use service-specific imports
export const FirestoreServices = {
  users,
  messaging,
  groups,
  friends,
};

export default FirestoreServices;
