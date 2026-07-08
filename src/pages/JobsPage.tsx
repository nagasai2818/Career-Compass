import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, CreditCard, Bookmark, Sparkles, User, 
  ExternalLink, Loader2, X, ChevronDown, Check, Briefcase, Clock
} from 'lucide-react';
import { Job, User as UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { generateJobsBySkills } from '../services/aiService';
import { useTranslation } from 'react-i18next';

interface JobsPageProps {
  jobs: Job[];
  filteredIds?: string[] | null;
  selectedSkills?: string[];
  userAge?: string;
  user?: UserType | null;
}

const JobsPage: React.FC<JobsPageProps> = ({ jobs, filteredIds, selectedSkills, userAge, user }) => {
  const { t } = useTranslation();
  const [dynamicJobs, setDynamicJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCommitment, setSelectedCommitment] = useState<string | null>(null);

  let displayJobs = filteredIds && filteredIds.length > 0
    ? jobs.filter(j => filteredIds.includes(j.id))
    : (user?.resumeUrl && user.resumeUrl.trim() !== '' ? [...jobs] : []); 

  if (selectedSkills && selectedSkills.length > 0) {
    displayJobs = displayJobs.filter(job => 
      selectedSkills.some(skill => 
        job.title.toLowerCase().includes(skill.toLowerCase()) || 
        job.description.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  // Apply Search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    displayJobs = displayJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  }

  // Apply Local Filters
  if (selectedType) {
    displayJobs = displayJobs.filter(job => job.type === selectedType);
  }
  if (selectedCommitment) {
    displayJobs = displayJobs.filter(job => job.commitment === selectedCommitment);
  }

  useEffect(() => {
    let active = true;
    if (displayJobs.length === 0 && selectedSkills && selectedSkills.length > 0) {
      const cacheKey = 'dynamicJobs_' + selectedSkills.join('_');
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
         setDynamicJobs(JSON.parse(cached));
      } else {
        setLoading(true);
        generateJobsBySkills(user ?? null, selectedSkills).then(GenJobs => {
          if (active) {
            setDynamicJobs(GenJobs);
            sessionStorage.setItem(cacheKey, JSON.stringify(GenJobs));
            setLoading(false);
          }
        });
      }
    }
    return () => { active = false; };
  }, [selectedSkills, user]);

  if (dynamicJobs.length > 0) {
    // Only apply dynamic jobs if we are still in a "filtered" state (skill matches)
    // and hasn't been further limited by search/filters to 0
    if (selectedSkills && selectedSkills.length > 0 && searchQuery === '' && !selectedType && !selectedCommitment) {
        displayJobs = dynamicJobs;
    }
  }

  const parsedAge = userAge ? parseInt(userAge, 10) : 0;
  if (parsedAge > 35) {
     displayJobs.sort((a, b) => {
        const aIsSenior = a.title.toLowerCase().match(/lead|senior|manager|director/);
        const bIsSenior = b.title.toLowerCase().match(/lead|senior|manager|director/);
        if (aIsSenior && !bIsSenior) return -1;
        if (!aIsSenior && bIsSenior) return 1;
        return 0;
     });
  }

  const isFiltered = (!!filteredIds && filteredIds.length > 0) || (!!selectedSkills && selectedSkills.length > 0) || searchQuery !== '' || !!selectedType || !!selectedCommitment;

  const handleApply = (job: Job) => {
    let url = job.applyUrl || "";
    if (!url || url === "#" || url === "https://example.com") {
      url = `https://www.google.com/search?q=${encodeURIComponent(`${job.title} jobs at ${job.company} India`)}`;
    }
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedCommitment(null);
    setSearchQuery('');
  };

  return (
    <main className="max-w-5xl mx-auto px-6 pt-8 pb-28">
      <section className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 tracking-tight">
          {isFiltered ? t('jobs.header.title_filtered') : t('jobs.header.title_all')}
        </h1>
        {isFiltered ? (
          <div className="flex items-center gap-2 bg-primary-fixed/30 text-primary px-4 py-2 rounded-full w-fit mb-4">
            <Sparkles className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">{t('jobs.header.badge')}</span>
          </div>
        ) : null}
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          {t('jobs.header.subtitle')}
        </p>
      </section>

      <div className="bg-surface-container-low rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm border border-outline-variant/30 relative z-40">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary outline-none text-on-surface"
            placeholder={t('jobs.search.placeholder')}
            type="text"
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
          className={`px-6 py-3 font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm border ${
            showFilters || selectedType || selectedCommitment 
              ? 'bg-primary text-on-primary border-primary' 
              : 'bg-surface-container-lowest text-primary border-outline-variant/50 hover:bg-white'
          }`}
        >
          <Filter className="w-5 h-5" />
          {t('jobs.search.filters')}
          {(selectedType || selectedCommitment) && <span className="w-2 h-2 bg-secondary rounded-full ml-1"></span>}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 z-50 overflow-hidden"
            >
              {/* Job Type Filter */}
              <div>
                <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {t('jobs.filter.type')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['On-site', 'Remote', 'Hybrid'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? null : type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedType === type 
                          ? 'bg-primary text-on-primary border-primary' 
                          : 'bg-surface-container-low text-on-surface border-transparent hover:border-primary/30'
                      }`}
                    >
                      {t(`jobs.filter.${type.toLowerCase().replace('-', '')}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commitment Filter */}
              <div>
                <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t('jobs.filter.commitment')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Full-time', 'Part-time', 'Internship'].map(comm => (
                    <button
                      key={comm}
                      onClick={() => setSelectedCommitment(selectedCommitment === comm ? null : comm)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedCommitment === comm 
                          ? 'bg-primary text-on-primary border-primary' 
                          : 'bg-surface-container-low text-on-surface border-transparent hover:border-primary/30'
                      }`}
                    >
                      {t(`jobs.filter.${comm.toLowerCase().replace('-', '')}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <button 
                  onClick={clearFilters}
                  className="text-sm font-bold text-outline hover:text-error transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> {t('jobs.filter.clear')}
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 shadow-sm"
                >
                  {t('jobs.filter.apply')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-0">
        {/* Jobs Grid */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {displayJobs.length === 0 && loading ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-7 rounded-2xl border border-outline-variant/10 animate-pulse flex flex-col gap-4 h-[320px]">
                <div className="w-24 h-5 bg-surface-container-highest rounded-full"></div>
                <div className="w-3/4 h-8 bg-surface-container-highest rounded-lg"></div>
                <div className="w-1/2 h-5 bg-surface-container-highest rounded-lg"></div>
                <div className="space-y-2 mt-4">
                  <div className="w-full h-4 bg-surface-container-highest rounded-lg"></div>
                  <div className="w-full h-4 bg-surface-container-highest rounded-lg"></div>
                  <div className="w-2/3 h-4 bg-surface-container-highest rounded-lg"></div>
                </div>
                <div className="mt-auto pt-6 border-t border-outline-variant/10 flex flex-col gap-2">
                   <div className="w-full h-12 bg-surface-container-highest rounded-xl"></div>
                   <div className="w-full h-4 bg-surface-container-highest rounded-lg mt-2 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          displayJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <div className="bg-white p-7 rounded-[2rem] border border-outline-variant/20 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full relative z-10 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4 relative z-20">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                    <Sparkles className="w-3 h-3 fill-current" />
                    {isFiltered ? t('jobs.card.ai_match') : t('jobs.card.match')}
                  </div>
                  {job.matchScore && (
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-tight border ${
                      job.matchScore >= 90
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : job.matchScore >= 75
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                    }`}>
                      {t('jobs.card.match_score', { score: job.matchScore })}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-primary mb-1 group-hover:text-primary/80 transition-colors">{job.title}</h3>
                <p className="text-on-surface-variant font-semibold mb-4 text-sm">{job.company}</p>
                <div className="text-outline text-xs space-y-2 mb-4">
                  <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> {job.salary}</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed line-clamp-3 flex-1">
                  {job.description}
                </p>
                <div className="pt-5 border-t border-outline-variant/10 space-y-3">
                  <motion.button
                    onClick={() => handleApply(job)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {t('jobs.card.apply')} <ExternalLink className="w-4 h-4" />
                  </motion.button>
                  <button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${job.title} at ${job.company} India`)}`, '_blank')}
                    className="w-full py-2 text-primary font-bold text-sm hover:underline flex items-center justify-center gap-1 opacity-70 hover:opacity-100"
                  >
                    {t('jobs.card.details')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {displayJobs.length === 0 && !loading && (
          <div className="col-span-3 text-center py-20">
            <div className="w-24 h-24 mx-auto bg-surface-container rounded-3xl flex items-center justify-center mb-6">
              <Briefcase className="w-12 h-12 text-outline/40" />
            </div>
            <p className="text-xl font-semibold text-on-surface-variant mb-2">{t('jobs.empty.title')}</p>
            <p className="text-sm text-outline">{t('jobs.empty.instruction')}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default JobsPage;
