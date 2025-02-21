'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeAnalyzer = ResumeAnalyzer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const resumeAnalysis_1 = require("../services/resumeAnalysis");
function ResumeAnalyzer() {
    const [state, setState] = (0, react_1.useState)({
        jobPosting: null,
        resumeFile: null,
        analysis: null,
        isAnalyzing: false,
        error: null,
    });
    const handleJobPostingChange = (e) => {
        setState(prev => ({ ...prev, jobPosting: e.target.value }));
    };
    const handleFileUpload = (e) => {
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
            const analysis = await (0, resumeAnalysis_1.analyzeResume)(state.jobPosting, resumeContent);
            setState(prev => ({
                ...prev,
                analysis,
                isAnalyzing: false
            }));
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to analyze resume. Please try again.',
                isAnalyzing: false
            }));
        }
    };
    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result);
            };
            reader.onerror = (e) => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        });
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-6 p-6 max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Resume Analyzer" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Job Posting" }), (0, jsx_runtime_1.jsx)("textarea", { className: "w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500", placeholder: "Paste the job posting here...", onChange: handleJobPostingChange })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Your Resume" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center w-full", children: (0, jsx_runtime_1.jsxs)("label", { className: "w-full flex flex-col items-center px-4 py-6 bg-white text-gray-700 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("svg", { className: "w-8 h-8 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }), (0, jsx_runtime_1.jsx)("span", { className: "mt-2 text-sm", children: state.resumeFile ? state.resumeFile.name : 'Upload your resume' }), (0, jsx_runtime_1.jsx)("input", { type: "file", className: "hidden", accept: ".pdf,.doc,.docx", onChange: handleFileUpload })] }) })] }), state.error && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 text-red-700 bg-red-100 rounded-lg", children: state.error })), (0, jsx_runtime_1.jsx)("button", { onClick: handleAnalyze, disabled: state.isAnalyzing || !state.jobPosting || !state.resumeFile, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400", children: state.isAnalyzing ? 'Analyzing...' : 'Analyze Resume' }), state.analysis && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 mt-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-4", children: "Job Summary" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: state.analysis.jobSummary.title }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: "Key Requirements" }), (0, jsx_runtime_1.jsx)("ul", { className: "list-disc pl-5", children: state.analysis.jobSummary.keyRequirements.map((req, i) => ((0, jsx_runtime_1.jsx)("li", { children: req }, i))) })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-4", children: "Resume Analysis" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: "Matching Skills" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: state.analysis.resumeAnalysis.matchingSkills.map((skill, i) => ((0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 bg-green-100 text-green-800 rounded", children: skill }, i))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: "Missing Skills" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: state.analysis.resumeAnalysis.missingSkills.map((skill, i) => ((0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 bg-red-100 text-red-800 rounded", children: skill }, i))) })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold mb-4", children: "Recommended Format" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: state.analysis.recommendedFormat.sections.map((section, i) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: section.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 whitespace-pre-wrap", children: section.content })] }, i))) })] })] }))] }));
}
