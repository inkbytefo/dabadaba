# Hooks Documentation

This document details the custom React hooks located in the `src/hooks` directory. These hooks provide reusable functionality across the application.

## Responsive Design Hooks

### `useMediaQuery`

A hook for responding to CSS media queries.

```typescript
function useMediaQuery(query: string): boolean
```

**Parameters:**
- `query`: CSS media query string (e.g., `'(min-width: 768px)'`)

**Returns:**
- `boolean`: Whether the media query matches

**Usage Example:**
```typescript
const isDesktop = useMediaQuery('(min-width: 1024px)');

if (isDesktop) {
  // Render desktop layout
} else {
  // Render mobile layout
}
```

### `useIsMobile`

A simplified hook for mobile detection using a predefined breakpoint (768px).

```typescript
function useIsMobile(): boolean
```

**Returns:**
- `boolean`: Whether the viewport width is less than 768px

**Usage Example:**
```typescript
const isMobile = useIsMobile();

return (
  <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
    {/* Content */}
  </div>
);
```

## Performance Hooks

### `useDebounce`

A hook that delays updating a value until a specified timeout has elapsed.

```typescript
function useDebounce<T>(value: T, delay?: number): T
```

**Parameters:**
- `value`: The value to debounce
- `delay`: Timeout in milliseconds (default: 500ms)

**Returns:**
- The debounced value

**Usage Example:**
```typescript
const searchQuery = 'hello';
const debouncedQuery = useDebounce(searchQuery, 300);

// Only triggers API call after 300ms of no changes
useEffect(() => {
  searchUsers(debouncedQuery);
}, [debouncedQuery]);
```

## Feedback Hooks

### `useToast`

A hook for managing toast notifications with a centralized state.

```typescript
function useToast(): {
  toasts: ToasterToast[];
  toast: (props: Toast) => { id: string; dismiss: () => void; update: (props: ToasterToast) => void };
  dismiss: (toastId?: string) => void;
}
```

**Features:**
- Toast limit management
- Auto-dismissal
- Toast updates
- Custom actions
- Flexible positioning

**Usage Example:**
```typescript
const { toast } = useToast();

// Show success toast
toast({
  title: "Success",
  description: "Message sent successfully",
  variant: "success"
});

// Show error toast with action
toast({
  title: "Error",
  description: "Failed to send message",
  variant: "destructive",
  action: <button onClick={retry}>Retry</button>
});
```

## Real-World Examples

### Responsive Chat Layout
```typescript
function ChatLayout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="layout">
      {!isMobile && <Sidebar />}
      <ChatWindow />
      {isMobile && <MobileNavigation />}
    </div>
  );
}
```

### Search with Debouncing
```typescript
function UserSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

### Toast Notifications
```typescript
function MessageSender() {
  const { toast } = useToast();
  
  const sendMessage = async () => {
    try {
      await submitMessage(content);
      toast({
        title: "Sent",
        description: "Message sent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
}
```

## Best Practices

1. **Media Queries**
   - Use `useMediaQuery` for custom breakpoints
   - Use `useIsMobile` for standard mobile detection
   - Combine with CSS for optimal responsive design

2. **Debouncing**
   - Use for expensive operations (API calls, searches)
   - Choose appropriate delay based on operation
   - Consider UX impact when setting delay

3. **Toast Notifications**
   - Keep messages concise
   - Use appropriate variants for context
   - Include actions when relevant
   - Consider auto-dismiss timing

4. **Performance Considerations**
   - Avoid nested hook calls
   - Memoize values when needed
   - Clean up subscriptions in useEffect
