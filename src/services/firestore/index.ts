// Re-export all Firestore services
export * from './users';
export * from './messages';
export * from './conversations';
export * from './groups';
export * from './friends';

// Export service namespaces for organization
import * as users from './users';
import * as messages from './messages';
import * as conversations from './conversations';
import * as groups from './groups';
import * as friends from './friends';

// Export as namespaces for when you want to use service-specific imports
export const FirestoreServices = {
  users,
  messages,
  conversations,
  groups,
  friends,
};

export default FirestoreServices;
