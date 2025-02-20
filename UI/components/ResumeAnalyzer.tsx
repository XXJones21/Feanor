'use client';

import React, { useState } from 'react';
import { ResumeState, ResumeAnalysisResult } from '../types/resume';
import { analyzeResume } from '../services/resumeAnalysis';

export function ResumeAnalyzer() {
  const [state, setState] = useState<ResumeState>({
    jobPosting: null,
    resumeFile: null,
    analysis: null,
    isAnalyzing: false,
    error: null,
  });

  const handleJobPostingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, jobPosting: e.target.value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState(prev => ({ ...prev, resumeFile: file }));
    }
  };

  const handleAnalyze = async () => {
    if (!state.jobPosting || !state.resumeFile) {
      setState(prev => ({ ...prev, error: 'Please provide both job posting and resume' }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const resumeContent = await readFileContent(state.resumeFile);
      const analysis = await analyzeResume(state.jobPosting, resumeContent);
      setState(prev => ({ 
        ...prev, 
        analysis,
        isAnalyzing: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to analyze resume. Please try again.',
        isAnalyzing: false 
      }));
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Resume Analyzer</h2>
      
      {/* Job Posting Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Job Posting
        </label>
        <textarea
          className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the job posting here..."
          onChange={handleJobPostingChange}
        />
      </div>

      {/* Resume Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Resume
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-700 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mt-2 text-sm">
              {state.resumeFile ? state.resumeFile.name : 'Upload your resume'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={state.isAnalyzing || !state.jobPosting || !state.resumeFile}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {state.isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
      </button>

      {/* Analysis Results */}
      {state.analysis && (
        <div className="space-y-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Job Summary</h3>
            <div className="space-y-4">
              <p className="font-medium">{state.analysis.jobSummary.title}</p>
              <div>
                <h4 className="font-medium mb-2">Key Requirements</h4>
                <ul className="list-disc pl-5">
                  {state.analysis.jobSummary.keyRequirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Resume Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Matching Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {state.analysis.resumeAnalysis.matchingSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {state.analysis.resumeAnalysis.missingSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Recommended Format</h3>
            <div className="space-y-4">
              {state.analysis.recommendedFormat.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="font-medium mb-2">{section.title}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 