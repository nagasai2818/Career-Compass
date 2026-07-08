import React from 'react';
import { ArrowLeft, Zap, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

interface TopAppBarProps {
  onBack?: () => void;
  title?: string;
  showBack?: boolean;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ onBack, title, showBack = false }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm shadow-primary/5">
      <div className="flex justify-between items-center px-5 py-3.5 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack ? (
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-on-surface-variant hover:bg-surface-container-low p-2.5 rounded-xl transition-colors border border-outline-variant/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Zap className="text-on-primary w-5 h-5 fill-current" />
            </div>
          )}
          <span className="text-primary font-headline font-extrabold tracking-tight text-xl">
            {title || t('common.appName')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={toggleLanguage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-container-low transition-colors text-primary font-bold text-sm border border-outline-variant/20"
          >
            <Languages className="w-4 h-4" />
            <span className="text-xs font-black tracking-wider">{i18n.language === 'en' ? 'हिं' : 'EN'}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
