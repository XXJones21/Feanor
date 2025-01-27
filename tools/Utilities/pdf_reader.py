from typing import Optional
import PyPDF2

class PDFReader:
    def read_pdf(self, pdf_path: str) -> Optional[str]:
        """
        Extracts text content from a PDF file
        
        Args:
            pdf_path (str): Path to PDF file
            
        Returns:
            Optional[str]: Extracted text content
        """
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
                
        except Exception as e:
            return f"Error reading PDF: {str(e)}" 