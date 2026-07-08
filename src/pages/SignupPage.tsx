import React, { useState } from 'react';
import { User, Mail, Lock, Calendar, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

interface SignupPageProps {
  onSignup: (user: UserType) => void;
  onNavigateLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigateLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.signup.errors.passwords_mismatch'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // Create initial profile in Supabase using Firebase UID
      const { error: dbError } = await supabase
        .from('profiles')
        .insert({
          id: user.uid,
          name: formData.name,
          age: formData.age
        });

      if (dbError) throw dbError;

      onSignup({
        name: formData.name,
        age: formData.age,
        email: formData.email,
        isProfileComplete: false
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Check if profile exists in Supabase
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Supabase Profile Fetch Error:', fetchError);
        throw new Error(`Supabase Fetch Error: ${fetchError.message}`);
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.uid,
            name: user.displayName || 'Google User',
            email: user.email
          });
        
        if (insertError) {
          console.error('Supabase Profile Create Error:', insertError);
          throw new Error(`Supabase Create Error: ${insertError.message}`);
        }
      }

      onSignup({
        name: user.displayName || 'Google User',
        age: '',
        email: user.email || '',
        isProfileComplete: false
      });
    } catch (err: any) {
      console.error('Google Auth/Sync Error:', err);
      setError(err.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-surface overflow-hidden">
      {/* Left side - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Empowered Woman" 
            className="w-full h-full object-cover opacity-60" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoPGTlbmLbsF6N_6RFgHAF44fAOPAUCry1tPMis_fgIdN0fGsGYlInofPUvvjdMnSZofLIAN8SiBpO5SQvteF3xHTBgyqEVoMLrvU7LXRLT6WhZMm6VeQoKJHIpWXuE6IRpXN7qHnk4XO30iQnh-ONx1jPE-oDYh4uAiPi4Cz8a1Osm3E7hco3AFUIMa5d7gE4EWdN-eJsi-LSggtadf26sy62fcawUPliGRHa_zZ2qCFlaxJWc95sICCIJz07yklq_BHm6Tskkyc" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center p-12 max-w-lg">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <Zap className="text-white w-10 h-10" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-headline font-bold text-white mb-6"
          >
            {t('auth.signup.welcome')}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/90 leading-relaxed"
          >
            {t('auth.signup.welcome_desc')}
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-container-lowest overflow-y-auto">
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md space-y-6 py-12"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-2">{t('auth.signup.title')}</h1>
            <p className="text-on-surface-variant font-medium">{t('auth.signup.subtitle')}</p>
          </div>

          <div className="space-y-4">
            {error && (
              <p className="text-error text-sm font-bold text-center p-3 bg-error-container rounded-xl">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">{t('auth.signup.full_name_label')}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="Elena Rodriguez"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Age</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input 
                      required
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      type="number" 
                      placeholder="35"
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">{t('auth.signup.email_label')}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input 
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email" 
                      placeholder="elena@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">{t('auth.signup.password_label')}</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-outline px-1">Re-enter Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-transparent rounded-2xl focus:border-primary-fixed focus:bg-surface transition-all outline-none text-on-surface font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl text-lg hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t('auth.signup.button')} <ArrowRight className="w-6 h-6" /></>}
              </button>
            </form>

            <div className="flex items-center gap-4">
              <div className="flex-grow h-px bg-outline-variant/30"></div>
              <span className="text-outline-variant text-xs font-bold uppercase tracking-widest">{t('auth.login.or')}</span>
              <div className="flex-grow h-px bg-outline-variant/30"></div>
            </div>

            <button 
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-4 px-6 bg-surface-container-high border border-outline-variant rounded-2xl flex items-center justify-center gap-3 hover:bg-surface-container-highest transition-all font-bold text-on-surface shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <div className="text-center pt-4">
              <p className="text-on-surface-variant font-medium">
                {t('auth.signup.have_account')} {' '}
                <button 
                  onClick={onNavigateLogin}
                  className="text-primary font-bold hover:underline"
                >
                  {t('auth.signup.login')}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
