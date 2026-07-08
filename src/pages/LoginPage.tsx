import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

import { useTranslation } from 'react-i18next';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateSignup }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      onLogin(); 
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err: any) {
      console.error('Google Sign-In Error (Firebase Auth):', err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-surface overflow-hidden">
      {/* Right side - Visual & Branding (Flipped for variety) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary items-center justify-center overflow-hidden order-last">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Professional Woman" 
            className="w-full h-full object-cover opacity-60" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAobEykExJAd_vBd_03EltGNdlxiY2ocszRLLBmqHUFPwhutzMUY91JOqxs7x8l1I8HIe-qzIs4IjVJt0JyizPX8rcnXpRsr6scWdUKwn4z-uDBzpfNT2qAiOePvFCl2yjDi77LnCsJOfl5muL1fDp6_QF0iIqUexdbaQv2HhXXq1y12mK0qH_lTq2UDfIXhga2F7Jp3wq3j0brIUJQUmVSI97Qid0pUaR4jigKw__XfFCrDrRYbs0IwaX4BDwSgJHgK_8tCs1zBAo" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center p-12 max-w-lg">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <Sparkles className="text-white w-10 h-10" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-headline font-bold text-white mb-6"
          >
            {t('auth.login.welcome')}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90 leading-relaxed"
          >
            {t('auth.login.welcome_desc')}
          </motion.p>
        </div>
      </div>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-container-lowest">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-2">{t('auth.login.title')}</h1>
            <p className="text-on-surface-variant font-medium">{t('auth.login.subtitle')}</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">{t('auth.login.email_label')}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                  <input 
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    placeholder="elena@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-secondary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">{t('auth.login.password_label')}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-secondary transition-colors" />
                  <input 
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-secondary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-secondary text-on-secondary font-bold rounded-2xl text-lg hover:shadow-xl hover:shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {t('auth.login.button')}
                <ArrowRight className="w-6 h-6" />
              </button>
            </form>

            <div className="flex items-center gap-4">
              <div className="flex-grow h-px bg-outline-variant/30"></div>
              <span className="text-outline-variant text-xs font-bold uppercase tracking-widest">{t('auth.login.or')}</span>
              <div className="flex-grow h-px bg-outline-variant/30"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-surface-container-high border border-outline-variant rounded-2xl flex items-center justify-center gap-3 hover:bg-surface-container-highest transition-all font-bold text-on-surface shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('auth.login.google')}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-on-surface-variant font-medium">
              {t('auth.login.no_account')} {' '}
              <button 
                onClick={onNavigateSignup}
                className="text-secondary font-bold hover:underline"
              >
                {t('auth.login.sign_up')}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
