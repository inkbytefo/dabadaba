# Code Structure Documentation

This document outlines the code structure of the messenger application, providing a high-level overview of each directory and its purpose.

## `src` Directory

The `src` directory is the main source code directory of the application. It contains all the application logic, components, and assets.

### Subdirectories

- **`components`**: This directory contains React components used throughout the application. It is organized into subdirectories:
    - **`ui`**: Contains reusable UI primitives and components built using Shadcn UI. These components are designed to be generic and reusable across different parts of the application.
    - **`MessengerLayout`**: Contains layout components specific to the messenger interface, including ChatView and GroupsView.
    
- **`hooks`**: Contains custom React hooks that encapsulate reusable logic:
    - `use-debounce`: For debouncing function calls
    - `use-media-query`: For responsive design media queries
    - `use-mobile`: For mobile device detection
    - `use-toast`: For managing toast notifications

- **`lib`**: Contains utility functions and library code:
    - **`firebase`**: Firebase initialization and configuration
    - `link-preview`: Utility for generating link previews
    - `utils`: General utility functions

- **`pages`**: Contains React components that represent different routes:
    - **`auth`**: Authentication-related pages (Login, Register, ForgotPassword, AuthCallback)
    - `AppSettings`: Application settings page
    - `Index`: Main landing page
    - `NotFound`: 404 error page
    - `Settings`: User settings page

- **`services`**: Contains services for backend interaction:
    - **`auth`**: Firebase authentication services
    - **`firestore`**: Firestore database services (conversations, friends, groups, messages, users)
    - **`storage`**: Firebase storage services

- **`store`**: Contains Zustand stores for state management:
    - `messaging`: State management for messaging features

- **`types`**: Contains TypeScript type definitions:
    - `environment.d.ts`: Environment variable types
    - `models.ts`: Data model interfaces

### Root Files

- **`App.tsx`**: Main application component with routing and layout setup
- **`index.css`**: Global CSS styles
- **`main.tsx`**: Application entry point
- **`vite-env.d.ts`**: Vite environment type declarations

## Project Configuration Files

- **`.firebaserc`**: Firebase project configuration
- **`firebase.json`**: Firebase service configuration
- **`firestore.rules`**: Firestore security rules
- **`storage.rules`**: Firebase Storage security rules
- **`vite.config.ts`**: Vite build configuration
- **`tsconfig.json`**: TypeScript configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration
