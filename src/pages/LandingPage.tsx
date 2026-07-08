import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, CheckCircle2, Sparkles, ShieldCheck, Briefcase, BookOpen, Users, TrendingUp, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation, Trans } from 'react-i18next';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Operations Lead",
    company: "Infosys",
    break_: "5 year career break",
    quote: "After 5 years raising my daughters, I thought my skills had expired. The Sanctuary showed me that my management experience was still incredibly valuable. I landed a senior role within 3 months.",
    avatar: "https://i.pravatar.cc/150?u=priya_sharma",
    rating: 5
  },
  {
    name: "Kavitha Reddy",
    role: "Product Manager",
    company: "Zoho",
    break_: "3 year career break",
    quote: "The AI-powered resume analysis was eye-opening. It helped me articulate skills I gained during my break—project management from home renovations, negotiation from volunteer work. Truly transformative.",
    avatar: "https://i.pravatar.cc/150?u=kavitha_reddy",
    rating: 5
  },
  {
    name: "Ananya Krishnan",
    role: "HR Business Partner",
    company: "Tata Group",
    break_: "4 year career break",
    quote: "I was nervous about re-entering after 4 years. The returnship programs The Sanctuary found for me gave me the structured support I needed. Now I'm leading a team of 15 at Tata.",
    avatar: "https://i.pravatar.cc/150?u=ananya_k",
    rating: 5
  }
];

const stats = [
  { value: "5,000+", label: "Women Helped" },
  { value: "89%", label: "Placement Rate" },
  { value: "120+", label: "Partner Companies" },
  { value: "₹18L", label: "Avg. Salary Return" }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const { t } = useTranslation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToTestimonial = (idx: number) => {
    setActiveTestimonial(idx);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="flex-grow flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Empowered professional woman"
            className="w-full h-full object-cover object-center scale-105"
            src="/hero-woman.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/60 to-primary/10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 right-[10%] w-32 h-32 rounded-full bg-primary-fixed/10 blur-2xl hidden md:block" />
        <div className="absolute bottom-32 right-[20%] w-20 h-20 rounded-full bg-secondary/10 blur-xl hidden md:block" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-24 pb-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="text-primary w-7 h-7 fill-current" />
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tight text-white">{t('common.appName')}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-headline font-extrabold text-5xl md:text-7xl text-white leading-[1.05] mb-6"
            >
              {t('landing.hero.title_main')} <br />
              <span className="text-primary-fixed italic">{t('landing.hero.title_accent')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-body text-xl md:text-2xl text-white/90 leading-relaxed mb-10 max-w-xl"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onStart}
                className="px-10 py-5 bg-primary-fixed text-on-primary-fixed font-headline font-extrabold text-xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 group"
              >
                {t('landing.hero.get_started')}
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={onLogin}
                className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-headline font-bold text-xl rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center"
              >
                {t('landing.hero.sign_in')}
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-14 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-primary-fixed/60 shadow-md"
                    src={`https://i.pravatar.cc/150?u=sanctuary${i}`}
                    alt="User avatar"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/80 text-sm font-medium">
                  <Trans i18nKey="landing.hero.stats">
                    <span className="text-primary-fixed font-bold">5,000+ women</span> reclaiming their careers today
                  </Trans>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll Down</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"></div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary text-white py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24" />
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-headline font-black text-3xl md:text-4xl text-primary-fixed mb-1">{stat.value}</p>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 bg-surface-container-low/50 border-y border-outline-variant/10 text-center">
        <p className="text-xs font-bold text-outline uppercase tracking-[0.3em] mb-8">{t('landing.trust.text')}</p>
        <div className="flex flex-wrap justify-center gap-10 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {['RELIANCE', 'ZOHO', 'TATA', 'INFOSYS', 'WIPRO', 'HCL'].map(company => (
            <div key={company} className="font-headline font-black text-2xl">{company}</div>
          ))}
        </div>
      </section>

      {/* The Gap is Not a stop section */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial-primary opacity-50" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000"
                alt="Supportive workplace"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-8 left-8 p-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl max-w-xs"
              >
                <Quote className="w-5 h-5 text-primary/40 mb-2" />
                <p className="text-primary font-bold text-base mb-2">"My break gave me perspective."</p>
                <p className="text-on-surface-variant text-xs flex items-center gap-2">
                  <span className="w-4 h-px bg-primary/30" />
                  Priya S., Returned after 5 Years
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t('landing.reframing.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-primary leading-tight">
              <Trans i18nKey="landing.reframing.title">
                A Career Break Isn't a <span className="text-secondary italic">Step Back</span>.
              </Trans>
            </h2>
            <div className="text-xl text-on-surface-variant leading-relaxed">
              <Trans i18nKey="landing.reframing.description">
                Whether you took time for family, education, or personal growth, your skills didn't disappear. You gained emotional intelligence, resilience, and perspective.
                <br /><br />
                <strong>The Sanctuary</strong> uses Gemini AI to help you translate these life experiences into professional strengths that top Indian companies are actively looking for.
              </Trans>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="text-4xl font-headline font-black text-primary">85%</h4>
                <p className="text-sm text-outline font-medium uppercase tracking-wider mt-1">{t('landing.reframing.intent')}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-4xl font-headline font-black text-secondary">2.4x</h4>
                <p className="text-sm text-outline font-medium uppercase tracking-wider mt-1">{t('landing.reframing.retention')}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section className="py-24 md:py-32 bg-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-6">{t('landing.features.title')}</h2>
            <p className="text-xl text-on-surface-variant">{t('landing.features.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-primary" />,
                color: "bg-primary-fixed",
                title: t('landing.features.resume.title'),
                desc: t('landing.features.resume.desc'),
                delay: 0
              },
              {
                icon: <Briefcase className="w-8 h-8 text-on-primary-fixed" />,
                color: "bg-secondary-fixed",
                title: t('landing.features.returnship.title'),
                desc: t('landing.features.returnship.desc'),
                delay: 0.1
              },
              {
                icon: <BookOpen className="w-8 h-8 text-on-tertiary-fixed" />,
                color: "bg-tertiary-fixed",
                title: t('landing.features.bridge.title'),
                desc: t('landing.features.bridge.desc'),
                delay: 0.2
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -6 }}
                className="p-10 glass-panel bg-white/90 rounded-[2.5rem] border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500 group card-hover-glow"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-surface-container-low relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/5 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-48 translate-y-48 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span>Real Stories. Real Impact.</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary">Women Who Made It Back</h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-outline-variant/10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute top-8 right-8 text-primary-fixed/40">
                  <Quote className="w-16 h-16" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="flex flex-col items-center md:items-start gap-3 shrink-0">
                    <div className="relative">
                      <img
                        src={testimonials[activeTestimonial].avatar}
                        alt={testimonials[activeTestimonial].name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-md"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="font-bold text-primary">{testimonials[activeTestimonial].name}</p>
                      <p className="text-sm text-secondary font-medium">{testimonials[activeTestimonial].role}</p>
                      <p className="text-xs text-outline">{testimonials[activeTestimonial].company}</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      {testimonials[activeTestimonial].break_}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xl md:text-2xl text-on-surface leading-relaxed font-medium italic">
                      "{testimonials[activeTestimonial].quote}"
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => goToTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full bg-white border border-outline-variant/30 flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToTestimonial(i)}
                    className={`h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => goToTestimonial((activeTestimonial + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full bg-white border border-outline-variant/30 flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Age-Based Intelligence Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <TrendingUp className="w-full h-full rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-primary-fixed font-bold text-sm mb-8">
              <Users className="w-4 h-4" />
              <span>Age & Experience Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold mb-8 leading-tight">
              Tailored to <br /><span className="text-primary-fixed italic">Every Life Stage</span>
            </h2>
            <p className="text-xl text-white/80 leading-relaxed mb-12">
              Our matching engine doesn't just look at skills; it understands the Indian professional life-stage. Whether you're a mid-career professional re-entering after childcare, or a senior leader returning to the board, we match you with "age-appropriate" roles and communities.
            </p>
            <div className="space-y-5">
              {[
                "Returnship Programs for Long Gaps",
                "Senior Executive Tracks for 15+ years exp",
                "Upskilling paths for rapid reentry (20s - 30s)",
                "Peer Mentorship for Career Reinvention"
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-fixed/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary-fixed" />
                  </div>
                  <span className="font-bold text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-[450px] bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl"
          >
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <Sparkles className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary-fixed font-bold">AI Prediction</p>
                  <p className="font-bold text-lg">Perfect Fit for You</p>
                </div>
              </div>
              <div className="p-6 bg-white/10 rounded-2xl">
                <p className="text-sm text-primary-fixed-variant mb-2">Senior Role Match</p>
                <p className="font-bold text-xl mb-4">Operations Lead (Returnship)</p>
                <div className="flex items-center gap-2 mb-6">
                  <div className="px-2 py-1 bg-primary-fixed/20 rounded-md text-[10px] font-bold text-primary-fixed uppercase tracking-wider">Experience Aligned</div>
                  <div className="px-2 py-1 bg-secondary-fixed/20 rounded-md text-[10px] font-bold text-secondary-fixed uppercase tracking-wider">India Focused</div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed italic">
                  "Based on your 12 years of prior experience, this role values your leadership over the break duration."
                </p>
              </div>
              <button
                onClick={onStart}
                className="w-full py-4 bg-primary-fixed text-on-primary-fixed font-bold rounded-2xl text-primary hover:opacity-90 transition-all active:scale-95"
              >
                See Your Results
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-48 text-center bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-headline font-extrabold text-primary mb-8">{t('landing.cta.title')}</h2>
            <p className="text-xl md:text-2xl text-on-surface-variant mb-14 leading-relaxed">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                onClick={onStart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-6 bg-primary text-on-primary font-headline font-extrabold text-2xl rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
              >
                {t('landing.cta.button')}
                <ArrowRight className="w-7 h-7 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
            <div className="mt-12 text-outline font-medium flex items-center justify-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>{t('landing.cta.footer')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-surface-container-low border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="text-on-primary w-4 h-4 fill-current" />
            </div>
            <span className="font-headline font-black text-lg text-primary">{t('common.appName')}</span>
          </div>
          <p className="text-sm text-outline">{t('landing.footer.copyright')}</p>
          <div className="flex gap-8 text-sm font-bold text-primary opacity-60">
            <a href="#" className="hover:opacity-100 transition-opacity">{t('landing.footer.privacy')}</a>
            <a href="#" className="hover:opacity-100 transition-opacity">{t('landing.footer.terms')}</a>
            <a href="#" className="hover:opacity-100 transition-opacity">{t('landing.footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
