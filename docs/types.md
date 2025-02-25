# Types Documentation

This document provides details about the TypeScript type definitions located in the `src/types` directory. These types define the data models and interfaces used throughout the application.

## Type Definitions

- **`models.ts`**: This file contains the main data models for the messenger application. It likely defines interfaces and types for:
    - **User**: User data model, including properties like user ID, name, avatar, online status, etc.
    - **Message**: Message data model, defining the structure of messages in conversations, including content, sender, timestamp, message type, etc. (Refer to `implementation-plan.md` for the `Message` interface definition).
    - **Conversation**: Conversation data model, representing one-to-one chats or group conversations, including participants, last message, etc.
    - **Channel**: Channel data model, if channels are used in the application, defining channel properties and structure.
    - **FriendRequest**: Friend request data model, defining the structure of friend requests between users.

This document will be expanded with more details about each type definition and its properties in the following sections. For detailed information about the `Message` type, refer to the [Implementation Plan Documentation](./implementation-plan.md).