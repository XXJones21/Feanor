from tools.register_tools import register_file_tools

def setup_agent():
    # Initialize your LM Studio agent
    agent = LMStudioAgent()  # Replace with actual agent initialization
    
    # Register file analysis tools
    register_file_tools(agent)
    
    return agent 