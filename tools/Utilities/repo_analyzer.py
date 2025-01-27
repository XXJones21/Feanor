import os
from typing import Dict, List
from git import Repo

class RepoAnalyzer:
    def analyze_repo(self, repo_path: str) -> Dict:
        """
        Analyzes a local git repository
        
        Args:
            repo_path (str): Path to local git repo
            
        Returns:
            Dict containing:
                - files: List of files and their contents
                - commits: Recent commit history
                - branches: List of branches
                - contributors: List of contributors
        """
        try:
            repo = Repo(repo_path)
            
            # Get list of files
            files = []
            for root, _, filenames in os.walk(repo_path):
                for filename in filenames:
                    if not filename.startswith('.'):
                        file_path = os.path.join(root, filename)
                        files.append({
                            "path": file_path,
                            "content": FileReader().read_file(file_path)
                        })
            
            # Get commit history
            commits = [{
                "author": c.author.name,
                "message": c.message,
                "date": c.committed_datetime
            } for c in repo.iter_commits(max_count=10)]
            
            return {
                "files": files,
                "commits": commits,
                "branches": [b.name for b in repo.branches],
                "contributors": list(set(c.author.name for c in repo.iter_commits()))
            }
            
        except Exception as e:
            return {"error": f"Failed to analyze repo: {str(e)}"} 