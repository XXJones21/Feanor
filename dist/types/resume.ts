export interface ResumeAnalysisProps {
  onAnalyze: (jobPosting: string, resumeFile: File) => Promise<void>;
  isLoading: boolean;
}

export interface ResumeAnalysisResult {
  jobSummary: {
    title: string;
    keyRequirements: string[];
    desiredSkills: string[];
  };
  resumeAnalysis: {
    matchingSkills: string[];
    missingSkills: string[];
    suggestedImprovements: string[];
  };
  recommendedFormat: {
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
}

export interface ResumeState {
  jobPosting: string | null;
  resumeFile: File | null;
  analysis: ResumeAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
} 