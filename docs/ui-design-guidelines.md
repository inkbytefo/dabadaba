# XCORD UI Design Guidelines

This document outlines the UI design principles and components used in the XCORD messenger application. The design system is built on Shadcn UI, providing a consistent, accessible, and modern user experience.

## Design System

### Colors

```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--secondary: 210 40% 96.1%;
--accent: 210 40% 96.1%;
--muted: 210 40% 96.1%;
--destructive: 0 84.2% 60.2%;
```

Dark mode variants are automatically handled by Tailwind's dark mode system.

### Typography

- **Font Family**: Inter (Primary), System UI (Fallback)
- **Base Size**: 16px (1rem)
- **Scale**:
  - xs: 0.75rem
  - sm: 0.875rem
  - base: 1rem
  - lg: 1.125rem
  - xl: 1.25rem
  - 2xl: 1.5rem

## Layout Components

### Top Navigation
- Fixed position at the top
- Contains user avatar, search bar, and primary actions
- Responsive design with mobile menu
- Height: 64px

### Sidebar
- Fixed position on the left
- Width: 280px (desktop), full width (mobile)
- Contains navigation links and user lists
- Collapsible on mobile

### Main Content Area
- Responsive padding and margins
- Maximum width: 1200px
- Content centered within container
- Proper spacing between sections (1.5rem)

## UI Components

### Buttons
- Primary: Solid background with white text
- Secondary: Outlined style
- Ghost: Text-only style
- Icon buttons: Square aspect ratio
- Loading states with spinners
- Disabled states with reduced opacity

### Forms
- Consistent input heights (40px)
- Clear focus states
- Validation styles (error, success)
- Helper text position
- Required field indicators

### Cards
- Consistent padding (1rem)
- Rounded corners (0.5rem)
- Subtle shadows
- Hover states
- Content hierarchy

### Messaging Components
- **Chat Window**:
  - Message bubbles with different styles for sent/received
  - Timestamp positioning
  - Media content handling
  - Link previews
- **Input Area**:
  - Expandable text area
  - Attachment options
  - Send button alignment
- **Read Receipts**:
  - Subtle indication
  - Multiple states (sent, delivered, read)

### Lists and Grids
- Consistent spacing
- Clear hierarchy
- Interactive states
- Loading states
- Empty states

## Interactive Elements

### Feedback
- Toast notifications
- Loading states
- Error messages
- Success confirmations
- Progress indicators

### Modals and Dialogs
- Centered positioning
- Backdrop blur
- Close button placement
- Action button alignment
- Mobile-responsive sizing

## Accessibility

### Color Contrast
- All text meets WCAG 2.1 AA standards
- Interactive elements have sufficient contrast
- Focus indicators are visible

### Keyboard Navigation
- Focus trap in modals
- Skip links
- Logical tab order
- Visible focus states

### Screen Readers
- ARIA labels
- Role attributes
- Meaningful alt text
- Status updates

## Responsive Design

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile Considerations
- Touch targets (minimum 44x44px)
- Simplified navigation
- Stack layouts
- Reduced animations
- Gesture support

## Animation Guidelines

### Transitions
- Duration: 150ms-300ms
- Easing: ease-in-out
- Use for:
  - Page transitions
  - Modal open/close
  - List item changes
  - Form feedback

### Loading States
- Skeleton loaders for content
- Spinner for actions
- Progress bars for uploads
- Smooth opacity transitions

## Best Practices

1. **Consistency**
   - Use defined components
   - Maintain spacing patterns
   - Follow color system
   - Apply typography scale

2. **Performance**
   - Optimize images
   - Lazy load content
   - Minimize animations
   - Cache resources

3. **Accessibility**
   - Test with screen readers
   - Support keyboard navigation
   - Provide text alternatives
   - Maintain focus management

4. **Responsiveness**
   - Mobile-first approach
   - Fluid typography
   - Flexible layouts
   - Touch-friendly

## Component Implementation

For detailed component implementation, refer to the `components.md` documentation and the `ui` directory in the source code.
