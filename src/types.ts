export type Screen = 'landing' | 'insights' | 'jobs' | 'resume' | 'profile' | 'login' | 'signup' | 'courses';

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface CareerPreferences {
  targetRole: string;
  preferredLocations: string;
  workMode: string;
  expectedSalary: string;
  noticePeriod: string;
}

export interface User {
  name: string;
  age: string;
  email: string;
  password?: string;
  phone?: string;
  education?: Education[];
  specialisedCourses?: string[];
  careerPreferences?: CareerPreferences;
  resumeFileName?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  isProfileComplete?: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  imageUrl: string;
  type?: 'On-site' | 'Remote' | 'Hybrid';
  commitment?: 'Full-time' | 'Part-time' | 'Internship';
  applyUrl?: string;
  isMatched?: boolean;
  matchScore?: number;
  matchReason?: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  imageUrl: string;
  tag: string;
  tagColor: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  url?: string;
  matchReason?: string;
}

export interface AnalysisResult {
  matchedJobs: Job[];
  matchedJobIds: string[];
  matchedCourses: Course[];
  matchedCourseIds: string[];
  summary: string;
}
