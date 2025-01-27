import json
from tool_handlers import TOOL_HANDLERS

def setup_lmstudio_tools():
    # Load tool configurations
    with open('tools_config.json', 'r') as f:
        tools_config = json.load(f)
    
    # Register tools with LM Studio
    for tool in tools_config["tools"]:
        tool_name = tool["name"]
        if tool_name in TOOL_HANDLERS:
            # Register the tool with LM Studio's tool system
            # The exact registration method will depend on LM Studio's API
            register_tool(
                name=tool_name,
                handler=TOOL_HANDLERS[tool_name],
                description=tool["description"],
                parameters=tool["parameters"]
            )

if __name__ == "__main__":
    setup_lmstudio_tools() 