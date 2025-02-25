# Store Documentation

This document provides details about the Zustand store located in the `src/store` directory. The store manages the application's global state using Zustand.

## Zustand Stores

- **`messaging.ts`**: This file defines the Zustand store for messaging-related state. It likely manages state for:
    - **Conversations**: Active conversations, conversation lists, selected conversation.
    - **Messages**: Messages within a conversation, message loading, sending status.
    - **Users**: User presence, online status, user lists.
    - **UI State**: Chat window UI state, typing indicators, read receipts display.

This document will be expanded with more details about the store's state slices, actions, and usage in components in the following sections.