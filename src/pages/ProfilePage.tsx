import React, { useState, useEffect } from 'react';
import {
  Edit3, FileText, Download, LogOut, User as UserIcon, ArrowRight,
  GraduationCap, Award, CheckCircle2, Plus, Zap, Save, Trash2,
  Briefcase, MapPin, IndianRupee, Clock, Linkedin, Phone, X, Loader2, Search, Trophy,
  CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Education, CareerPreferences } from '../types';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

interface ProfilePageProps {
  user: UserType | null;
  onUpdateUser: (user: UserType) => void;
  onLogout: () => void;
  onNavigate: (screen: any) => void;
  onReSearch?: (skills: string[], type: 'jobs' | 'courses') => void;
  scrollToHistory?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onLogout, onNavigate, onReSearch, scrollToHistory }) => {
  const { t } = useTranslation();
  const historyRef = React.useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(!user?.isProfileComplete);
  const [showPopup, setShowPopup] = useState(!user?.isProfileComplete);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [education, setEducation] = useState<Education[]>(user?.education || []);
  const [specialisedCourses, setSpecialisedCourses] = useState<string[]>(user?.specialisedCourses || []);
  const [newCourse, setNewCourse] = useState('');
  const [prefs, setPrefs] = useState<CareerPreferences>(user?.careerPreferences || {
    targetRole: '',
    preferredLocations: '',
    workMode: 'Hybrid',
    expectedSalary: '',
    noticePeriod: 'Immediate'
  });
  const [newEdu, setNewEdu] = useState<Education>({ degree: '', school: '', year: '' });
  const [addingEdu, setAddingEdu] = useState(false);
  const [history, setHistory] = useState<{skills: string[], type: string, date: string}[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('searchHistory') || '[]'));
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (scrollToHistory && historyRef.current) {
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [scrollToHistory]);

  const handleSave = async () => {
    if (!name.trim()) { alert(t('profile.alerts.name_required')); return; }
    
    setSaving(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No authenticated user found');

      const isFormComplete = !!(
        name.trim() &&
        age &&
        phone.trim() &&
        linkedinUrl.trim() &&
        education.length > 0 &&
        specialisedCourses.length > 0 &&
        prefs.targetRole.trim() &&
        prefs.expectedSalary.trim() &&
        prefs.preferredLocations.trim()
      );

      const updated: UserType = {
        ...user!,
        name, age, phone, linkedinUrl,
        education,
        specialisedCourses,
        careerPreferences: prefs,
        isProfileComplete: isFormComplete,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: firebaseUser.uid,
          name: name,
          age: age,
          phone: phone,
          linkedin_url: linkedinUrl,
          education: education,
          specialised_courses: specialisedCourses,
          career_preferences: prefs,
          is_profile_complete: isFormComplete,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      onUpdateUser(updated);
      setIsEditing(false);
      
      if (isFormComplete) {
        setShowPopup(false);
        if (!user?.isProfileComplete) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        }
      } else {
        alert(t('profile.alerts.incomplete'));
      }
    } catch (err: any) {
      alert(t('profile.alerts.save_error', { message: err.message }));
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    if (newEdu.degree && newEdu.school && newEdu.year) {
      setEducation([...education, newEdu]);
      setNewEdu({ degree: '', school: '', year: '' });
      setAddingEdu(false);
    }
  };

  const removeEducation = (idx: number) => setEducation(education.filter((_, i) => i !== idx));

  const addCourse = () => {
    if (newCourse.trim()) {
      setSpecialisedCourses([...specialisedCourses, newCourse.trim()]);
      setNewCourse('');
    }
  };

  const removeCourse = (idx: number) => setSpecialisedCourses(specialisedCourses.filter((_, i) => i !== idx));

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      alert(t('resume.alerts.invalid_file'));
      e.target.value = '';
      return;
    }

    setUploadingResume(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not authenticated');

      const filePath = `${firebaseUser.uid}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          resume_url: publicUrl
        })
        .eq('id', firebaseUser.uid);

      if (updateError) throw updateError;

      const updated: UserType = {
        ...user!,
        resumeUrl: publicUrl,
        resumeFileName: file.name
      };
      onUpdateUser(updated);
      alert(t('resume.alerts.success'));
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert(t('resume.alerts.error', { message: err.message }));
    } finally {
      setUploadingResume(false);
    }
  };

  const inputCls = `w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all`;
  const readCls = `w-full bg-transparent rounded-xl p-3 text-sm text-on-surface font-medium`;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-8 mb-28 relative min-h-[70vh]">

      {/* Profile Completion Toast */}
      <AnimatePresence>
        {showPopup && !user?.isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-[100] max-w-sm w-full"
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-primary/20 backdrop-blur-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="text-primary w-6 h-6 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary leading-tight">{t('profile.status.incomplete')}</h2>
                  <p className="text-xs text-on-surface-variant mt-1">{t('profile.readiness.incomplete_msg')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(true); setShowPopup(false); }}
                  className="flex-grow py-3 bg-primary text-on-primary text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {t('profile.actions.edit')} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-3 bg-surface-container-low text-on-surface-variant text-sm font-semibold rounded-xl"
                >
                  {t('profile.actions.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="relative bg-surface-container-lowest rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-outline-variant/10">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-secondary-fixed shadow-md bg-primary-fixed flex items-center justify-center">
            <UserIcon className="w-14 h-14 text-primary" />
          </div>
        </div>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h2 className="font-headline font-bold text-3xl text-primary tracking-tight">{user?.name || t('common.your_name')}</h2>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed text-on-primary-fixed rounded-full text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {user?.isProfileComplete ? t('profile.status.complete') : t('profile.status.incomplete')}
          </div>
          <p className="text-on-surface-variant text-sm">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
            >
              <Edit3 className="w-4 h-4" /> {t('profile.actions.edit')}
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" /> {t('profile.actions.save')}
            </button>
          )}
        </div>
      </section>

      {/* Personal Info */}
      <section className="bg-surface-container-low rounded-2xl p-8 space-y-6 border border-outline-variant/10">
        <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-secondary" /> {t('profile.personal.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">{t('profile.personal.name')}</label>
            {isEditing
              ? <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              : <p className={readCls}>{name || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">{t('profile.personal.age')}</label>
            {isEditing
              ? <input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Your age" />
              : <p className={readCls}>{age || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1"><Phone className="w-3 h-3" /> {t('profile.personal.phone')}</label>
            {isEditing
              ? <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" />
              : <p className={readCls}>{phone || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1"><Linkedin className="w-3 h-3" /> {t('profile.personal.linkedin')}</label>
            {isEditing
              ? <input className={inputCls} value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/yourprofile" />
              : <p className={readCls}>{linkedinUrl || '—'}</p>}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="bg-surface-container-low rounded-2xl p-8 space-y-5 border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-secondary" /> {t('profile.education.title')}
          </h3>
          {isEditing && (
            <button onClick={() => setAddingEdu(true)} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> {t('profile.actions.add')}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-surface-container-lowest rounded-xl flex items-start gap-4 border border-outline-variant/10">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="text-secondary w-5 h-5" />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-on-surface">{edu.degree}</p>
                <p className="text-sm text-on-surface-variant">{edu.school}</p>
                <p className="text-xs text-outline mt-1 italic">{t('profile.education.class_of', { year: edu.year })}</p>
              </div>
              {isEditing && (
                <button onClick={() => removeEducation(idx)} className="text-outline hover:text-error p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {education.length === 0 && <p className="text-sm text-outline italic px-1">{t('profile.education.no_entries')}</p>}
        </div>
        {isEditing && addingEdu && (
          <div className="p-5 bg-surface-container-lowest rounded-2xl border border-primary/20 space-y-3">
            <p className="text-sm font-bold text-primary">Add Education</p>
            <input className={inputCls} placeholder="Degree (e.g. B.Tech Computer Science)" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} />
            <input className={inputCls} placeholder="Institution (e.g. IIT Bombay)" value={newEdu.school} onChange={e => setNewEdu({ ...newEdu, school: e.target.value })} />
            <input className={inputCls} placeholder="Year of graduation" value={newEdu.year} onChange={e => setNewEdu({ ...newEdu, year: e.target.value })} />
            <div className="flex gap-2 pt-1">
              <button onClick={addEducation} className="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold">Add</button>
              <button onClick={() => setAddingEdu(false)} className="px-5 py-2 bg-surface-container text-on-surface-variant rounded-xl text-sm font-bold">Cancel</button>
            </div>
          </div>
        )}
      </section>

      {/* Courses & Certifications */}
      <section className="bg-surface-container-low rounded-2xl p-8 space-y-5 border border-outline-variant/10">
        <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
          <Award className="w-6 h-6 text-secondary" /> {t('profile.courses.title')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {specialisedCourses.map((course, idx) => (
            <div key={idx} className="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed-variant rounded-xl text-sm font-bold flex items-center gap-2">
              {course}
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              {isEditing && (
                <button onClick={() => removeCourse(idx)} className="text-outline hover:text-error ml-1">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder={t('profile.courses.placeholder')}
              value={newCourse}
              onChange={e => setNewCourse(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCourse()}
            />
            <button onClick={addCourse} className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-bold text-sm hover:opacity-90">{t('profile.actions.add')}</button>
          </div>
        )}
      </section>

      {/* Career Preferences */}
      <section className="bg-surface-container-low rounded-2xl p-8 space-y-5 border border-outline-variant/10">
        <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-secondary" /> {t('profile.career.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">{t('profile.career.role')}</label>
            {isEditing
              ? <input className={inputCls} value={prefs.targetRole} onChange={e => setPrefs({ ...prefs, targetRole: e.target.value })} placeholder="e.g. Operations Manager" />
              : <p className={readCls}>{prefs.targetRole || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1"><MapPin className="w-3 h-3" /> {t('profile.career.locations')}</label>
            {isEditing
              ? <input className={inputCls} value={prefs.preferredLocations} onChange={e => setPrefs({ ...prefs, preferredLocations: e.target.value })} placeholder="e.g. Bangalore, Remote" />
              : <p className={readCls}>{prefs.preferredLocations || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline">{t('profile.career.mode')}</label>
            {isEditing ? (
              <select className={inputCls} value={prefs.workMode} onChange={e => setPrefs({ ...prefs, workMode: e.target.value })}>
                <option>Hybrid</option>
                <option>Remote</option>
                <option>On-site</option>
              </select>
            ) : <p className={readCls}>{prefs.workMode || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {t('profile.career.salary')}</label>
            {isEditing
              ? <input className={inputCls} value={prefs.expectedSalary} onChange={e => setPrefs({ ...prefs, expectedSalary: e.target.value })} placeholder="e.g. ₹15L - ₹20L" />
              : <p className={readCls}>{prefs.expectedSalary || '—'}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1"><Clock className="w-3 h-3" /> {t('profile.career.notice')}</label>
            {isEditing ? (
              <select className={inputCls} value={prefs.noticePeriod} onChange={e => setPrefs({ ...prefs, noticePeriod: e.target.value })}>
                <option>Immediate</option>
                <option>15 Days</option>
                <option>1 Month</option>
                <option>2 Months</option>
                <option>3 Months</option>
              </select>
            ) : <p className={readCls}>{prefs.noticePeriod || '—'}</p>}
          </div>
        </div>
      </section>
      {/* Search History */}
      {/* Profile Celebration Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="bg-white rounded-full p-12 shadow-[0_0_100px_rgba(235,220,255,1)] flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 1 }}
                className="w-24 h-24 bg-secondary text-white rounded-3xl flex items-center justify-center mb-6"
              >
                <Trophy className="w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-headline font-extrabold text-primary text-center">
                {t('profile.readiness.celebration_title')}<br/>
                <span className="text-secondary text-lg font-bold uppercase tracking-widest mt-2 block">{t('profile.readiness.celebration_subtitle')}</span>
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Readiness & History */}
      <section className="bg-surface-container-low rounded-3xl p-10 border border-outline-variant/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-high" />
              <motion.circle
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={364.4}
                initial={{ strokeDashoffset: 364.4 }}
                animate={{ strokeDashoffset: 364.4 - (364.4 * (Number(user?.isProfileComplete ? 100 : 65)) / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-primary">{user?.isProfileComplete ? '100%' : '65%'}</span>
              <span className="text-[10px] uppercase font-bold text-outline">{t('profile.status.ready')}</span>
            </div>
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="font-headline font-bold text-2xl text-primary">{t('profile.readiness.title')}</h3>
            <p className="text-on-surface-variant max-w-sm">
              {user?.isProfileComplete 
                ? t('profile.readiness.complete_msg')
                : t('profile.readiness.incomplete_msg')}
            </p>
            {!user?.isProfileComplete && (
               <div className="flex items-center gap-2 justify-center md:justify-start">
                 <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold font-body">{t('profile.readiness.almost_ready')}</div>
                 <span className="text-xs text-outline font-medium">{t('profile.readiness.verify_next')}</span>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Search History */}
      <section className="bg-surface-container-low rounded-3xl p-8 space-y-6 border border-outline-variant/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2 relative z-10">
          <Search className="w-5 h-5 text-secondary" /> {t('profile.history.title')}
        </h3>
        <div className="space-y-4 relative z-10">
          {history.length > 0 ? (
            history.slice(0, 5).map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => onReSearch?.(item.skills, item.type as 'jobs' | 'courses')}
                className="w-full p-5 bg-surface-container-lowest rounded-2xl flex items-center justify-between border border-outline-variant/10 hover:border-primary/40 hover:shadow-md transition-all group text-left"
              >
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="flex items-center gap-2">
                     <div className={`p-1.5 rounded-lg ${item.type === 'jobs' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                       {item.type === 'jobs' ? <Briefcase className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{t('profile.history.analysis_label', { type: t(`nav.${item.type}`) })}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((skill: string, sIdx: number) => (
                      <span key={sIdx} className="px-2.5 py-0.5 bg-secondary-fixed/30 text-primary text-[10px] font-bold rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className="text-[10px] text-outline font-medium">{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>
              </button>
            ))
          ) : (
             <div className="py-12 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-3xl bg-surface-container-high flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-outline/40" />
               </div>
               <p className="text-sm text-on-surface-variant font-medium">{t('profile.history.no_history')}</p>
               <p className="text-xs text-outline mt-1">{t('profile.history.instruction')}</p>
             </div>
          )}
        </div>
      </section>

      {/* Assets & Logout */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary text-on-primary rounded-2xl p-8 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-xl flex items-center gap-2">
              <FileText className="w-5 h-5" /> {t('profile.assets.title')}
            </h3>
            <div className={`p-4 rounded-xl flex items-center justify-between ${user?.resumeUrl ? 'bg-white/20' : 'bg-white/10 opacity-50'}`}>
              <div className="flex items-center gap-3 truncate">
                <FileText className="w-5 h-5 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] opacity-70 uppercase font-bold tracking-wider">{t('profile.assets.resume_label')}</p>
                  <p className="text-sm font-bold truncate max-w-[150px]">{user?.resumeFileName || t('profile.assets.no_resume')}</p>
                </div>
              </div>
              {user?.resumeUrl && (
                <a 
                  href={user.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  title="Download Resume"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={handleResumeUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingResume}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {uploadingResume ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('resume.upload.uploading')}</>
              ) : (
                <><CloudUpload className="w-4 h-4" /> {t('profile.actions.update_resume')}</>
              )}
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 flex flex-col justify-between border border-outline-variant/10">
          <div>
            <h3 className="font-headline font-bold text-xl text-primary mb-4">{t('profile.account.title')}</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              {t('profile.account.message')}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 bg-error/10 text-error rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-error/20 transition-all border border-error/20"
          >
            <LogOut className="w-4 h-4" /> {t('profile.actions.logout')}
          </button>
        </div>
      </section>

      <p className="text-center text-[10px] text-outline uppercase tracking-widest">{t('common.footer')}</p>
    </main>
  );
};

export default ProfilePage;
