# Components Documentation

This document provides details about the React components located in the `src/components` directory.

## Core Components

- **`AuthProvider.tsx`**: This component is responsible for providing authentication context to the application. It likely wraps the application and manages user authentication state, making it available to other components.
- **`ChatWindow.tsx`**: This component renders the main chat window for a conversation. It is responsible for displaying messages, handling user input for sending messages, and managing the message display area.
- **`FriendRequestButton.tsx`**: This component provides a button to send friend requests to other users. It handles the UI for initiating friend requests and likely interacts with a service to send the request.
- **`FriendRequestItem.tsx`**: This component renders a single friend request item in a list. It displays information about the friend request and provides actions to accept or reject the request.
- **`FriendRequests.tsx`**: This component displays a list of friend requests for the current user. It fetches and renders a list of pending friend requests and uses `FriendRequestItem` to display each request.
- **`FriendsList.tsx`**: This component renders a list of friends for the current user. It fetches and displays a list of the user's friends and likely provides functionality to interact with the friend list.
- **`MediaUpload.tsx`**: This component handles media uploads in the chat. It provides UI elements for selecting and uploading media files (images, videos, etc.) and manages the upload process.
- **`MessageContent.tsx`**: This component is responsible for rendering the content of a single message. It handles different message types (text, media, etc.) and formats the message content for display.
- **`MessengerLayout.tsx`**: This component provides the main layout for the messenger application. It likely structures the overall UI, including the chat window, friend list, and other main sections.
- **`ReadReceipt.tsx`**: This component displays read receipts for messages. It indicates whether a message has been read by the recipient and provides visual feedback on message status.
- **`TypingIndicator.tsx`**: This component displays a typing indicator in the chat window when another user is typing. It provides real-time feedback to users about the typing status of their contacts.
- **`UserList.tsx`**: This component displays a list of users in the application. It might be used for searching users, displaying online users, or selecting users for starting a chat.

This document will be expanded with more details about each component's props, functionality, and usage in the following sections.