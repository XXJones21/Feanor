from .Utilities.file_reader import FileReader
from .Utilities.pdf_reader import PDFReader
from .Utilities.repo_analyzer import RepoAnalyzer
from .Utilities.web_scraper import WebScraper
from .Utilities.resume_analyzer import ResumeAnalyzer

file_reader = FileReader()
pdf_reader = PDFReader()
repo_analyzer = RepoAnalyzer()
web_scraper = WebScraper()
resume_analyzer = ResumeAnalyzer()

def handle_read_file(params):
    return file_reader.read_file(params["file_path"])

def handle_analyze_file(params):
    return file_reader.analyze_file(params["file_path"])

def handle_read_pdf(params):
    return pdf_reader.read_pdf(params["pdf_path"])

def handle_analyze_repo(params):
    return repo_analyzer.analyze_repo(params["repo_path"])

def handle_scrape_webpage(params):
    url = params.get("url")
    selector = params.get("selector")
    return web_scraper.scrape_webpage(url, selector)

def handle_extract_text(params):
    url = params.get("url")
    return web_scraper.extract_text(url)

def handle_analyze_resume(params):
    resume_text = params.get("resume_text")
    job_posting = params.get("job_posting")
    return resume_analyzer.analyze_resume(resume_text, job_posting)

# Map tool names to handler functions
TOOL_HANDLERS = {
    "read_file": handle_read_file,
    "analyze_file": handle_analyze_file,
    "read_pdf": handle_read_pdf,
    "analyze_repo": handle_analyze_repo,
    "scrape_webpage": handle_scrape_webpage,
    "extract_text": handle_extract_text,
    "analyze_resume": handle_analyze_resume
} 