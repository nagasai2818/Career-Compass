import React, { useState } from 'react';
import { CloudUpload, FileText, Edit3, Sparkles, ShieldCheck, Loader2, CheckCircle2, Briefcase, BookOpen, ArrowRight, Brain, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeAndFilter } from '../services/aiService';
import { AnalysisResult, User as UserType } from '../types';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface ResumePageProps {
  jobIds: string[];
  courseIds: string[];
  user: UserType | null;
  onAnalysisComplete: (result: AnalysisResult, text: string) => void;
  onNavigate: (screen: any) => void;
}

const ResumePage: React.FC<ResumePageProps> = ({ jobIds, courseIds, user, onAnalysisComplete, onNavigate }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      alert(t('resume.alerts.invalid_file'));
      // Reset input
      e.target.value = '';
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${firebaseUser.uid}/${Math.random()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Update profile with resume URL in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', firebaseUser.uid);

      if (updateError) throw updateError;

      const guessNameFromFilename = (nameStr: string): string => {
        let cleanName = nameStr.substring(0, nameStr.lastIndexOf('.')) || nameStr;
        cleanName = cleanName.replace(/[_\-.]/g, ' ');
        cleanName = cleanName.replace(/\b(resume|cv|final|latest|updated|work|profile|job|copy|doc|docx|pdf|for|of)\b/gi, '');
        cleanName = cleanName.trim().replace(/\s+/g, ' ');
        if (!cleanName) return '';
        return cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      };

      const guessedName = guessNameFromFilename(file.name);
      const displayName = guessedName || user?.name || 'Not provided';

      setText(`I have successfully uploaded my resume (${file.name}). 

Key details from my profile:
- Name: ${displayName}
- Education: ${user?.education?.map((e: any) => e.degree).join(', ') || 'See resume'}
- Career Preferences: ${user?.careerPreferences?.role || 'Various roles'}

Please analyze my background based on this upload and my profile to find the best job matches and courses.`);
      alert(t('resume.alerts.success'));
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert(t('resume.alerts.error', { message: err.message }));
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      alert(t('resume.alerts.empty'));
      return;
    }
    setLoading(true);
    try {
      const analysisResult = await analyzeAndFilter(text, user, jobIds, courseIds);
      setResult(analysisResult);
      onAnalysisComplete(analysisResult, text);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      alert(err.message || 'Failed to analyze resume. Please try again or check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center text-center p-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 mb-8"
        >
          <Brain className="w-14 h-14 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline font-extrabold text-3xl text-primary mb-3"
        >
          {t('resume.loading.title')}
        </motion.h2>
        <p className="text-on-surface-variant text-lg max-w-sm">
          {t('resume.loading.subtitle')}
        </p>
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2.5 h-2.5 rounded-full bg-secondary"
            />
          ))}
        </div>
        <div className="mt-8 max-w-xs text-xs text-outline flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Powered by Google Gemini 3 Flash (Preview)
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-headline font-extrabold text-4xl text-primary mb-3">{t('resume.result.title')}</h2>
          <div className="text-on-surface-variant text-base max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap text-left bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
            {result.summary}
          </div>
        </motion.div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm text-center group hover:shadow-xl transition-all cursor-pointer"
            onClick={() => onNavigate('jobs')}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-headline font-bold text-2xl text-primary mb-2">
              {t('resume.result.jobs.title', { count: result.matchedJobIds.length })}
            </h3>
            <p className="text-on-surface-variant text-sm mb-6">
              {t('resume.result.jobs.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
              {t('resume.result.jobs.action')} <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm text-center group hover:shadow-xl transition-all cursor-pointer"
            onClick={() => onNavigate('courses')}
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-headline font-bold text-2xl text-primary mb-2">
              {t('resume.result.courses.title', { count: result.matchedCourseIds.length })}
            </h3>
            <p className="text-on-surface-variant text-sm mb-6">
              {t('resume.result.courses.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-2 text-secondary font-bold group-hover:gap-4 transition-all">
              {t('resume.result.courses.action')} <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setResult(null)}
            className="text-sm text-on-surface-variant hover:text-primary underline"
          >
            {t('resume.result.reanalyse')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 mb-24">
      <div className="mb-10 text-center md:text-left">
        <span className="text-secondary font-semibold tracking-wider uppercase text-xs mb-2 block">{t('resume.header.badge')}</span>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary mb-4 leading-tight">
          {t('resume.header.title')}
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          {t('resume.header.subtitle')}
        </p>
      </div>

      <div className="space-y-10">
        {/* Upload Section */}
        <section className="group">
          <div className="relative overflow-hidden bg-surface-container-lowest rounded-3xl p-10 md:p-14 border-2 border-dashed border-outline-variant/30 hover:border-primary/40 transition-all duration-300 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-primary-fixed flex items-center justify-center rounded-2xl text-primary transform group-hover:scale-110 transition-transform duration-300">
                <CloudUpload className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline font-bold text-2xl text-on-surface">{t('resume.upload.title')}</h3>
                <p className="text-on-surface-variant">{t('resume.upload.subtitle')}</p>
              </div>
              <label className="cursor-pointer">
                <input 
                  accept=".pdf,.docx" 
                  className="hidden" 
                  type="file" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
                <span className={`inline-flex items-center px-8 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> {t('resume.upload.uploading')}
                    </>
                  ) : (
                    t('resume.upload.select')
                  )}
                </span>
              </label>
              {fileName && (
                <div className="flex items-center gap-2 text-primary font-medium text-sm bg-primary-fixed/30 px-4 py-2 rounded-full">
                  <FileText className="w-4 h-4" />
                  {t('resume.upload.ready', { fileName })}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-outline bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20">
                <Sparkles className="w-3 h-3 text-secondary" />
                <span>AI analysis is currently based on your profile and upload description.</span>
              </div>
              <p className="text-sm text-outline">{t('resume.upload.footer')}</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-6">
          <div className="flex-grow h-px bg-outline-variant/20"></div>
          <span className="font-headline font-bold text-outline-variant text-sm tracking-widest uppercase italic">{t('auth.login.or')}</span>
          <div className="flex-grow h-px bg-outline-variant/20"></div>
        </div>

        {/* Text Input Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Edit3 className="text-secondary w-6 h-6" />
            <h3 className="font-headline font-bold text-2xl text-on-surface">{t('resume.describe.title')}</h3>
          </div>
          <div className="bg-surface-container-low rounded-3xl p-8 space-y-4">
            <label className="block text-sm font-semibold text-on-surface-variant px-1" htmlFor="career-summary">
              {t('resume.describe.label')}
            </label>
            <textarea
              className="w-full bg-surface-container-lowest border-0 rounded-2xl p-6 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-fixed shadow-sm transition-all resize-none"
              id="career-summary"
              placeholder="E.g., I have 8 years of experience in project management and operations in the IT sector. I took a break for 3 years for family reasons. I have an MBA from Pune University and a PMP certification. I'm now looking for senior operations or project lead roles in Bangalore or remote positions..."
              rows={7}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <span className="text-xs text-outline italic">{t('resume.describe.footer')}</span>
            </div>
          </div>
        </section>

        {/* Analyze Button */}
        <div className="pt-4 flex flex-col items-center gap-6">
          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-primary text-on-primary font-headline font-extrabold text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Sparkles className="w-6 h-6" />
            {t('resume.action.button')}
          </button>
          <div className="flex items-center gap-4 text-on-surface-variant/70">
            <ShieldCheck className="w-5 h-5" />
            <p className="text-sm">{t('resume.action.privacy')}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResumePage;
