"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = analyzeResume;
async function analyzeResume(jobPosting, resumeContent) {
    try {
        const response = await window.electron.invoke('chat-completion', {
            messages: [
                {
                    role: 'system',
                    content: `You are an expert recruiter and resume analyst. Your task is to:
1. Analyze the job posting to extract key requirements and desired skills
2. Compare the resume against these requirements
3. Provide specific, actionable feedback for improving the resume
4. Generate a recommended format for the improved resume

Your response should be in JSON format matching this structure:
{
  "jobSummary": {
    "title": "Job Title",
    "keyRequirements": ["req1", "req2"],
    "desiredSkills": ["skill1", "skill2"]
  },
  "resumeAnalysis": {
    "matchingSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "suggestedImprovements": ["improvement1", "improvement2"]
  },
  "recommendedFormat": {
    "sections": [
      {
        "title": "Section Title",
        "content": "Section content and suggestions"
      }
    ]
  }
}`
                },
                {
                    role: 'user',
                    content: `Job Posting:\n${jobPosting}\n\nResume:\n${resumeContent}`
                }
            ],
            functions: [],
            temperature: 0.7,
            stream: false,
            function_call: 'none',
            model: 'gpt-4'
        });
        const analysis = JSON.parse(response.choices[0].message.content);
        return analysis;
    }
    catch (error) {
        console.error('Failed to analyze resume:', error);
        throw new Error('Failed to analyze resume. Please try again.');
    }
}
