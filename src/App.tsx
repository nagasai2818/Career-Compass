/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, FileText, X } from 'lucide-react';
import { User, Screen, AnalysisResult } from './types';
import { useTranslation } from 'react-i18next';

// Components
import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';

// Pages
import LandingPage from './pages/LandingPage';
import InsightsPage from './pages/InsightsPage';
import JobsPage from './pages/JobsPage';
import ResumePage from './pages/ResumePage';
import ProfilePage from './pages/ProfilePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';

// Data
import { JOBS } from './data/jobs';
import { COURSES } from './data/courses';

import { auth, isFirebaseSetup } from './lib/firebase';
import { supabase } from './lib/supabase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(isFirebaseSetup);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showGlobalResumePrompt, setShowGlobalResumePrompt] = useState<'jobs' | 'courses' | null>(null);
  const [shouldScrollToHistory, setShouldScrollToHistory] = useState(false);
  const [lastResumeText, setLastResumeText] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Listen for changes on auth state using Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName);
        setScreen('insights');
      } else {
        setUser(null);
        setScreen('landing');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string, displayName?: string | null) => {
    if (!supabase) {
      console.error('Supabase client not initialized. Cannot fetch profile.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Connecting to Supabase for User ID:', userId);
      
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Supabase request timed out after ${ms/1000}s`)), ms)
      );

      // Wrap the select query in a timeout
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Fetching profile...');
      const response = await Promise.race([profileQuery, timeout(8000)]) as any;
      const { data, error } = response;

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found in Supabase. Creating new profile for:', email);
          
          // Profile doesn't exist, this might be a new user
          const insertQuery = supabase
            .from('profiles')
            .insert({
              id: userId,
              name: displayName || 'New User',
              email: email,
              is_profile_complete: false
            })
            .select()
            .single();

          console.log('Creating new profile...');
          const insertResponse = await Promise.race([insertQuery, timeout(8000)]) as any;
          
          if (insertResponse.error) {
            console.error('Failed to create initial profile in Supabase:', insertResponse.error);
            throw insertResponse.error;
          }
          
          console.log('Successfully created new Supabase profile');
          
          if (insertResponse.data) {
            setUser({
              name: insertResponse.data.name || '',
              age: insertResponse.data.age || '',
              email: email,
              phone: insertResponse.data.phone || '',
              education: insertResponse.data.education || [],
              specialisedCourses: insertResponse.data.specialised_courses || [],
              careerPreferences: insertResponse.data.career_preferences || {},
              resumeFileName: insertResponse.data.resume_url?.split('/').pop() || '',
              resumeUrl: insertResponse.data.resume_url || '',
              linkedinUrl: insertResponse.data.linkedin_url || '',
              isProfileComplete: insertResponse.data.is_profile_complete || false
            });
          }
        } else {
          console.error('Supabase error fetching profile:', error);
          throw error;
        }
      } else if (data) {
        console.log('Successfully retrieved user profile from Supabase');
        setUser({
          name: data.name || '',
          age: data.age || '',
          email: email,
          phone: data.phone || '',
          education: data.education || [],
          specialisedCourses: data.specialised_courses || [],
          careerPreferences: data.career_preferences || {},
          resumeFileName: data.resume_url?.split('/').pop() || '',
          resumeUrl: data.resume_url || '',
          linkedinUrl: data.linkedin_url || '',
          isProfileComplete: data.is_profile_complete || false
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile handoff:', error);
      alert(`Profile loading failed or timed out: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const handleSignup = () => {
    // Firebase SignUp already happened in SignupPage
    // App.tsx onAuthStateChanged will handle the transition
  };

  const handleLogin = () => {
    // Firebase Login already happened in LoginPage
    // App.tsx onAuthStateChanged will handle the transition
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAnalysisResult(null);
  };

  const handleSetScreen = (targetScreen: Screen) => {
    // Clear scroll state when moving between screens normally
    if (targetScreen !== 'profile') {
      setShouldScrollToHistory(false);
    }
    
    // Intercept navigation to jobs or courses if resume is missing
    if ((targetScreen === 'jobs' || targetScreen === 'courses') && !user?.resumeUrl) {
      setShowGlobalResumePrompt(targetScreen);
    } else {
      setScreen(targetScreen);
    }
  };

  const handleNavigateToHistory = () => {
    setShouldScrollToHistory(true);
    setScreen('profile');
  };

  const handleAnalysisComplete = (result: AnalysisResult, text: string) => {
    setAnalysisResult(result);
    setLastResumeText(text);
    // Save to history so it appears in Profile
    const entry = { 
      skills: ['Resume Analysis', 'AI Fit Check'], 
      type: 'jobs', 
      date: new Date().toISOString() 
    };
    const prev = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    localStorage.setItem('searchHistory', JSON.stringify([entry, ...prev].slice(0, 20)));
  };

  const isAuthPage = ['landing', 'login', 'signup'].includes(screen);
  const showNavigation = !isAuthPage && user !== null;

  const renderScreen = () => {
    if (loading) {
      return (
        <div className="flex-grow flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!auth && (screen === 'login' || screen === 'signup')) {
      return (
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-surface-container-low rounded-3xl p-10 border border-primary/20 shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-4">{t('app.backend_error.title')}</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              {t('app.backend_error.message')}
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-surface-container-lowest rounded-xl text-xs font-mono text-left overflow-auto border border-outline-variant/30">
                # Add these to your .env file<br />
                VITE_FIREBASE_API_KEY=...<br />
                VITE_FIREBASE_APP_ID=...
              </div>
              <button 
                onClick={() => setScreen('landing')}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl"
              >
                {t('app.backend_error.go_back')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!isAuthPage && !user) {
      setScreen('landing');
      return null;
    }

    switch (screen) {
      case 'landing':
        return <LandingPage onStart={() => setScreen('signup')} onLogin={() => setScreen('login')} />;
      case 'signup':
        return <SignupPage onSignup={handleSignup} onNavigateLogin={() => setScreen('login')} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigateSignup={() => handleSetScreen('signup')} />;
      case 'insights':
        return <InsightsPage courses={COURSES} user={user} resumeText={lastResumeText || undefined} onNavigate={handleSetScreen} onSkillsSelect={(skills) => setSelectedSkills(skills)} onViewHistory={handleNavigateToHistory} />;
      case 'resume':
        return (
          <ResumePage
            jobIds={JOBS.map(j => j.id)}
            courseIds={COURSES.map(c => c.id)}
            user={user}
            onAnalysisComplete={handleAnalysisComplete}
            onNavigate={setScreen}
          />
        );
      case 'courses':
        return (
          <CoursesPage
            courses={analysisResult?.matchedCourses ?? COURSES}
            filteredIds={analysisResult?.matchedCourseIds ?? null}
            selectedSkills={selectedSkills}
            userAge={user?.age}
            user={user}
            loading={loading}
          />
        );
      case 'jobs':
        return (
          <JobsPage
            jobs={analysisResult?.matchedJobs ?? JOBS}
            filteredIds={analysisResult?.matchedJobIds ?? null}
            selectedSkills={selectedSkills}
            userAge={user?.age}
            user={user}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onNavigate={handleSetScreen}
            scrollToHistory={shouldScrollToHistory}
            onReSearch={(skills, type) => {
              setSelectedSkills(skills);
              handleSetScreen(type);
            }}
          />
        );
      default:
        return <LandingPage onStart={() => handleSetScreen('signup')} onLogin={() => handleSetScreen('login')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      {showNavigation && (
        <TopAppBar
          onBack={() => handleSetScreen('insights')}
          showBack={screen === 'resume'}
          title={t('common.appName')}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-grow flex flex-col"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {showNavigation && (
        <BottomNavBar currentScreen={screen} setScreen={handleSetScreen} />
      )}

      {/* Global Resume Prompt */}
      <AnimatePresence>
        {showGlobalResumePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowGlobalResumePrompt(null)} 
                className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2 tracking-tight">{t('app.missing_resume.title')}</h2>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                {t('app.missing_resume.message', { type: t(`nav.${showGlobalResumePrompt}`) })}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowGlobalResumePrompt(null);
                    setScreen('resume');
                  }}
                  className="w-full py-3.5 bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90"
                >
                  <FileText className="w-5 h-5" /> {t('app.missing_resume.upload_first')}
                </button>
                <button
                  onClick={() => {
                    const dest = showGlobalResumePrompt;
                    setShowGlobalResumePrompt(null);
                    setScreen(dest);
                  }}
                  className="w-full py-3.5 bg-surface-container-low text-primary font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  {t('app.missing_resume.proceed_anyway')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed/20 blur-[120px] -z-10 rounded-full"></div>
      <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-secondary-fixed/30 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
}
