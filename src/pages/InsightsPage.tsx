import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, CheckCircle2, ArrowRight, BookOpen, Briefcase, Zap,
  Trophy, Target, Heart, GraduationCap, X, FileText, CloudUpload, BarChart2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, User as UserType } from '../types';
import { getCareerInsights, CareerInsights } from '../services/aiService';

import { useTranslation } from 'react-i18next';

interface InsightsPageProps {
  courses: Course[];
  user: UserType | null;
  resumeText?: string;
  onNavigate?: (screen: any) => void;
  onSkillsSelect?: (skills: string[]) => void;
  onViewHistory?: () => void;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ courses, user, resumeText, onNavigate, onSkillsSelect, onViewHistory }) => {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<CareerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [selectedActiveSkills, setSelectedActiveSkills] = useState<string[]>([]);

  const saveToHistory = (skills: string[], type: string) => {
     const historySkills = skills.length > 0 ? skills : ['General Match'];
     const entry = { skills: historySkills, type, date: new Date().toISOString() };
     const prev = JSON.parse(localStorage.getItem('searchHistory') || '[]');
     localStorage.setItem('searchHistory', JSON.stringify([entry, ...prev].slice(0, 20))); // Keep last 20
  };

  const toggleSkill = (skill: string) => {
    setSelectedActiveSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleMatchAction = (dest: 'jobs' | 'courses') => {
    saveToHistory(selectedActiveSkills, dest);
    onSkillsSelect?.(selectedActiveSkills);
    onNavigate?.(dest);
  };

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const data = await getCareerInsights(user, resumeText);
      setInsights(data);
      setLoading(false);
      
      // Show profile completion toast immediately after loading if profile is incomplete
      if (user && !user.isProfileComplete) {
        setTimeout(() => setShowToast(true), 1000);
      }
    };
    fetchInsights();
  }, [user, resumeText]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-fixed/20 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-fixed/20 blur-[130px] rounded-full"
        />

        <div className="relative z-10 space-y-10 max-w-lg w-full">
          <div className="relative flex justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center shadow-2xl shadow-primary/30"
            >
              <Zap className="w-16 h-16 text-on-primary fill-current" />
            </motion.div>
            
            {/* Shimmering Rings */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1.5],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none"
              />
            ))}
          </div>

          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-headline font-extrabold text-3xl md:text-4xl text-primary tracking-tight"
            >
              {t('insights.loading.title')}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <p className="text-on-surface-variant text-lg font-medium">
                {t('insights.loading.subtitle')}
              </p>
              <div className="flex justify-center gap-1.5 py-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-secondary"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="pt-8 grid grid-cols-2 gap-4 text-left"
          >
            {[
              { icon: <Briefcase className="w-4 h-4" />, text: t('insights.loading.trends') },
              { icon: <Target className="w-4 h-4" />, text: t('insights.loading.matching') },
              { icon: <Trophy className="w-4 h-4" />, text: t('insights.loading.readiness') },
              { icon: <Sparkles className="w-4 h-4" />, text: t('insights.loading.context') }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <div className="text-secondary">{item.icon}</div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-secondary font-semibold tracking-wider uppercase text-xs mb-2 block">{t('insights.header.badge')}</span>
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary tracking-tight">{t('insights.header.title', { name: user?.name?.split(' ')[0] || '' })}</h1>
            <p className="text-on-surface-variant mt-4 max-w-2xl text-lg leading-relaxed">
              {t('insights.header.subtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex flex-col items-end gap-2">
              <div className="bg-primary p-1 rounded-full flex items-center pr-4 gap-3 shadow-lg shadow-primary/20">
                <div className="bg-primary-fixed text-primary p-2 rounded-full">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-white text-sm font-medium">{t('insights.header.updated')}</span>
              </div>
              {resumeText && (
                <div className="mt-2 bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <FileText className="w-3 h-3" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Resume Optimized</span>
                </div>
              )}
              <button 
                onClick={() => onViewHistory?.()}
                className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                {t('insights.header.view_history')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-7 bg-white rounded-3xl p-8 shadow-sm shadow-primary/5 relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <h2 className="font-headline font-bold text-2xl text-primary mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-secondary" />
            {t('insights.skills.title')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {insights?.skills.map(skill => {
              const isSelected = selectedActiveSkills.includes(skill);
              return (
                <motion.button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    isSelected
                      ? 'bg-secondary text-white border-secondary shadow-lg'
                      : 'bg-primary-fixed/30 text-on-primary-fixed-variant border-primary/10 hover:bg-primary-fixed/50'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}{skill}
                </motion.button>
              );
            })}
            <div className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-medium italic border border-outline-variant/10">{t('insights.skills.tap_instruction')}</div>
          </div>
          
          <AnimatePresence>
            {selectedActiveSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  onClick={() => handleMatchAction('jobs')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm md:text-base"
                >
                  <Briefcase className="w-5 h-5" /> {t('insights.skills.find_jobs')}
                </motion.button>
                <motion.button
                  onClick={() => handleMatchAction('courses')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-secondary/10 text-secondary border border-secondary/20 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <GraduationCap className="w-5 h-5" /> {t('insights.skills.upgrade_skills')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8 pt-8 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-on-surface">{t('insights.skills.readiness_score')}</span>
              </div>
              <span className="text-lg font-black text-primary">{insights?.readinessScore}%</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary-container rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${insights?.readinessScore}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
            <p className="text-xs text-outline mt-2">Based on your profile completeness and career context</p>
          </div>
        </div>

        <div className="md:col-span-5 bg-gradient-to-br from-primary to-primary-container text-white rounded-3xl p-8 shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute bottom-0 right-0 opacity-10">
            <TrendingUp className="w-[120px] h-[120px]" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-2xl mb-4 text-primary-fixed flex items-center gap-2">
              <Target className="w-6 h-6" />
              {t('insights.market.title')}
            </h2>
            <p className="text-primary-fixed/80 text-sm mb-6 leading-relaxed">
              {t('insights.market.subtitle')}
            </p>
            <ul className="space-y-4 relative z-10">
              {insights?.marketTrends.map((trend, idx) => (
                <li 
                  key={idx} 
                  onClick={() => {
                    saveToHistory([trend], 'jobs');
                    onSkillsSelect?.([trend]);
                    onNavigate?.('jobs');
                  }}
                  className="flex gap-3 cursor-pointer group/trend p-2 -m-2 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20 active:scale-95 shadow-sm hover:shadow-lg shadow-white/5"
                >
                  <CheckCircle2 className="text-primary-fixed w-5 h-5 shrink-0 group-hover/trend:scale-110 transition-transform" />
                  <span className="text-sm font-medium leading-tight group-hover/trend:text-white transition-colors">{trend}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
             <p className="text-xs italic text-primary-fixed/60">{t('insights.market.generated_by')}</p>
          </div>
        </div>
      </div>

      {/* Onboarding Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-[100] max-w-sm w-full md:w-[360px]"
          >
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-primary/20 bg-white/95 backdrop-blur-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="text-primary w-6 h-6 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-headline font-bold text-primary leading-tight">{t('insights.toast.title')}</h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t('insights.toast.message')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onNavigate?.('profile')}
                  className="flex-grow py-3 bg-primary text-on-primary text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  {t('insights.toast.action')}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowToast(false)}
                  className="px-4 py-3 bg-surface-container-low text-on-surface-variant text-sm font-semibold rounded-xl"
                >
                  {t('insights.toast.later')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {user?.resumeUrl && user.resumeUrl.trim() !== '' ? (
          <section className="mt-16 mb-12">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px flex-grow bg-outline-variant/20"></div>
               <h2 className="text-xl font-headline font-bold text-primary uppercase tracking-[0.2em] whitespace-nowrap">
                 {t('insights.strategies.title')}
               </h2>
               <div className="h-px flex-grow bg-outline-variant/20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights?.recommendations.map((rec, idx) => (
                <div key={idx} className="h-full flex flex-col bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 hover:border-secondary/20 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary group-hover:scale-110 transition-transform">
                     {idx === 0 ? <Briefcase className="w-5 h-5" /> : idx === 1 ? <Target className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-2">{t('insights.strategies.label')} {idx + 1}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed flex-grow">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-16 mb-12">
            <div className="bg-surface-container-low rounded-3xl p-12 text-center border-2 border-dashed border-outline-variant/30 flex flex-col items-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <CloudUpload className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-primary mb-3">
                {t('insights.strategies.missing_title')}
              </h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {t('insights.strategies.missing_subtitle')}
              </p>
              <button
                onClick={() => onNavigate?.('resume')}
                className="px-8 py-3 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" /> {t('insights.strategies.action')}
              </button>
            </div>
          </section>
        )}

    </main>
  );
};

export default InsightsPage;
