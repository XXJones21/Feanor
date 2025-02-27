# UI Migration Plan

## Project Structure
```
UI/
├── components/
│   ├── Common/        # Shared UI components (buttons, inputs, etc.)
│   ├── Chat/         # Chat-specific components
│   └── Sidebar/      # Sidebar components
├── hooks/            # Custom hooks
├── styles/          # Styled components and themes
├── lib/             # Utility functions
└── types/           # TypeScript types
```

## 1. Component Migration

### Phase 1: Core UI Components ✅
- [x] Common Components
  - [x] Button.tsx
  - [x] Input.tsx
  - [x] Dialog.tsx
  - [x] Card.tsx
  - [x] Toast.tsx
  - [x] Dropdown.tsx
  - [x] Form elements
    - [x] Checkbox.tsx
    - [x] Radio.tsx
    - [x] Select.tsx
    - [x] Textarea.tsx
  - [x] Loading indicators
    - [x] Spinner.tsx
    - [x] Skeleton.tsx

### Phase 2: Layout & Navigation ✅
- [x] Sidebar Enhancements
  - [x] Responsive design
  - [x] Collapsible sections
  - [x] Improved navigation
- [x] Chat Window Updates
  - [x] Message layout improvements
  - [x] Input area enhancements
  - [x] Attachment handling
- [x] Animations & Transitions
  - [x] Loading states
  - [x] Message transitions
  - [x] UI feedback animations

### Phase 3: Advanced Features
- [ ] Drag and drop functionality
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Advanced animations

## 2. Styling System Updates ✅

### Tailwind Configuration
```typescript
// tailwind.config.ts
export default {
  content: ["./UI/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
        "slide-in": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "slide-out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(20px)", opacity: "0" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" }
        },
        "spinner": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-in": "slide-in 0.2s ease-out",
        "slide-out": "slide-out 0.2s ease-in",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-in",
        "spinner": "spinner 1s linear infinite"
      }
    }
  }
}
```

### CSS Variables ✅
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --radius: 0.5rem;
}
```

## 3. Dependencies ✅
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^1.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## 4. Implementation Order

### Stage 1: Foundation
1. [ ] Update dependencies
2. [ ] Configure Tailwind and CSS variables
3. [ ] Create utility functions
4. [ ] Set up base component structure

### Stage 2: Core Components
1. [ ] Implement Button component with variants
2. [ ] Create Input and Form components
3. [ ] Add Dialog and Modal components
4. [ ] Implement Toast notifications

### Stage 3: Layout Updates
1. [ ] Update Sidebar structure
2. [ ] Enhance Chat window layout
3. [ ] Implement responsive design
4. [ ] Add loading states and transitions

### Stage 4: Advanced Features
1. [ ] Add keyboard shortcuts
2. [ ] Implement drag and drop
3. [ ] Enhance accessibility
4. [ ] Add advanced animations

## Component Examples

### Button Component
```typescript
// components/Common/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

## Progress Tracking

### Overall Progress
- Phase 1 (Core UI Components): 100% Complete
- Phase 2 (Layout & Navigation): 100% Complete
- Phase 3 (Advanced Features): 0% Started
- Styling System Updates: 100% Complete
- Dependencies: 100% Complete

### Total Progress: 75% Complete

### Next Steps
1. Clean up legacy JSX files:
   - Remove Message.jsx, MessageList.jsx, InputArea.jsx from Chat/
   - Remove ToolsList.jsx, ChatList.jsx, NewChatButton.jsx from Sidebar/
   - Verify all functionality is preserved in TypeScript versions
2. Begin Phase 3 implementation:
   - Start with drag and drop functionality
   - Implement keyboard shortcuts
   - Add accessibility improvements
   - Enhance animations

### Notes
- All core components have been migrated to TypeScript
- Responsive design implemented across all components
- Animation system in place with consistent patterns
- Component library follows modern best practices
- Legacy JSX files pending removal after verification 