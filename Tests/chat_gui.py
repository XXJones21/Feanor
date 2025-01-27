from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QTextEdit, QPushButton, QListWidget, 
                           QLineEdit, QSplitter, QLabel, QComboBox, QDialog,
                           QFormLayout, QDialogButtonBox, QFileDialog)
from PyQt6.QtCore import Qt, pyqtSlot, QTimer, QThread, pyqtSignal, QSize, QMimeData
from PyQt6.QtGui import QMovie, QDragEnterEvent, QDropEvent
import sys
import json
import requests
import datetime
from typing import Optional

class ModelThread(QThread):
    response_ready = pyqtSignal(dict)
    error_occurred = pyqtSignal(str)
    
    def __init__(self, url, payload):
        super().__init__()
        self.url = url
        self.payload = payload
        
    def run(self):
        try:
            response = requests.post(self.url, json=self.payload)
            if response.status_code == 200:
                self.response_ready.emit(response.json())
            else:
                self.error_occurred.emit(f"Error: {response.status_code}")
        except Exception as e:
            self.error_occurred.emit(f"Error: {str(e)}")

class ToolDialog(QDialog):
    def __init__(self, tool_name, tool_params, parent=None):
        super().__init__(parent)
        self.setWindowTitle(f"Use {tool_name}")
        self.tool_name = tool_name
        self.tool_params = tool_params
        self.param_inputs = {}
        
        layout = QFormLayout(self)
        
        # Create input fields for each parameter
        for param_name, param_info in tool_params["properties"].items():
            param_desc = param_info.get("description", "").lower()
            
            # Check if parameter is for file/folder path
            if any(keyword in param_desc for keyword in ["path", "file", "folder", "directory"]):
                # Create a horizontal layout for path input
                path_layout = QHBoxLayout()
                
                # Create text input
                input_field = QLineEdit()
                input_field.setPlaceholderText(param_info.get("description", ""))
                self.param_inputs[param_name] = input_field
                path_layout.addWidget(input_field)
                
                # Create browse button
                browse_btn = QPushButton("Browse...")
                browse_btn.clicked.connect(lambda checked, field=input_field, desc=param_desc: 
                    self.browse_path(field, desc))
                path_layout.addWidget(browse_btn)
                
                layout.addRow(f"{param_name}:", path_layout)
            else:
                # Regular text input for non-path parameters
                input_field = QLineEdit()
                input_field.setPlaceholderText(param_info.get("description", ""))
                self.param_inputs[param_name] = input_field
                layout.addRow(f"{param_name}:", input_field)
        
        # Add OK and Cancel buttons
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)
    
    def browse_path(self, input_field, description):
        """Handle file/folder browsing"""
        if "directory" in description or "folder" in description:
            # Open folder browser
            path = QFileDialog.getExistingDirectory(
                self, 
                "Select Directory",
                "",
                QFileDialog.Option.ShowDirsOnly
            )
        else:
            # Open file browser
            path, _ = QFileDialog.getOpenFileName(
                self,
                "Select File",
                "",
                "All Files (*.*)"
            )
            
        if path:
            input_field.setText(path)
    
    def get_parameters(self):
        return {name: input.text() for name, input in self.param_inputs.items()}

class ChatWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("LM Studio Chat Interface")
        self.setGeometry(100, 100, 1200, 800)
        
        # Initialize FileReader
        from tools.file_reader import FileReader
        self.file_reader = FileReader()
        
        # Store chat history
        self.chats = {}
        self.current_chat_id = None
        
        # Initialize loading indicator
        self.loading_movie = QMovie("loading.gif")
        self.loading_movie.setScaledSize(QSize(50, 50))
        
        # Load tool configurations
        with open('tools_config.json', 'r') as f:
            self.tools_config = json.load(f)
        
        # Load available tools and their patterns
        self.tool_patterns = {
            'web_scraper': {
                'patterns': [
                    r'https?://[^\s<>"]+|www\.[^\s<>"]+',  # URL pattern
                    r'(?i)scrape|fetch|get content from|read from url'  # Intent patterns
                ],
                'tool_name': 'web_scraper'
            },
            'analyze_file': {
                'patterns': [
                    r'(?i)analyze file|read file|open file|show me file|what\'s in file',
                    r'(?i)\.(?:docx|pdf|txt|md|rtf|json|yaml|xml)$'  # File extensions
                ],
                'tool_name': 'analyze_file'
            },
            'read_file': {
                'patterns': [
                    r'(?i)read|show|display|content of file',
                    r'(?i)\.(?:docx|pdf|txt|md|rtf|json|yaml|xml)$'
                ],
                'tool_name': 'read_file'
            }
            # Add patterns for other tools...
        }
        
        # Track attached files for the current message
        self.current_attachment = None
        
        self.init_ui()
        self.create_new_chat()
        
    def init_ui(self):
        # Create main widget and layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QHBoxLayout(main_widget)
        
        # Create splitter for resizable panels
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Left panel for chat list
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        
        # New chat button
        new_chat_btn = QPushButton("New Chat")
        new_chat_btn.clicked.connect(self.create_new_chat)
        left_layout.addWidget(new_chat_btn)
        
        # Chat list
        self.chat_list = QListWidget()
        self.chat_list.itemClicked.connect(self.load_chat)
        left_layout.addWidget(self.chat_list)
        
        # Right panel for chat interface
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        
        # Add tool selector above chat display
        tool_layout = QHBoxLayout()
        
        # Tool dropdown
        self.tool_combo = QComboBox()
        self.tool_combo.addItem("Select a tool...")
        for tool in self.tools_config["tools"]:
            tool_name = tool["function"]["name"]
            tool_desc = tool["function"]["description"]
            self.tool_combo.addItem(f"{tool_name} - {tool_desc}", tool)
        
        # Use tool button
        use_tool_btn = QPushButton("Use Tool")
        use_tool_btn.clicked.connect(self.use_tool)
        
        tool_layout.addWidget(self.tool_combo)
        tool_layout.addWidget(use_tool_btn)
        
        right_layout.insertLayout(0, tool_layout)  # Add at top of right panel
        
        # Chat display area
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        right_layout.addWidget(self.chat_display)
        
        # Loading indicator
        self.loading_label = QLabel()
        self.loading_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.loading_label.setMovie(self.loading_movie)
        self.loading_label.hide()
        right_layout.addWidget(self.loading_label)
        
        # Input area
        input_layout = QHBoxLayout()
        self.attachment_label = QLabel()
        self.attachment_label.setStyleSheet("color: #666; font-style: italic;")
        self.attachment_label.hide()
        input_layout.addWidget(self.attachment_label)
        self.message_input = QLineEdit()
        self.message_input.returnPressed.connect(self.send_message)
        self.send_button = QPushButton("Send")
        self.send_button.clicked.connect(self.send_message)
        
        # Enable drag and drop for message input
        self.message_input.setAcceptDrops(True)
        self.message_input.dragEnterEvent = self.input_drag_enter
        self.message_input.dropEvent = self.input_drop
        
        input_layout.addWidget(self.message_input)
        input_layout.addWidget(self.send_button)
        
        # Add clear attachment button
        self.clear_attachment_btn = QPushButton("×")
        self.clear_attachment_btn.setFixedSize(20, 20)
        self.clear_attachment_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff6b6b;
                color: white;
                border-radius: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #ff5252;
            }
        """)
        self.clear_attachment_btn.clicked.connect(self.clear_attachment)
        self.clear_attachment_btn.hide()
        input_layout.addWidget(self.clear_attachment_btn)
        
        right_layout.addLayout(input_layout)
        
        # Add panels to splitter
        splitter.addWidget(left_panel)
        splitter.addWidget(right_panel)
        
        # Set initial sizes
        splitter.setSizes([300, 900])
        
        # Add splitter to main layout
        layout.addWidget(splitter)
        
    def create_new_chat(self):
        # Generate new chat ID using timestamp
        chat_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.chats[chat_id] = []
        
        # Add to list widget
        self.chat_list.addItem(f"Chat {chat_id}")
        
        # Set as current chat
        self.current_chat_id = chat_id
        self.chat_display.clear()
        self.message_input.clear()
        
    def load_chat(self, item):
        chat_id = item.text().split(" ")[1]
        self.current_chat_id = chat_id
        
        # Clear and reload chat display
        self.chat_display.clear()
        for message in self.chats[chat_id]:
            self.display_message(message["role"], message["content"])
    
    def show_loading(self):
        self.loading_label.show()
        self.loading_movie.start()
        self.message_input.setEnabled(False)
        self.send_button.setEnabled(False)
        
    def hide_loading(self):
        self.loading_movie.stop()
        self.loading_label.hide()
        self.message_input.setEnabled(True)
        self.send_button.setEnabled(True)
        
    def input_drag_enter(self, event: QDragEnterEvent):
        """Handle drag enter events for the input field"""
        mime_data = event.mimeData()
        if mime_data.hasUrls() and len(mime_data.urls()) == 1:
            file_path = mime_data.urls()[0].toLocalFile()
            extension = file_path.lower().split('.')[-1]
            
            # Check if file type is supported
            supported_extensions = {
                'txt', 'md', 'markdown', 'py', 'js', 'html', 'css', 'json',
                'xml', 'yaml', 'yml', 'ini', 'cfg', 'conf', 'log', 'csv',
                'rtf', 'tex', 'sh', 'bat', 'ps1', 'r', 'sql', 'docx', 'pdf'
            }
            
            if extension in supported_extensions:
                event.acceptProposedAction()

    def input_drop(self, event: QDropEvent):
        """Handle drop events for the input field"""
        mime_data = event.mimeData()
        if mime_data.hasUrls():
            file_path = mime_data.urls()[0].toLocalFile()
            self.set_attachment(file_path)
            event.acceptProposedAction()

    def set_attachment(self, file_path: str):
        """Set the current file attachment"""
        self.current_attachment = file_path
        file_name = file_path.split('/')[-1]
        self.attachment_label.setText(f"📎 {file_name}")
        self.attachment_label.show()
        self.clear_attachment_btn.show()

    def clear_attachment(self):
        """Clear the current file attachment"""
        self.current_attachment = None
        self.attachment_label.hide()
        self.clear_attachment_btn.hide()

    def send_message(self):
        if not self.current_chat_id:
            return
            
        message = self.message_input.text().strip()
        if not message and not self.current_attachment:
            return
            
        # Handle message with attachment
        if self.current_attachment:
            # First analyze the file
            tool_result = self.execute_tool('analyze_file', {'file_path': self.current_attachment})
            
            # Display user message with attachment indicator
            file_name = self.current_attachment.split('/')[-1]
            display_message = f"{message} [Attached: {file_name}]"
            self.display_message("user", display_message)
            
            # Add to chat history
            self.chats[self.current_chat_id].append({
                "role": "user",
                "content": display_message
            })
            
            # Add tool result to chat history
            if tool_result:
                self.chats[self.current_chat_id].append({
                    "role": "system",
                    "content": f"File analysis result:\n{tool_result}"
                })
            
            # Clear attachment
            self.clear_attachment()
        else:
            # Normal message handling
            self.display_message("user", message)
            self.chats[self.current_chat_id].append({
                "role": "user",
                "content": message
            })
        
        # Clear input
        self.message_input.clear()
        
        # Show loading indicator and disable input
        self.show_loading()
        
        # Send to LM Studio server with enhanced context
        self.model_thread = ModelThread(
            "http://localhost:4892/v1/chat/completions",
            {
                "model": "local-model",
                "messages": self.chats[self.current_chat_id],
                "temperature": 0.7,
                "stream": False,
                "functions": self.tools_config["tools"],
                "function_call": "auto"
            }
        )
        self.model_thread.response_ready.connect(self.handle_response)
        self.model_thread.error_occurred.connect(self.handle_error)
        self.model_thread.finished.connect(self.hide_loading)
        self.model_thread.start()
    
    def handle_response(self, response_data):
        assistant_message = response_data["choices"][0]["message"]["content"]
        
        # Filter out the thinking process
        if "<think>" in assistant_message and "</think>" in assistant_message:
            # Extract only the actual response after </think>
            actual_response = assistant_message.split("</think>")[-1].strip()
        else:
            actual_response = assistant_message
        
        # Display assistant message
        self.display_message("assistant", actual_response)
        
        # Add to chat history
        self.chats[self.current_chat_id].append({
            "role": "assistant",
            "content": actual_response  # Store only the actual response
        })
    
    def handle_error(self, error_message):
        self.display_message("system", error_message)
    
    def display_message(self, role, content):
        """
        Display a message in the chat with modern formatting.
        """
        # Define message styles based on role
        styles = {
            "user": {
                "container": """
                    margin: 10px 0;
                    padding: 15px;
                    border-radius: 15px;
                    background-color: #E3F2FD;
                    max-width: 80%;
                    margin-left: auto;
                    margin-right: 10px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                """,
                "name_color": "#1976D2",
                "align": "right"
            },
            "assistant": {
                "container": """
                    margin: 10px 0;
                    padding: 15px;
                    border-radius: 15px;
                    background-color: #F5F5F5;
                    max-width: 80%;
                    margin-right: auto;
                    margin-left: 10px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                """,
                "name_color": "#2E7D32",
                "align": "left"
            },
            "system": {
                "container": """
                    margin: 10px auto;
                    padding: 10px 15px;
                    border-radius: 8px;
                    background-color: #FFF3E0;
                    max-width: 90%;
                    text-align: center;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                """,
                "name_color": "#E65100",
                "align": "center"
            }
        }
        
        style = styles[role]
        
        # Start message container
        message_html = f"""
            <div style='text-align: {style["align"]}'>
                <div style='{style["container"]}'>
        """
        
        # Format the content
        formatted_content = self.format_regular_text(content)
        message_html += formatted_content
        
        # Close message container
        message_html += "</div></div>"
        
        # Append the formatted message
        self.chat_display.append(message_html)
        
        # Scroll to bottom
        self.chat_display.verticalScrollBar().setValue(
            self.chat_display.verticalScrollBar().maximum()
        )

    def format_regular_text(self, text: str) -> str:
        """
        Format text with enhanced styling.
        """
        import re
        
        # Define styles
        styles = {
            "paragraph": "margin: 8px 0; line-height: 1.5;",
            "bold": "font-weight: 600; color: #1A237E;",
            "italic": "font-style: italic; color: #455A64;",
            "link": "color: #1976D2; text-decoration: none; border-bottom: 1px solid #1976D2;",
            "list": """
                margin: 10px 0;
                padding-left: 25px;
                list-style-type: none;
            """,
            "list_item": """
                margin: 8px 0;
                position: relative;
                line-height: 1.5;
            """,
            "bullet": """
                content: '•';
                color: #1976D2;
                position: absolute;
                left: -20px;
            """,
            "code_block": """
                background-color: #263238;
                color: #ECEFF1;
                padding: 12px;
                border-radius: 8px;
                font-family: 'Consolas', monospace;
                margin: 10px 0;
                white-space: pre-wrap;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            """,
            "header": {
                1: "font-size: 1.5em; color: #1A237E; margin: 15px 0 10px 0; font-weight: 600;",
                2: "font-size: 1.3em; color: #283593; margin: 12px 0 8px 0; font-weight: 600;",
                3: "font-size: 1.1em; color: #303F9F; margin: 10px 0 6px 0; font-weight: 600;"
            }
        }
        
        # Split into lines and process
        lines = text.split('\n')
        formatted_lines = []
        in_list = False
        
        for line in lines:
            # Handle headers
            header_match = re.match(r'^(#{1,3})\s+(.+)$', line)
            if header_match:
                level = len(header_match.group(1))
                text = header_match.group(2)
                formatted_lines.append(
                    f"<div style='{styles['header'][level]}'>{text}</div>"
                )
                continue
            
            # Handle lists
            list_match = re.match(r'^[\-\*]\s+(.+)$', line)
            if list_match:
                if not in_list:
                    formatted_lines.append(f"<ul style='{styles['list']}'>")
                    in_list = True
                item_content = list_match.group(1)
                formatted_lines.append(
                    f"""<li style='{styles['list_item']}'>
                        <span style='{styles['bullet']}'>•</span>
                        {item_content}
                    </li>"""
                )
                continue
            
            # Close list if needed
            if in_list and not list_match:
                formatted_lines.append("</ul>")
                in_list = False
            
            # Handle emphasis
            line = re.sub(
                r'\*\*(.*?)\*\*',
                lambda m: f"<span style='{styles['bold']}'>{m.group(1)}</span>",
                line
            )
            line = re.sub(
                r'\*(.*?)\*',
                lambda m: f"<span style='{styles['italic']}'>{m.group(1)}</span>",
                line
            )
            
            # Handle links
            line = re.sub(
                r'\[(.*?)\]\((.*?)\)',
                lambda m: f"<a href='{m.group(2)}' style='{styles['link']}'>{m.group(1)}</a>",
                line
            )
            
            # Add paragraph if not empty
            if line.strip():
                formatted_lines.append(f"<div style='{styles['paragraph']}'>{line}</div>")
        
        # Close any open list
        if in_list:
            formatted_lines.append("</ul>")
        
        return '\n'.join(formatted_lines)

    def use_tool(self):
        if self.tool_combo.currentIndex() == 0:  # "Select a tool..." option
            return
            
        selected_tool = self.tool_combo.currentData()
        tool_name = selected_tool["function"]["name"]
        tool_params = selected_tool["function"]["parameters"]
        
        # Show parameter input dialog
        dialog = ToolDialog(tool_name, tool_params, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            params = dialog.get_parameters()
            
            # Format tool usage as a message
            tool_message = f"Using tool '{tool_name}'"
            self.display_message("user", tool_message)
            
            # Show loading indicator
            self.show_loading()
            
            # Execute tool directly through proxy
            try:
                response = requests.post(
                    f"http://localhost:4892/v1/functions/{tool_name}",
                    json=params
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Display the tool's result
                    self.display_message("assistant", json.dumps(result, indent=2))
                else:
                    self.display_message("system", f"Error executing tool: {response.text}")
                    
            except Exception as e:
                self.display_message("system", f"Error: {str(e)}")
                
            finally:
                self.hide_loading()

    def detect_and_execute_tools(self, user_message: str) -> Optional[str]:
        """
        Detect if the user message implies tool usage and execute the appropriate tool.
        """
        import re
        
        for tool_info in self.tool_patterns.values():
            for pattern in tool_info['patterns']:
                matches = re.findall(pattern, user_message)
                if matches:
                    tool_name = tool_info['tool_name']
                    
                    # Extract relevant parameters based on tool
                    if tool_name == 'web_scraper':
                        urls = [url for url in matches if url.startswith(('http', 'www'))]
                        if urls:
                            return self.execute_tool(tool_name, {'url': urls[0]})
                            
                    elif tool_name in ['analyze_file', 'read_file']:
                        # Look for file paths in the message
                        file_paths = re.findall(r'(?:\"|\')(.+?)(?:\"|\')', user_message)
                        if file_paths:
                            return self.execute_tool(tool_name, {'file_path': file_paths[0]})
                            
        return None

    def execute_tool(self, tool_name: str, params: dict) -> str:
        """
        Execute the specified tool with given parameters.
        """
        try:
            if tool_name == 'web_scraper':
                result = self.web_scraper.scrape(params['url'])
                return f"Content from {params['url']}:\n{result}"
                
            elif tool_name == 'analyze_file':
                result = self.file_reader.analyze_file(params['file_path'])
                return result['formatted_output']
                
            elif tool_name == 'read_file':
                content = self.file_reader.read_file(params['file_path'])
                return f"File contents:\n{content}"
                
        except Exception as e:
            return f"Error executing {tool_name}: {str(e)}"

    def handle_user_message(self, message: str):
        """
        Handle incoming user messages and detect tool usage.
        """
        # First try to detect and execute tools
        tool_result = self.detect_and_execute_tools(message)
        
        if tool_result:
            # Tool was executed, append result to chat
            self.append_message("assistant", tool_result)
            
            # Now let the AI process the tool result and respond
            ai_response = self.get_ai_response(message, tool_result)
            self.append_message("assistant", ai_response)
        else:
            # No tool needed, proceed with normal AI response
            ai_response = self.get_ai_response(message)
            self.append_message("assistant", ai_response)

    def get_ai_response(self, user_message: str, tool_result: Optional[str] = None) -> str:
        """
        Get AI response, incorporating tool results if available.
        """
        messages = [
            {"role": "system", "content": "You are a helpful assistant with access to various tools..."},
            {"role": "user", "content": user_message}
        ]
        
        if tool_result:
            messages.append({
                "role": "system", 
                "content": f"Tool execution result:\n{tool_result}"
            })
            
        # Call your AI model here with the messages
        response = self.call_ai_model(messages)
        return response

def main():
    app = QApplication(sys.argv)
    
    # Set style
    app.setStyle("Fusion")
    
    window = ChatWindow()
    window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 