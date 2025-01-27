from .file_reader import FileReader

def register_file_tools(agent):
    """
    Registers file reading tools with the agent
    """
    reader = FileReader()
    
    agent.register_tool(
        "read_file",
        reader.read_file,
        "Reads the contents of a file at the given path"
    )
    
    agent.register_tool(
        "analyze_file", 
        reader.analyze_file,
        "Analyzes a file and returns key information about it"
    ) 