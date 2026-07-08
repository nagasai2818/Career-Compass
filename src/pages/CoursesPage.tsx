import React, { useState } from 'react';
import { 
  ArrowRight, BookOpen, GraduationCap, Search, Filter, 
  Sparkles, ExternalLink, Trophy, X, ChevronDown, Check, 
  TrendingUp, BarChart, Award
} from 'lucide-react';
import { Course } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface CoursesPageProps {
  courses: Course[];
  filteredIds?: string[] | null;
  selectedSkills?: string[];
  userAge?: string;
  user?: CourseUser | null;
  loading?: boolean;
}

// Added local interface to avoid circular or missing type issues if not exported
interface CourseUser {
  resumeUrl?: string;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ courses, filteredIds, selectedSkills, userAge, user, loading }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  let displayCourses = filteredIds && filteredIds.length > 0
    ? courses.filter(c => filteredIds.includes(c.id))
    : (user?.resumeUrl && user.resumeUrl.trim() !== '' ? [...courses] : []);

  if (selectedSkills && selectedSkills.length > 0) {
    displayCourses = displayCourses.filter(course => 
      selectedSkills.some(skill => 
        course.title.toLowerCase().includes(skill.toLowerCase()) || 
        course.provider.toLowerCase().includes(skill.toLowerCase()) || 
        course.tag.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  // Apply Search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    displayCourses = displayCourses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.provider.toLowerCase().includes(query) ||
      course.tag.toLowerCase().includes(query)
    );
  }

  // Apply Difficulty Level Filter
  if (selectedLevel) {
    displayCourses = displayCourses.filter(course => course.level === selectedLevel);
  }

  const isFiltered = (!!filteredIds && filteredIds.length > 0) || (!!selectedSkills && selectedSkills.length > 0) || searchQuery !== '' || !!selectedLevel;

  const handleEnroll = (course: Course) => {
    let url = course.url || "";
    if (!url || url === "#" || url === "https://example.com") {
      url = `https://www.google.com/search?q=${encodeURIComponent(`${course.title} course by ${course.provider} enroll`)}`;
    }
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSelectedLevel(null);
    setSearchQuery('');
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 mb-24">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-secondary font-semibold tracking-wider uppercase text-xs mb-2 block">
              {isFiltered ? t('courses.path.filtered') : t('courses.path.default')}
            </span>
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary tracking-tight">
              {isFiltered ? t('courses.header.title_filtered') : t('courses.header.title_all')}
            </h1>
            {isFiltered && (
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mt-4">
                <Sparkles className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">{t('courses.header.badge')}</span>
              </div>
            )}
            <p className="text-on-surface-variant mt-4 max-w-2xl text-lg leading-relaxed font-body">
              {t('courses.header.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-40">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder={t('courses.search.placeholder')}
                className="bg-surface-container-low border-none rounded-xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary w-full outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all border shadow-sm ${
                showFilters || selectedLevel
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-low text-primary border-outline-variant/30 hover:bg-white'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 bg-white border border-outline-variant/50 rounded-2xl shadow-2xl p-6 min-w-[300px] z-50"
                >
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                      <BarChart className="w-4 h-4" /> {t('courses.filter.level')}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            selectedLevel === lvl 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
                          }`}
                        >
                          {t(`courses.filter.${lvl.toLowerCase()}`)}
                          {selectedLevel === lvl && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center gap-4">
                    <button 
                      onClick={clearFilters}
                      className="text-xs font-bold text-outline hover:text-error transition-colors"
                    >
                      {t('courses.filter.clear')}
                    </button>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-xs shadow-sm"
                    >
                      {t('courses.filter.apply')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-surface-container-low rounded-2xl overflow-hidden animate-pulse border border-outline-variant/10 flex flex-col h-[350px]">
                <div className="p-4 bg-surface-container-high h-8 w-24 m-4 rounded-full"></div>
                <div className="p-7 space-y-4">
                  <div className="h-4 w-20 bg-surface-container-high rounded"></div>
                  <div className="h-8 w-full bg-surface-container-high rounded-lg"></div>
                  <div className="h-20 w-full bg-surface-container-high rounded-xl"></div>
                  <div className="mt-auto pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                    <div className="h-4 w-20 bg-surface-container-high rounded"></div>
                    <div className="h-10 w-24 bg-surface-container-high rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <p className="text-xl font-semibold mb-2">{t('courses.empty.title')}</p>
            <p className="text-sm">{t('courses.empty.instruction')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-[2rem] overflow-hidden group border border-outline-variant/20 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="p-4 flex gap-2 border-b border-outline-variant/10 bg-surface-container-low relative z-10">
                  <span className={`${course.tagColor} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                    {course.tag}
                  </span>
                  {isFiltered && (
                    <span className="bg-secondary text-white px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {t('courses.card.ai_match')}
                    </span>
                  )}
                </div>
                <div className="p-7 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-secondary fill-current" />
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{t('courses.card.ai_match')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-outline" />
                    <span className="text-xs font-bold text-outline uppercase tracking-widest">{course.provider}</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl text-primary mb-4 leading-snug group-hover:text-primary-fixed-dim transition-colors">
                    {course.title}
                  </h3>

                  {/* AI Match Insight */}
                  {course.matchReason && (
                    <div className="mb-4 p-3 bg-secondary/5 rounded-xl border border-secondary/10 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <p className="text-xs text-on-surface-variant font-medium leading-tight">
                        <span className="font-bold text-secondary mr-1">{t('courses.insight')}</span>
                        {course.matchReason}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-outline-variant/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-on-surface-variant font-medium text-xs">
                      <BookOpen className="w-4 h-4" />
                      Self-paced
                    </div>
                    <button
                      onClick={() => handleEnroll(course)}
                      className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:translate-x-1 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {t('courses.card.enroll')} <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* AI Advisor CTA */}
      <section className="bg-primary rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <h3 className="font-headline font-extrabold text-3xl text-primary-fixed leading-tight">
            {t('courses.guidance.title')}
          </h3>
          <p className="text-primary-fixed/80 font-body text-lg">
            {t('courses.guidance.subtitle')}
          </p>
        </div>
        <div className="hidden lg:block w-1/3">
          <div className="bg-primary-container/20 aspect-square rounded-full flex items-center justify-center border-2 border-white/10">
            <GraduationCap className="text-primary-fixed w-24 h-24 stroke-[1.5]" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default CoursesPage;
