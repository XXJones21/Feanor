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
    - [x] Review and update `ParameterDialog.js` to TypeScript
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
- [x] Core Dependencies
  - [x] `@radix-ui/react-select`
  - [x] `@radix-ui/react-scroll-area`
  - [x] `@radix-ui/react-separator`
  - [x] `lucide-react`
  - [x] `class-variance-authority`
  - [x] `clsx`
  - [x] `tailwind-merge`

## Component Migration
- [x] Update Existing Components
  - [x] `ChatInterface.tsx`
    - [x] Convert to TypeScript
    - [x] Implement new styling
    - [x] Integrate with new hooks
  - [x] `ParameterDialog.tsx`
    - [x] Convert to TypeScript
    - [x] Update to use Shadcn UI components
    - [x] Add proper type definitions
    - [x] Implement modern React patterns
    - [x] Add proper error handling
    - [x] Add click outside to close
    - [x] Add proper cleanup

- [x] Chat Components (`/UI/components/Chat/`)
  - [x] Setup Types
    - [x] Create `UI/types/chat.ts`
    - [x] Define message interfaces
    - [x] Define status types
    - [x] Define event types

  - [x] LoadingIndicator Component
    - [x] Convert to TypeScript
    - [x] Add LoadingIndicatorProps interface
    - [x] Add size and message type definitions
    - [x] Convert to Tailwind CSS
    - [x] Add animation utilities
    - [x] Add tests

  - [x] Message Component
    - [x] Convert to TypeScript
    - [x] Add MessageProps interface
    - [x] Add role and status types
    - [x] Type markdown components
    - [x] Replace styled-components with Tailwind
    - [x] Add proper error handling for markdown
    - [x] Add tests
    - [x] Add documentation

  - [x] MessageList Component
    - [x] Convert to TypeScript
    - [x] Add MessageListProps interface
    - [x] Add message array types
    - [x] Implement virtual scrolling
    - [x] Add scroll management
    - [x] Convert to Tailwind CSS
    - [x] Add tests
    - [x] Add documentation

  - [x] InputArea Component
    - [x] Convert to TypeScript
    - [x] Add InputAreaProps interface
    - [x] Add event handler types
    - [x] Add file handling types
    - [x] Implement error handling
    - [x] Convert to Tailwind CSS
    - [x] Add tests
    - [x] Add documentation
    - [x] Add auto-resize functionality
    - [x] Add character limit support
    - [x] Improve accessibility
    - [x] Add proper cleanup

  - [x] Shared Utilities
    - [x] Create markdown processing utility
    - [x] Create message formatting utility
    - [x] Create scroll management utility
    - [x] Add tests
    - [x] Integrate with components

  - [ ] Testing
    - [ ] Unit Tests
      - [ ] Message rendering
      - [ ] Markdown processing
      - [ ] Input handling
      - [ ] Loading states
    - [ ] Integration Tests
      - [ ] Message list scrolling
      - [ ] File attachments
      - [ ] Streaming messages
      - [ ] Error handling

  - [ ] Documentation
    - [ ] Component Documentation
      - [ ] Props documentation
      - [ ] Usage examples
      - [ ] Styling guide
    - [ ] Type Documentation
      - [ ] Interface descriptions
      - [ ] Type usage examples
      - [ ] Common patterns

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

- [x] Implement New Hooks
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
   - [x] Fix timestamp handling
   - [x] Add proper type assertions
   - [x] Implement proper error types

2. Remaining Hook Tasks:
   - [ ] Convert useTools to TypeScript
   - [x] Add loading states
   - [x] Add error boundaries
   - [x] Add proper cleanup

## Testing Environment
### Test Environment Setup
- [x] Configure Vitest for Electron
  - [x] Update vitest.config.ts with proper settings
  - [x] Configure path aliases
  - [x] Set up coverage reporting
  - [x] Configure dependency handling
- [x] Set up test utilities
  - [x] Create IPC test helpers
  - [x] Add mock response generators
  - [x] Add stream processing utilities
  - [x] Add chat message generators
- [x] Create mock IPC handlers
  - [x] Mock window.electron
  - [x] Mock IPC success responses
  - [x] Mock IPC error responses
  - [x] Mock streaming responses
- [ ] Set up CI/CD integration

### Testing Plan
#### IPC Communication Testing
1. Basic Message Flow
   - [x] Send user message to server
   - [x] Receive assistant response
   - [x] Handle streaming responses
   - [x] Error handling and recovery

2. Chat Management
   - [x] Save chat history
   - [x] Load chat history
   - [x] Delete chat history
   - [x] Handle chat errors

3. Model Management
   - [x] Get available models
   - [x] Get active model
   - [x] Handle model switching
   - [x] Handle connection errors

4. Tool Integration
   - [x] Execute tools
   - [x] Handle tool responses
   - [x] Error handling for tools
   - [x] Tool parameter validation

5. Stream Handling
   - [x] Test stream creation
   - [x] Test stream cancellation
   - [x] Test stream errors
   - [x] Test stream cleanup

6. Error Scenarios
   - [x] Network errors
   - [x] Invalid responses
   - [x] Timeout handling
   - [x] Retry mechanisms

#### Test Implementation Priority
1. Basic Message Flow (Critical Path)
   - Implement first to enable core functionality
   - Required for any further testing

2. Stream Handling
   - Essential for real-time responses
   - Builds on basic message flow

3. Error Handling
   - Critical for reliability
   - Covers various failure scenarios

4. Chat Management
   - Important for persistence
   - Can be implemented after core functionality

5. Model & Tool Integration
   - Enhanced functionality
   - Can be implemented incrementally

## JavaScript Deprecation Plan
### Files to Convert

#### Main Process Files
- [x] `src/main.js` → `UI/main.ts`
  - [x] Basic TypeScript conversion
  - [x] Add type definitions
  - [x] Add error handling
  - [x] Test all functionality
  - [x] Remove old file

- [x] `src/preload.js` → `UI/preload.ts`
  - [x] Convert to TypeScript
  - [x] Add type definitions for IPC bridge
  - [x] Add proper error handling
  - [x] Test functionality
  - [x] Remove old file

- [x] `src/renderer.js` → `UI/renderer.ts`
  - [x] Convert to TypeScript
  - [x] Add type definitions
  - [x] Add error handling
  - [x] Test functionality
  - [x] Remove old file

#### React Component Files
- [x] `UI/components/Chat/Message.jsx` → `UI/components/Chat/Message.tsx`
- [x] `UI/components/Chat/InputArea.jsx` → `UI/components/Chat/InputArea.tsx`
- [x] `UI/components/Chat/MessageList.jsx` → `UI/components/Chat/MessageList.tsx`
- [x] `UI/components/Chat/LoadingIndicator.jsx` → `UI/components/Chat/LoadingIndicator.tsx`
- [ ] `UI/components/Sidebar/ChatList.jsx` → `UI/components/Sidebar/ChatList.tsx`
- [ ] `UI/components/Sidebar/ToolsList.jsx` → `UI/components/Sidebar/ToolsList.tsx`
- [ ] `UI/components/Common/ErrorBoundary.jsx` → `UI/components/Common/ErrorBoundary.tsx`
- [ ] `UI/components/Sidebar/NewChatButton.jsx` → `UI/components/Sidebar/NewChatButton.tsx`

#### Utility Files
- [x] `src/styles/theme.js` → `UI/styles/theme.ts`
  - [x] Convert to TypeScript
  - [x] Add proper type definitions for theme
  - [x] Add CSS variable types
  - [x] Test theme functionality

### Migration Steps
1. For each component:
   - [x] Create new TypeScript file
   - [x] Add proper type definitions
   - [x] Convert component code
   - [x] Add tests
   - [x] Test functionality
   - [x] Remove old JavaScript file

2. For each process file:
   - [x] Create new TypeScript file
   - [x] Add type definitions
   - [x] Convert functionality
   - [x] Add error handling
   - [x] Test thoroughly
   - [x] Remove old JavaScript file

### Dependencies to Update
- [x] Remove JavaScript-specific ESLint rules
- [x] Update TypeScript configuration
- [x] Update Jest/Testing configuration
- [x] Update build scripts in package.json

### Verification Steps
1. [x] All TypeScript files compile without errors
2. [ ] All tests pass
3. [x] Application runs without errors
4. [x] No JavaScript files remain in use
5. [x] All functionality works as expected
6. [x] Build process completes successfully

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

## Module Bundling with Webpack

### Overview
Implementation of a robust webpack configuration to properly handle the Electron application's main process, preload scripts, and renderer process across all platforms (Windows, macOS, Linux) while optimizing for local LLM integration.

### Phase 1: Project Structure & Dependencies

#### 1. Install Required Dependencies
```bash
npm install --save-dev electron-webpack webpack webpack-cli typescript ts-loader
npm install --save-dev @types/electron html-webpack-plugin copy-webpack-plugin
npm install --save-dev css-loader style-loader file-loader
```

#### 2. Restructure Project Files
```
project/
├── src/
│   ├── main/             # Main process code
│   │   ├── index.ts      # Entry point for main process
│   │   └── ...
│   ├── renderer/         # Renderer process code
│   │   ├── index.ts      # Entry point for renderer
│   │   ├── index.html    # HTML template
│   │   └── ...
│   ├── preload/          # Preload scripts
│   │   └── index.ts      # Entry point for preload
│   └── common/           # Shared code (constants, interfaces)
│       └── ipc-channels.ts # Shared IPC channel definitions
├── webpack/              # Webpack configurations
│   ├── main.config.js
│   ├── preload.config.js
│   └── renderer.config.js
└── package.json
```

### Phase 2: Webpack Configuration

#### 1. Base Webpack Configuration (webpack/base.config.js)
```javascript
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@common': path.resolve(__dirname, '../src/common')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

#### 2. Main Process Config (webpack/main.config.js)
```javascript
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');

module.exports = merge(baseConfig, {
  target: 'electron-main',
  entry: {
    main: path.resolve(__dirname, '../src/main/index.ts')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false
  }
});
```

#### 3. Preload Config (webpack/preload.config.js)
```javascript
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./base.config');

module.exports = merge(baseConfig, {
  target: 'electron-preload',
  entry: {
    preload: path.resolve(__dirname, '../src/preload/index.ts')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  }
});
```

#### 4. Renderer Config (webpack/renderer.config.js)
```javascript
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./base.config');

module.exports = merge(baseConfig, {
  target: 'web',
  entry: {
    renderer: path.resolve(__dirname, '../src/renderer/index.ts')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/renderer/index.html')
    })
  ]
});
```

### Phase 3: Shared Types and IPC

#### 1. Create Common IPC Channel Definition (src/common/ipc-channels.ts)
```typescript
export enum IpcChannels {
  CHAT_COMPLETION = 'chat-completion',
  EXECUTE_TOOL = 'execute-tool',
  GET_TOOLS = 'get-tools-config',
  GET_CHAT_HISTORY = 'get-chat-history',
  LOAD_CHAT = 'load-chat',
  SAVE_CHAT = 'save-chat',
  DELETE_CHAT = 'delete-chat',
  SHOW_CONFIRM_DIALOG = 'show-confirm-dialog',
  WINDOW_MINIMIZE = 'window-minimize',
  WINDOW_MAXIMIZE = 'window-maximize',
  WINDOW_CLOSE = 'window-close',
  GET_MODELS = 'get-models',
  GET_ACTIVE_MODEL = 'get-active-model'
}

// Common interfaces that need to be shared
export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  timestamp?: number;
}

export interface Tool {
  name: string;
  description: string;
  parameters: any;
}

export interface ToolsConfig {
  tools: Tool[];
}
```

### Phase 4: Update Package Scripts (package.json)
```json
{
  "scripts": {
    "build": "webpack --config webpack/main.config.js && webpack --config webpack/preload.config.js && webpack --config webpack/renderer.config.js",
    "start": "electron ./dist/main.js",
    "dev": "npm run build && npm run start",
    "build:main": "webpack --config webpack/main.config.js",
    "build:preload": "webpack --config webpack/preload.config.js",
    "build:renderer": "webpack --config webpack/renderer.config.js"
  }
}
```

### Phase 5: Updating Existing Files

#### 1. Update Preload Script (src/preload/index.ts)
```typescript
import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from '@common/ipc-channels';

// Add logging for debugging
console.log('Preload script starting...');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, data?: any) => {
    console.log(`IPC invoke: ${channel}`, data);
    if (Object.values(IpcChannels).includes(channel as IpcChannels)) {
      return ipcRenderer.invoke(channel, data);
    }
    console.error(`Invalid channel: ${channel}`);
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  
  on: (channel: string, callback: (...args: any[]) => void) => {
    console.log('IPC Bridge on:', channel);
    if (Object.values(IpcChannels).includes(channel as IpcChannels)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },

  removeAllListeners: (channel: string) => {
    console.log('IPC Bridge removeAllListeners:', channel);
    if (Object.values(IpcChannels).includes(channel as IpcChannels)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

console.log('Preload script completed successfully');
```

#### 2. Update Renderer Entry (src/renderer/index.ts)
```typescript
import * as marked from 'marked';
import * as hljs from 'highlight.js';
import { IpcChannels, ChatMessage, Tool, ToolsConfig } from '@common/ipc-channels';
import './styles.css';

// The rest of your renderer code, but using imported types
// and using the IpcChannels enum for channel names

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  initialize();
});

async function initialize() {
  // Your initialization code here
}
```

#### 3. Update Main Process (src/main/index.ts)
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { IpcChannels } from '@common/ipc-channels';

// Your existing main process code, updated to use the IpcChannels enum

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
});

// IPC handlers
ipcMain.handle(IpcChannels.CHAT_COMPLETION, async (event, data) => {
  // Handle chat completion
});

// Other IPC handlers...
```

### Phase 6: Implementation Plan

#### Stage 1: Project Setup (Est. 1 day)
- [ ] Backup current codebase
- [ ] Create new folder structure
- [ ] Install required dependencies
- [ ] Create initial webpack configuration files

#### Stage 2: Shared Types (Est. 1 day)
- [ ] Create common IPC channel definitions
- [ ] Define shared interfaces
- [ ] Set up proper type exports

#### Stage 3: Renderer Process (Est. 2 days)
- [ ] Configure webpack for renderer
- [ ] Update HTML template for webpack
- [ ] Migrate CSS handling to webpack
- [ ] Test renderer build in isolation

#### Stage 4: Preload Script (Est. 1 day)
- [ ] Configure webpack for preload
- [ ] Update preload script to use shared types
- [ ] Test preload script in isolation

#### Stage 5: Main Process (Est. 2 days)
- [ ] Configure webpack for main process
- [ ] Update main process to use shared types
- [ ] Test main process in isolation

#### Stage 6: Integration (Est. 2 days)
- [ ] Integrate all processes
- [ ] Test IPC communication
- [ ] Fix any cross-process issues
- [ ] Ensure proper type safety

#### Stage 7: Cross-Platform Testing (Est. 2 days)
- [ ] Test on Windows
- [ ] Test on macOS
- [ ] Test on Linux
- [ ] Address platform-specific issues

#### Stage 8: Performance Optimization (Est. 1 day)
- [ ] Optimize bundle sizes
- [ ] Implement code splitting where needed
- [ ] Address any performance bottlenecks

### Key Benefits
1. **Cross-Platform Consistency**: Path handling and module resolution work reliably across Windows, macOS, and Linux
2. **Type Safety**: Shared interfaces ensure type consistency between processes
3. **Build Optimization**: Webpack optimizes bundle sizes for better performance with local LLMs
4. **Maintainability**: Cleaner project structure with clear separation of concerns
5. **Development Experience**: Better tooling support and debugging capabilities

### Migration Considerations
1. **Backward Compatibility**:
   - Ensure existing functionality works during migration
   - Consider creating a compatibility layer during transition

2. **Testing Strategy**:
   - Create tests for each component before migration
   - Compare behavior before and after migration

3. **Error Handling**:
   - Improve error reporting across processes
   - Add better logging for cross-process communication

4. **Progressive Implementation**:
   - Start with renderer process (user-facing)
   - Then integrate preload script
   - Finally update main process
   - This allows for incremental testing and validation