# Lib Documentation

This document provides details about the library code and utility functions located in the `src/lib` directory.

## Firebase Configuration (`firebase/index.ts`)

Firebase service initialization and configuration.

### Configuration

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
```

### Exports

```typescript
export const auth: Auth;         // Firebase Authentication instance
export const db: Firestore;      // Firestore instance
export const storage: Storage;   // Firebase Storage instance
```

### Features
- Singleton pattern for Firebase app initialization
- Environment variable validation
- Global auth object for convenience
- Type declarations for global window object

### Usage Example
```typescript
import { auth, db, storage } from '@/lib/firebase';

// Authentication
const user = auth.currentUser;

// Firestore
const docRef = doc(db, 'users', userId);

// Storage
const storageRef = ref(storage, 'avatars/user123.jpg');
```

## Link Preview (`link-preview.ts`)

Utility for generating link previews using the noembed.com service.

### Interface

```typescript
interface LinkPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

async function fetchLinkPreview(url: string): Promise<LinkPreview | null>
```

### Features
- Fetches metadata for URLs
- Error handling
- Null return for failed fetches
- TypeScript type safety

### Usage Example
```typescript
const preview = await fetchLinkPreview('https://example.com');
if (preview) {
  const { title, description, image, url } = preview;
  // Use preview data
}
```

## Utilities (`utils.ts`)

General utility functions used throughout the application.

### Class Name Utility

```typescript
function cn(...inputs: ClassValue[]): string
```

A utility function that combines Tailwind CSS classes using `clsx` and `tailwind-merge`.

#### Features
- Merges class names
- Handles conditional classes
- Resolves Tailwind conflicts
- TypeScript support

#### Usage Examples

```typescript
// Basic usage
const className = cn(
  "base-class",
  isActive && "active",
  variant === "primary" ? "bg-blue-500" : "bg-gray-500"
);

// With conditional classes
const buttonClass = cn(
  "px-4 py-2 rounded",
  {
    "bg-blue-500 hover:bg-blue-600": variant === "primary",
    "bg-gray-500 hover:bg-gray-600": variant === "secondary",
  }
);

// Merging Tailwind classes
const mergedClass = cn(
  "px-2 py-1 bg-red-500",
  "px-4 py-2 bg-blue-500" // This will override the previous values
);
```

## Best Practices

1. **Firebase Setup**
   - Always validate environment variables
   - Use type-safe Firebase references
   - Clean up listeners when components unmount
   - Handle Firebase errors appropriately

2. **Link Previews**
   - Cache preview results when possible
   - Handle failed preview fetches gracefully
   - Consider rate limiting for preview requests
   - Implement error boundaries for preview components

3. **Class Names**
   - Use the `cn` utility for all class name combinations
   - Keep class names organized and readable
   - Use TypeScript for better type safety
   - Follow Tailwind's convention for responsive design

## Error Handling

```typescript
// Firebase errors
try {
  // Firebase operations
} catch (error) {
  if (error instanceof FirebaseError) {
    // Handle specific Firebase error codes
  }
}

// Link preview errors
const preview = await fetchLinkPreview(url).catch(error => {
  console.error('Failed to fetch preview:', error);
  return null;
});
```

## Type Safety

```typescript
// Declaring global types
declare global {
  interface Window {
    auth: Auth;
  }
}

// Using type-safe class names
type ButtonVariant = 'primary' | 'secondary';
const getButtonClass = (variant: ButtonVariant) => 
  cn("base", variant === 'primary' ? "primary-class" : "secondary-class");
```
