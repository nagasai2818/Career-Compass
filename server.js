import dotenv from 'dotenv';
// Load environment variables immediately at the top
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI with Api Key from .env
// FIXED: Use GEMINI_API_KEY (no VITE_ prefix) for backend/Node.js
const API_KEY = process.env.GEMINI_API_KEY || "";
console.log('--- Server Initialization ---');
console.log('Gemini API Key present:', !!API_KEY);

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY, apiVersion: 'v1beta' }) : null;
const DEFAULT_MODEL = "gemini-2.5-flash"; 
const MODEL_FALLBACK_LIST = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    api_key_present: !!API_KEY,
    port: port
  });
});

// Helper function to call Gemini with the CORRECT @google/genai pattern, Retry logic, and Fallback Grounding
const callGemini = async (prompt, modelName = DEFAULT_MODEL, useSearch = true, retryCount = 0) => {
  if (!genAI) throw new Error("GoogleGenAI not initialized. Check your API key.");

  let currentModel = modelName || DEFAULT_MODEL;
  
  try {
    console.log(`Calling Gemini with model: ${currentModel} (Web Search: ${useSearch}, Retry: ${retryCount})`);

    const config = {};
    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const result = await genAI.models.generateContent({
      model: currentModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: config
    });

    if (!result || !result.text) {
      throw new Error("Empty response or invalid response structure from Gemini AI.");
    }

    const text = result.text;

    // Clean JSON response (handle markdown backticks and potential prefix/suffix)
    let cleaned = text.trim();
    if (cleaned.includes("```json")) {
      cleaned = cleaned.split("```json")[1].split("```")[0].trim();
    } else if (cleaned.includes("```")) {
      cleaned = cleaned.split("```")[1].split("```")[0].trim();
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", text);
      throw new Error("AI returned invalid JSON format.");
    }
  } catch (error) {
    console.warn(`AI Model Error (${currentModel}): ${error.message} (Status: ${error.status})`);

    // 1. Handle Rate Limit (429) specifically
    if (error.status === 429 && retryCount < 3) {
      // If we keep hitting 429 even with retries, try a different model from the list
      if (retryCount >= 2) {
        const nextModel = MODEL_FALLBACK_LIST.find(m => m !== currentModel);
        if (nextModel) {
          console.warn(`Persistent Quota hit on ${currentModel}. Trying alternate model: ${nextModel}`);
          return callGemini(prompt, nextModel, useSearch, 0); // Reset retry count for the new model
        }
      }

      const waitTime = Math.pow(2, retryCount) * 2000;
      console.log(`Quota hit on ${currentModel}. Retrying in ${waitTime}ms... (Attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return callGemini(prompt, currentModel, useSearch, retryCount + 1);
    }

    // 2. Handle Search Tool errors (some accounts have tool-specific limits)
    if (useSearch && (error.message.includes("tool") || error.message.includes("search") || error.message.includes("grounding"))) {
      console.warn("Search Grounding quota likely reached. Retrying WITHOUT search fallback...");
      return callGemini(prompt, currentModel, false, retryCount);
    }

    // 3. Handle 503 / UNAVAILABLE Service errors specifically (high demand/overload)
    if ((error.status === 503 || error.message.includes("503") || error.message.includes("UNAVAILABLE")) && retryCount < 2) {
      const waitTime = (retryCount + 1) * 2000;
      console.warn(`Model ${currentModel} temporary 503/UNAVAILABLE error. Retrying in ${waitTime}ms... (Attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return callGemini(prompt, currentModel, useSearch, retryCount + 1);
    }

    // 4. Handle model availability & persistent 503 (if not found or persistent 503, try next in chain)
    const isModelUnavailable = error.status === 404 || error.status === 503 || error.message.includes("not found") || error.message.includes("UNAVAILABLE");
    if (isModelUnavailable && MODEL_FALLBACK_LIST.indexOf(currentModel) < MODEL_FALLBACK_LIST.length - 1) {
      const nextIdx = MODEL_FALLBACK_LIST.indexOf(currentModel) + 1;
      const nextModel = MODEL_FALLBACK_LIST[nextIdx];
      console.warn(`Model ${currentModel} error (${error.status || 'UNAVAILABLE'}). Falling back to ${nextModel}...`);
      return callGemini(prompt, nextModel, useSearch, 0);
    }

    throw error;
  }
};

// Endpoint for Career Insights
app.post('/api/career-insights', async (req, res) => {
  try {
    const { user, resumeText } = req.body;
    if (!user) return res.status(400).json({ error: "User profile is required." });

    const resumeContext = resumeText ? `
      PRIMARY SOURCE OF TRUTH (RESUME):
      "${resumeText}"
    ` : "No resume provided yet.";

    const prompt = `
      You are an expert career counselor for women returning to the workforce after a break. 
      SEARCH THE WEB for current market trends and live insights in the Indian job market.
      
      INFORMATION HIERARCHY (MANDATORY):
      1. RESUME CONTENT: This is your PRIMARY source for skills, history, and expertise.
      2. USER PROFILE: This is SECONDARY context (use for Name, Age, General Education). 
      3. If they conflict, ALWAYS trust the Resume Content.

      ${resumeContext}

      User Profile:
      - Name: ${user.name}
      - Age: ${user.age}
      - Education: ${JSON.stringify(user.education)}
      - Specialised Courses: ${JSON.stringify(user.specialisedCourses)}
      - Career Preferences: ${JSON.stringify(user.careerPreferences)}
      
      Based on your findings, generate personalized career insights in JSON format.
      Return a JSON object with ONLY these fields:
      - skills (array of EXACTLY 15 strings - FOCUS ON RESUME SKILLS)
      - summary (2-3 sentences based on the RESUME'S specific expertise)
      - readinessScore (number between 60-95)
      - marketTrends (array of EXACTLY 8 strings - USE LIVE DATA)
      - recommendations (array of EXACTLY 8 strings - REALISTIC AND CURRENT)

      IMPORTANT: Use Google Search to verify that the trends and recommendations are relevant to India in 2024-2025.
      IMPORTANT: You MUST provide EXACTLY the number of items requested. DO NOT provide fewer.
      Return ONLY the JSON object, no markdown, no backticks.
    `;

    let data;
    try {
      data = await callGemini(prompt, DEFAULT_MODEL);
    } catch (modelError) {
      console.warn("AI Service Error (Insights). Using fallback data.", modelError.message);
      data = {
        skills: ["Project Management", "Agile Methodology", "Process Optimization", "Team Leadership", "Digital Transformation"],
        summary: "Based on your background, you are well-positioned for leadership roles that bridge technical and business requirements. Your years of experience demonstrate a strong foundation for a smooth career re-entry.",
        readinessScore: 85,
        marketTrends: ["Increased demand for remote project leaders", "Shift towards data-driven decision making", "Hybrid work models in tech hubs"],
        recommendations: ["Update Certification in PMP or Scrum Master", "Network via Indian Women in Tech platforms", "Focus on leadership-oriented roles"]
      };
    }

    res.json(data);
  } catch (error) {
    console.error("Critical Backend Error (Insights):", error);
    res.status(500).json({ error: "Service temporarily degraded.", message: error.message });
  }
});

// Endpoint for Resume Analysis and Matching
app.post('/api/analyze-resume', async (req, res) => {
  try {
    const { userText, user } = req.body;
    if (!userText) return res.status(400).json({ error: "Resume text is required." });

    const userProfileContext = user ? `
      User Profile:
      - Name: ${user.name}
      - Age: ${user.age}
      - Education: ${JSON.stringify(user.education)}
      - Specialised Courses: ${JSON.stringify(user.specialisedCourses)}
      - Career Preferences: ${JSON.stringify(user.careerPreferences)}
    ` : "";

    const prompt = `
      Information Hierarchy (STRICT):
      1. RESUME CONTENT (Value: HIGH): This is the primary source for technical skills, experience, and past roles.
      2. USER PROFILE (Value: MEDIUM): Use this for personalizing name and age.
      3. CAREER PREFERENCES (Value: HIGH): Use this to filter by mode (Remote/Hybrid) and location.

      Resume Content:
      "${userText}"

      Context:
      ${userProfileContext}

      STRICT CONSTRAINTS (MANDATORY):
      1. Use Google Search to find ACTUAL jobs from sites like LinkedIn India, Naukri, Indeed, or company career pages.
      2. Match the user based PRIMARY on the skills found in the "Resume Content".
      3. If the User Profile contains 'Career Preferences' (like role, mode, locations):
         - You MUST prioritize these preferences when finding jobs.
         - The 'matchedJobs' MUST strongly reflect the 'targetRole'.
         - The job 'type' (Remote/On-site/Hybrid) MUST align with the user's 'mode' preference.
      4. The 'matchReason' MUST explicitly state how the role aligns with the user's specific Resume skills and Profile Preferences.

      Return a JSON object with ONLY these fields:
      - matchedJobs (array of Job objects - MUST HAVE EXACTLY 15)
      - matchedCourses (array of Course objects - MUST HAVE EXACTLY 10)
      - summary (A concise career guidance summary. First, identify and extract the name of the resume holder directly from the "Resume Content" (do NOT use the logged-in user profile name if the resume content belongs to a different person). Address them directly by name, e.g., "Hello [Name]". Then, in 2-3 clear sentences, explain how their skills align with the recommended paths and which courses they should prioritize to bridge any gaps.)
      
      Job object: { id, title, company, location, salary, description, matchScore, matchReason, imageUrl, applyUrl, type, commitment }
      
      IMPORTANT for matchScore:
      - Provide a number between 65 and 100 based on how well the job matches the user's specific skills and experience.
      Course object: { id, title, provider, matchReason, imageUrl, tag, tagColor, url, level, duration }
      
      Field Definitions:
      - Job type: One of ["On-site", "Remote", "Hybrid"]
      - Job commitment: One of ["Full-time", "Part-time", "Internship"]
      - Course level: One of ["Beginner", "Intermediate", "Advanced"]
      
      IMPORTANT for URLs:
      - YOU MUST PROVIDE LIVE, WORKING LINKS found via Google Search.
      - DO NOT use placeholders like "example.com" or "#".
      - Provide the MOST DIRECT link possible to the official application page or the company's career portal.
      - Use high-quality, functional URLs that work for the Indian market.
      
      Return ONLY the JSON object, no markdown, no backticks.
    `;

    let data;
    try {
      data = await callGemini(prompt, DEFAULT_MODEL);
    } catch (modelError) {
      console.warn("AI Service Error (Resume). Using fallback data.", modelError.message);
      data = {
        matchedJobs: [
          { id: 'f1', title: 'Action Required: Restart backend server to use new AI Key.', company: 'System Notification', location: 'Localhost', salary: 'N/A', description: 'Your backend has caught an AI error (likely 400 or 429) and requires a restart to apply the new .env key and code changes.', matchScore: 100, matchReason: 'Important Fix Needed', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop', applyUrl: '#', type: 'Hybrid', commitment: 'Full-time' },
          { id: 'f2', title: 'Customer Success Lead', company: 'GlobalServe', location: 'Mumbai / Hybrid', salary: '₹15L - ₹22L', description: 'Drive customer high retention and manage key accounts.', matchScore: 88, matchReason: 'Strong interpersonal skills and previous client-facing experience identified.', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2574&auto=format&fit=crop', applyUrl: 'https://www.naukri.com/customer-success-lead-jobs', type: 'Remote', commitment: 'Full-time' },
          { id: 'f3', title: 'Project Coordinator', company: 'Buildwell Infrastructure', location: 'Chennai', salary: '₹10L - ₹15L', description: 'Manage site schedules and vendor communications.', matchScore: 82, matchReason: 'Your coordination skills are a great fit for infrastructure projects.', imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2670&auto=format&fit=crop', applyUrl: 'https://www.linkedin.com/jobs/search?keywords=Project%20Coordinator', type: 'On-site', commitment: 'Full-time' },
          { id: 'f4', title: 'Content Strategy Manager', company: 'MediaFlow', location: 'Remote', salary: '₹14L - ₹19L', description: 'Develop and execute global content strategies.', matchScore: 85, matchReason: 'Your background in communication and project management is highly relevant.', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop', applyUrl: 'https://www.indeed.co.in/Content-Strategy-jobs', type: 'Remote', commitment: 'Full-time' },
          { id: 'f5', title: 'HR Business Partner', company: 'RetailPro', location: 'Delhi / NCR', salary: '₹16L - ₹22L', description: 'Drive people strategy and employee engagement.', matchScore: 91, matchReason: 'Your leadership experience translates well to HR leadership roles.', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2574&auto=format&fit=crop', applyUrl: 'https://www.naukri.com/hr-business-partner-jobs', type: 'Hybrid', commitment: 'Full-time' },
          { id: 'f6', title: 'Business Development Lead', company: 'SaaSGrowth', location: 'Bangalore', salary: '₹20L - ₹30L', description: 'Lead sales teams and drive revenue growth in the APAC region.', matchScore: 90, matchReason: 'Targeted for your strategic planning and leadership expertise.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop', applyUrl: 'https://www.linkedin.com/jobs/search?keywords=Business%20Development%20Lead', type: 'On-site', commitment: 'Full-time' },
          { id: 'f7', title: 'Marketing Operations Specialist', company: 'MarketEase', location: 'Remote', salary: '₹12L - ₹18L', description: 'Optimize marketing tech stack and lead nurturing funnels.', matchScore: 78, matchReason: 'Your analytical mindset and process focus are key here.', imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=2670&auto=format&fit=crop', applyUrl: 'https://www.glassdoor.co.in/Job/marketing-operations-specialist-jobs', type: 'Remote', commitment: 'Full-time' },
          { id: 'f8', title: 'Technical Project Manager', company: 'SoftCore Systems', location: 'Hyderabad', salary: '₹22L - ₹32L', description: 'Manage complex software delivery lifecycles.', matchScore: 92, matchReason: 'Excellent match for your technical management background.', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop', applyUrl: 'https://www.indeed.com/q-Technical-Project-Manager-jobs.html', type: 'Hybrid', commitment: 'Full-time' },
          { id: 'f9', title: 'Supply Chain Consultant', company: 'LogiLink', location: 'Mumbai', salary: '₹18L - ₹26L', description: 'Redesign supply chain networks for efficiency.', matchScore: 84, matchReason: 'Process optimization skills from your previous roles are a direct match.', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop', applyUrl: 'https://www.naukri.com/supply-chain-jobs', type: 'On-site', commitment: 'Full-time' },
          { id: 'f10', title: 'Data Analytics Manager', company: 'InsightCorp', location: 'Remote', salary: '₹25L - ₹35L', description: 'Lead data science teams and deliver actionable insights.', matchScore: 96, matchReason: 'Your strategic leadership and previous data handling experience align well.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbda64626dc1?q=80&w=2670&auto=format&fit=crop', applyUrl: 'https://www.glassdoor.co.in/Job/data-analytics-manager-jobs', type: 'Remote', commitment: 'Full-time' }
        ],
        matchedCourses: [
          { id: 'c1', title: 'Advanced Strategic Management', provider: 'IIM Bangalore (Online)', matchReason: 'Bridge the gap in current industry frameworks since your break.', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop', tag: 'Top Rated', tagColor: 'blue', url: 'https://www.iimb.ac.in/eep/', level: 'Advanced', duration: '3 Months' },
          { id: 'c2', title: 'Digital Transformation Leadership', provider: 'ISB Executive Education', matchReason: 'Modernize your leadership skills for the digital age.', imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop', tag: 'Premium', tagColor: 'purple', url: 'https://execed.isb.edu/', level: 'Advanced', duration: '4 Months' },
          { id: 'c3', title: 'PMP Certification Training', provider: 'Simplilearn', matchReason: 'Formalize your project management expertise with a global certificate.', imageUrl: 'https://images.unsplash.com/photo-1454165833762-02c347065963?q=80&w=2670&auto=format&fit=crop', tag: 'Certification', tagColor: 'green', url: 'https://www.simplilearn.com/pmp-certification-training', level: 'Intermediate', duration: '2 Months' },
          { id: 'c4', title: 'Business Analytics Program', provider: 'Great Learning', matchReason: 'Gain data-driven decision making skills requested in senior roles.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbda64626dc1?q=80&w=2670&auto=format&fit=crop', tag: 'Trending', tagColor: 'orange', url: 'https://www.greatlearning.in/business-analytics-course', level: 'Intermediate', duration: '6 Months' },
          { id: 'c5', title: 'Women in Leadership', provider: 'Harvard Online', matchReason: 'Specifically designed for women looking to break the glass ceiling.', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop', tag: 'High Impact', tagColor: 'pink', url: 'https://online.harvard.edu/programs/women-leadership', level: 'Advanced', duration: '6 Weeks' }
        ],
        summary: `AI Analysis Service Issue: ${modelError.message}. Showing temporary baseline recommendations. Please restart your backend server if you just updated the API key.`
      };
    }

    res.json(data);
  } catch (error) {
    console.error("Critical Backend Error (Resume):", error);
    res.status(500).json({ error: "Service temporarily degraded.", message: error.message });
  }
});

// Endpoint for On-the-fly Job Generation by Skills
app.post('/api/generate-jobs-by-skills', async (req, res) => {
  try {
    const { user, skills } = req.body;
    if (!skills || skills.length === 0) return res.status(400).json({ error: "Skills are required." });

    const userProfileContext = user ? `
      User Profile:
      - Name: ${user.name}
      - Age: ${user.age}
      - Education: ${JSON.stringify(user.education)}
      - Specialised Courses: ${JSON.stringify(user.specialisedCourses)}
      - Career Preferences: ${JSON.stringify(user.careerPreferences)}
    ` : "";

    const prompt = `
      You are a high-level career advisor for women returning to work in India. 
      SEARCH THE WEB for current, live vacancies and job openings in India.
      GENERATE EXACTLY 15 REAL, LIVE job opportunities tailored specifically to these skills: ${skills.join(', ')}.
      
      Context:
      ${userProfileContext}
      
      STRICT CONSTRAINTS (MANDATORY):
      1. Use Google Search to browse latest job postings from sites like LinkedIn India, Naukri, or direct company portals.
      2. If the User Profile contains 'Career Preferences' (like role, mode, locations):
         - You MUST prioritize these preferences above all else.
         - The 'matchedJobs' MUST strongly reflect the 'targetRole'.
         - The job 'type' (Remote/On-site/Hybrid) MUST align with the user's 'mode' preference.
      3. The 'matchReason' MUST explicitly state how the job aligns with the user's specific Profile Details.
      
      Return a JSON object with ONLY this field:
      - matchedJobs (array of Job objects - MUST HAVE EXACTLY 15)
      
      Job object: { id, title, company, location, salary, description, matchScore, matchReason, imageUrl, applyUrl, type, commitment }
      
      IMPORTANT for matchScore:
      - Provide a number between 65 and 100 based on how well the job matches the provided skills.
      
      IMPORTANT for URLs:
      - YOU MUST PROVIDE LIVE, WORKING LINKS found via Google Search.
      - DO NOT use placeholders like "example.com" or "#".
      - Provide a DIRECT link to the company's career page or the job listing.
      - Ensure all URLs are functional and lead to the company's official presence.

      Return ONLY the JSON object, no markdown, no backticks.
    `;

    let data;
    try {
      data = await callGemini(prompt, DEFAULT_MODEL);
    } catch (modelError) {
      console.warn("AI Service Error (Jobs). Using fallback data.", modelError.message);
      data = {
        matchedJobs: [
          { 
            id: 'dyn1', 
            title: `Senior ${skills[0] || 'Role'} Specialist`, 
            company: 'TechSolutions India', 
            location: 'Remote / Bangalore', 
            salary: '₹12L - ₹20L', 
            description: `Leverage your ${skills[0]} skills to drive growth.`, 
            matchScore: 92,
            matchReason: 'Direct match for your selected skills and experience.', 
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop', 
            applyUrl: `https://www.naukri.com/${skills[0] || 'jobs'}-jobs`,
            type: 'Remote',
            commitment: 'Full-time'
          },
          { 
            id: 'dyn2', 
            title: `${skills[0] || 'Operations'} Lead`, 
            company: 'GlobalServe', 
            location: 'Mumbai / Hybrid', 
            salary: '₹10L - ₹18L', 
            description: `Lead teams with your expertise in ${skills[0]}.`, 
            matchScore: 85,
            matchReason: 'Strategic fit for your skill set.', 
            imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2574&auto=format&fit=crop', 
            applyUrl: `https://www.linkedin.com/jobs/search?keywords=${skills[0] || 'Operations'}%20Lead`,
            type: 'Hybrid',
            commitment: 'Full-time'
          },
          { 
            id: 'dyn3', 
            title: `Consultant - ${skills[1] || skills[0] || 'Management'}`, 
            company: 'InsightCorp', 
            location: 'Remote', 
            salary: '₹15L - ₹25L', 
            description: `Provide strategic consulting using your ${skills[1] || skills[0]} experience.`, 
            matchScore: 78,
            matchReason: 'High demand for your specific skill profile.', 
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bbda64626dc1?q=80&w=2670&auto=format&fit=crop', 
            applyUrl: `https://www.indeed.com/q-${skills[1] || skills[0]}-Consultant-jobs.html`,
            type: 'Remote',
            commitment: 'Full-time'
          },
          { 
            id: 'dyn4', 
            title: `Assistant Vice President - ${skills[0] || 'Business'}`, 
            company: 'RetailPro', 
            location: 'Gurgaon', 
            salary: '₹22L - ₹32L', 
            description: `Executive leadership role focusing on ${skills[0]}.`, 
            matchScore: 88,
            matchReason: 'Your years of experience make you eligible for leadership roles.', 
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop', 
            applyUrl: `https://www.naukri.com/${skills[0] || 'business'}-leadership-jobs`,
            type: 'On-site',
            commitment: 'Full-time'
          },
          { 
            id: 'dyn5', 
            title: `Freelance ${skills[0] || 'Technical'} Expert`, 
            company: 'GigNetwork', 
            location: 'Remote', 
            salary: '₹5k - ₹10k / day', 
            description: `Flexible projects for experts in ${skills[0]}.`, 
            matchScore: 70,
            matchReason: 'Perfect for easing back into the workforce with flexibility.', 
            imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=2670&auto=format&fit=crop', 
            applyUrl: `https://www.upwork.com/search/jobs/?q=${skills[0] || 'freelance'}`,
            type: 'Remote',
            commitment: 'Part-time'
          }
        ]
      };
    }

    res.json(data);
  } catch (error) {
    console.error("Critical Backend Error (Generate Jobs):", error);
    res.status(500).json({ error: "Service temporarily degraded.", message: error.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});