# Pages Documentation

This document provides details about the React page components located in the `src/pages` directory. These components define the different routes and views of the application.

## Page Components

- **`Index.tsx`**: This is likely the main or home page of the application. It might display the messenger layout, friend list, and chat window.
- **`NotFound.tsx`**: This component is rendered when the user navigates to a non-existent route. It displays a "404 Not Found" page.
- **`auth`**: This directory contains authentication-related pages:
    - **`Auth.tsx`**: This component might be the main authentication page, handling login and registration options or redirecting to the appropriate authentication flow.
    - **`AuthCallback.tsx`**: This component is likely used for handling authentication callbacks, especially for OAuth providers. It processes the authentication response and redirects the user to the main application.
    - **`Register.tsx`**: This component provides the registration page, allowing new users to create an account.

This document will be expanded with more details about each page's purpose, routing, and functionality in the following sections.