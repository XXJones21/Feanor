# UI Modernization Plan

## Project Structure Reorganization
- [x] Move Configuration Files to UI Directory
  - [x] Move `tsconfig.json` to `/UI`
  - [x] Move `postcss.config.mjs` to `/UI`
  - [x] Move `tailwind.config.ts` to `/UI`
  - [x] Update any relative paths in config files

- [x] Audit Existing Structure
  - [x] `/UI/components/`
    - [x] Review and update `ChatInterface.jsx` to TypeScript
    - [ ] Review and update `ParameterDialog.js` to TypeScript
    - [x] Audit `Chat/` directory components
    - [x] Audit `Sidebar/` directory components
    - [x] Audit `Common/` directory components
  - [x] `/UI/hooks/` - Review existing hooks
  - [x] `/UI/public/` - Audit static assets
  - [x] `/UI/lib/` - Review utilities

### Structure Audit Summary (Completed Jan 27, 2024)
#### Current Structure Overview
- `/UI/components/`
  - Main Components:
    - `ChatInterface.tsx` - Core chat interface (TypeScript converted)
    - `ParameterDialog.js` (4.3KB) - Parameter handling, needs TypeScript conversion
  - Subdirectories:
    - `Chat/` - Chat-specific components
    - `Sidebar/` - Navigation and sidebar components
    - `Common/` - Shared components

- `/UI/hooks/`
  - Contains `useChatHistory.js` (5.2KB) - Chat history management
  - Needs TypeScript conversion and potential splitting into smaller hooks

- `/UI/public/`
  - Contains `styles.css` (75KB) - Global styles
  - Large CSS file may need modularization and Tailwind integration

- `/UI/lib/`
  - Empty directory - Opportunity for utility functions and shared logic

#### Key Findings
1. TypeScript Migration Needed:
   - All major components are in JavaScript (.js/.jsx)
   - No TypeScript types defined yet
   - Configuration files ready for TypeScript

2. Component Organization:
   - Clear separation of concerns (Chat, Sidebar, Common)
   - Large components could be split into smaller ones
   - Need for more shared components in Common directory

3. State Management:
   - Single large hook managing chat history
   - Opportunity to break down into smaller, focused hooks
   - Need for additional hooks for tool management

4. Styling:
   - Moved Tailwind CSS to `/UI/styles.css`
   - Component-level styling structure in place with Tailwind classes
   - Ready for Shadcn UI integration

#### Next Steps Priority
1. Convert core components to TypeScript
2. Break down large components
3. Implement Tailwind styling
4. Develop utility functions in lib directory

## Dependencies Installation
- [ ] Core Dependencies (verify if already installed)
  - [ ] `@radix-ui/react-select`
  - [ ] `@radix-ui/react-scroll-area`
  - [ ] `@radix-ui/react-separator`
  - [ ] `lucide-react`
  - [ ] `class-variance-authority`
  - [ ] `clsx`
  - [ ] `tailwind-merge`

## Component Migration
- [ ] Update Existing Components
  - [x] `ChatInterface.tsx`
    - [x] Convert to TypeScript
    - [x] Implement new styling
    - [x] Integrate with new hooks
  - [ ] `ParameterDialog.tsx`
    - [ ] Convert to TypeScript
    - [ ] Update to use Shadcn UI components
  
- [ ] Chat Components (`/UI/components/Chat/`)
  - [ ] Review and update existing components
  - [ ] Integrate new styling
  - [ ] Add new components from sample UI

- [ ] Sidebar Components (`/UI/components/Sidebar/`)
  - [ ] Review and update existing components
  - [ ] Integrate new styling
  - [ ] Add new features from sample UI

- [ ] Common Components
  - [ ] Update error boundary
  - [ ] Add new shared components

## State Management
- [x] Review Existing Hooks
  - [x] Audit `/UI/hooks/` directory
  - [x] Identify reusable logic
  - [x] Plan hook updates

- [ ] Implement New Hooks
  - [x] Convert `useChatHistory.js` to TypeScript
  - [ ] Convert remaining hooks to TypeScript
  - [x] Add types to existing hooks

### Hook Migration Plan
1. useChatHistory Conversion:
   - [x] Add Message and ChatMessage types
   - [x] Add IpcRenderer types
   - [x] Add proper error handling
   - [x] Improve type safety
   - [x] Add proper return type interface
   - [x] Convert to modern React patterns

2. Remaining Hook Tasks:
   - [ ] Convert useTools to TypeScript
   - [ ] Add loading states
   - [ ] Add error boundaries
   - [ ] Add proper cleanup

## API Integration
- [ ] Review Current Integration
  - [ ] Audit existing API calls
  - [ ] Document current patterns
  - [ ] Identify improvement areas

- [ ] Service Layer Updates
  - [ ] Create or update API service files
  - [ ] Add TypeScript types
  - [ ] Improve error handling

## Migration Steps
### Phase 1: TypeScript Migration
- [ ] Convert Existing Files
  - [x] Convert `ChatInterface.jsx` to `.tsx`
  - [ ] Convert remaining `.jsx` to `.tsx`
  - [ ] Convert `.js` to `.ts`
  - [x] Add type definitions for chat interfaces
  - [x] Add type definitions for hooks
  - [x] Add type definitions for components

### Phase 2: UI Component Updates
- [ ] Implement New Styling
  - [x] Apply Tailwind classes to ChatInterface
  - [ ] Apply Tailwind classes to remaining components
  - [ ] Add Shadcn UI components
  - [ ] Ensure consistent theming

### Phase 3: Feature Parity
- [ ] Ensure all existing features work
  - [x] Chat functionality in ChatInterface
  - [x] Tool integration in ChatInterface
  - [x] File handling in ChatInterface
  - [x] Error handling in ChatInterface
  - [ ] Parameter dialog functionality
  - [ ] Remaining component features

### Phase 4: New Features
- [ ] Add new features from sample UI
  - [ ] Enhanced tool selection
  - [ ] Improved chat history
  - [ ] Better message rendering

## Testing
- [ ] Component Testing
  - [ ] Test existing components
  - [ ] Test new components
  - [ ] Test integrations

## Documentation
- [ ] Update Technical Documentation
  - [ ] Document new structure
  - [ ] Update setup instructions
  - [ ] Document new features

## Final Steps
- [ ] Quality Assurance
  - [ ] Performance testing
  - [ ] Cross-browser testing
  - [ ] Responsive design verification

- [ ] Deployment
  - [ ] Update build process
  - [ ] Test production build
  - [ ] Deploy updates 

### ChatInterface TypeScript Migration Plan
1. Type Definitions Needed:
   - [x] Message Interface
   - [x] Tool Interface
   - [x] Props Interfaces

2. Hook Type Updates:
   - [x] Add types for `useChatHistory`
   - [x] Add types for `useTools`

3. Component Conversion Steps:
   - [x] Replace styled-components with Tailwind classes
   - [x] Add type annotations to all state hooks
   - [x] Type event handlers and callbacks
   - [x] Add error type definitions
   - [x] Type window.electron interface

4. Styling Updates:
   - [x] Convert styled components to Tailwind classes:
     - ChatContainer -> grid grid-cols-[250px,1fr] h-screen bg-background
     - ChatArea -> flex flex-col h-full
     - RetryButton -> px-4 py-2 mt-2 bg-primary text-white rounded cursor-pointer hover:bg-primary-dark

5. Error Handling Improvements:
   - [x] Add custom error types
   - [x] Implement better error messages
   - [x] Add error boundaries with TypeScript

6. Testing Plan:
   - [ ] Add Jest/React Testing Library setup
   - [ ] Write tests for message handling
   - [ ] Test error scenarios
   - [ ] Test tool execution 

### ParameterDialog TypeScript Migration Plan
1. Component Structure Updates:
   - [x] Convert to functional component
   - [x] Split into smaller components
   - [x] Add proper prop types
   - [x] Implement React hooks

2. Type Definitions:
   - [x] Add ParameterDialogProps interface
   - [x] Add ParameterInputProps interface
   - [x] Type-safe state management
   - [x] Proper event typing

3. UI Modernization:
   - [x] Convert to Tailwind CSS
   - [x] Improve accessibility
   - [x] Add responsive design
   - [x] Implement modern dialog styling

4. Feature Improvements:
   - [x] Add click outside to close
   - [x] Better state management
   - [x] Proper cleanup
   - [x] Enhanced error handling

5. Remaining Tasks:
   - [ ] Update ElectronBridge type to include showOpenDialog
   - [ ] Add tests
   - [ ] Add loading states
   - [ ] Add validation 