# Feanor - AI Development Acceleration Platform

A powerful desktop tool that enables seamless interaction with local AI models through LM Studio integration. Feanor is designed to accelerate the development of AI tools and agents, providing a comprehensive environment for creating, testing, and deploying AI-powered solutions. Whether you're building custom tools or orchestrating AI agent swarms, Feanor provides the foundation for rapid AI development.

## Features

- **Modern Desktop Interface**: Built with PyQt6 and Electron for a responsive native experience
- **LM Studio Integration**: Direct connection to LM Studio for local AI model inference
- **Tool Integration System**: Extensible architecture supporting various tools:
  - File Analysis
  - PDF Reading
  - Web Scraping
  - Git Repository Analysis
  - Text Extraction
- **Real-time Chat**: Responsive chat interface with support for:
  - Drag and drop file attachments
  - Message history
  - Tool selection and execution
  - Markdown rendering
- **Proxy System**: FastAPI-based proxy server for handling LM Studio communication

### Upcoming Features Roadmap

- [ ] **Tool Generation**
  - Automated tool creation from natural language descriptions
  - Tool validation and testing framework
  - Tool marketplace for sharing and discovery

- [ ] **ComfyUI Integration**
  - Seamless integration with ComfyUI workflows
  - Custom node creation and management
  - Visual workflow builder for AI pipelines

- [ ] **Agent Creation**
  - Agent personality customization
  - Skill and capability definition
  - Training and fine-tuning interface
  - Agent testing and validation suite

- [ ] **Fellowships (AI Agent Swarms)**
  - Multi-agent orchestration
  - Inter-agent communication protocols
  - Task distribution and management
  - Swarm behavior monitoring

### Additional Features Under Consideration

- [ ] **Knowledge Base Integration**
  - Vector database support
  - Document ingestion pipeline
  - Automated knowledge extraction

- [ ] **Model Management**
  - Local model repository
  - Model performance metrics
  - A/B testing framework

- [ ] **Workflow Automation**
  - Visual pipeline builder
  - Task scheduling and automation
  - Event-driven triggers

- [ ] **Development Tools**
  - Integrated debugging tools
  - Performance profiling
  - Code generation assistance

- [ ] **Deployment Management**
  - Container orchestration
  - Environment management
  - Version control integration

## Technical Stack

- **Frontend**:
  - PyQt6 for native UI
  - Electron for cross-platform compatibility
  - TailwindCSS for styling
- **Backend**:
  - FastAPI for the proxy server
  - Python 3.x
  - TypeScript for Electron integration

## Project Structure

```
├── app/                  # Electron app components
├── components/           # UI components
├── hooks/               # Custom React hooks
├── lib/                 # Shared utilities
├── src/                 # Source code
├── UI/                  # UI assets and styles
├── tools/               # Tool implementations
├── chat_gui.py          # Main chat interface
├── lmstudio_proxy.py    # LM Studio proxy server
├── tools_config.json    # Tool configurations
└── various config files # (package.json, tsconfig.json, etc.)
```

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install        # For Electron/UI dependencies
   pip install -r requirements.txt  # For Python dependencies
   ```

2. Configure LM Studio:
   - Install LM Studio
   - Configure it to run on port 4891 (default)

3. Start the application:
   ```bash
   # Start the proxy server
   python lmstudio_proxy.py

   # Start the application
   npm start
   ```

## Development

- **Adding New Tools**:
  1. Define tool in `tools_config.json`
  2. Implement handler in `tools/` directory
  3. Register in `tool_handlers.py`

- **UI Modifications**:
  - Frontend components in `components/`
  - Styles in `UI/public/styles.css`
  - Main chat interface in `chat_gui.py`

## Architecture

### Component Overview

1. **Chat Interface** (`chat_gui.py`):
   - Handles user interactions
   - Manages chat history
   - Integrates tool execution

2. **Proxy Server** (`lmstudio_proxy.py`):
   - Manages communication with LM Studio
   - Handles tool execution requests
   - Provides health checking

3. **Tool System**:
   - Configurable via `tools_config.json`
   - Extensible architecture
   - Support for async operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

ISC License

## Requirements

- Python 3.x
- Node.js
- LM Studio
- Modern web browser
- Windows/macOS/Linux 