# Code Structure Documentation

This document outlines the code structure of the messenger application, providing a high-level overview of each directory and its purpose.

## `src` Directory

The `src` directory is the main source code directory of the application. It contains all the application logic, components, and assets.

### Subdirectories

- **`components`**: This directory contains React components used throughout the application. It is further organized into subdirectories:
    - **`ui`**: Contains reusable UI primitives and components built using Shadcn UI. These components are designed to be generic and reusable across different parts of the application.
- **`hooks`**: This directory contains custom React hooks. These hooks encapsulate reusable logic and provide a way to abstract complex functionalities.
- **`lib`**: This directory contains library code and utility functions. It includes files for Firebase initialization, link preview generation, and general utility functions.
- **`pages`**: This directory contains React components that represent different pages or routes of the application. It includes:
    - **`auth`**: Contains components related to authentication pages like login, register, and auth callback.
- **`services`**: This directory contains services for interacting with backend services or external APIs. It currently includes a service for Firebase.
- **`store`**: This directory contains the Zustand store for application state management. It includes state slices related to messaging.
- **`types`**: This directory contains TypeScript type definitions for the application's data models and interfaces.
- **`integrations`**: This directory is currently empty and might be intended for future integrations with external services.
- **`lib`**: This directory contains utility functions and library code.

### Files

- **`App.tsx`**: The main application component that sets up the application layout and routing.
- **`index.css`**: Global CSS styles for the application.
- **`main.tsx`**: Entry point of the React application, responsible for rendering the `App` component.
- **`vite-env.d.ts`**: TypeScript declaration file for Vite environment variables.

This document will be expanded with more details about each subdirectory and important files in the following sections.