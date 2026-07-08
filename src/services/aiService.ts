import { User, AnalysisResult, Job, Course } from "../types";

// API Base URL - Use relative path in production, default to localhost:3001 in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '');

export interface CareerInsights {
  skills: string[];
  summary: string;
  readinessScore: number;
  marketTrends: string[];
  recommendations: string[];
}

export const getCareerInsights = async (user: User | null, resumeText?: string): Promise<CareerInsights> => {
  if (!user) {
    throw new Error("User profile is required for career insights.");
  }

  const cacheKey = `career_insights_${user.email}_${resumeText ? 'with_resume' : 'no_resume'}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) {}
  }

  try {
    console.log('Fetching insights from backend...');
    const response = await fetch(`${API_BASE_URL}/api/career-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, resumeText })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch insights from backend');
    }

    const data = await response.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("AI Career Insights Error (Frontend):", error);
    throw error;
  }
};

export const analyzeAndFilter = async (
  userText: string,
  user: User | null = null,
  _jobIds: string[] = [],
  _courseIds: string[] = []
): Promise<AnalysisResult> => {
  if (!userText.trim()) {
    throw new Error("Input text is empty.");
  }

  try {
    console.log('Fetching resume analysis from backend...');
    const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText, user })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze resume from backend');
    }

    const data = await response.json();

    // Map results to include IDs for compatibility
    return {
      ...data,
      matchedJobIds: (data.matchedJobs || []).map((j: Job) => j.id),
      matchedCourseIds: (data.matchedCourses || []).map((c: Course) => c.id)
    };
  } catch (error) {
    console.error("AI Matching Error (Frontend):", error);
    throw error;
  }
};

export const generateJobsBySkills = async (user: User | null, skills: string[]): Promise<Job[]> => {
  if (!skills || skills.length === 0) return [];
  
  try {
    console.log('Fetching dynamic jobs by skills from backend...');
    const response = await fetch(`${API_BASE_URL}/api/generate-jobs-by-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, skills })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dynamic jobs');
    }

    const data = await response.json();
    return data.matchedJobs || [];
  } catch (error) {
    console.error("Dynamic Jobs Error:", error);
    return [];
  }
};
