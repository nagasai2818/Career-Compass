import React from 'react';
import { Home, BookOpen, Briefcase, User, GraduationCap } from 'lucide-react';
import { Screen } from '../types';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

interface BottomNavBarProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
}

const navItems = [
  { screen: 'insights' as Screen, icon: Home, labelKey: 'nav.home' },
  { screen: 'resume' as Screen, icon: BookOpen, labelKey: 'nav.learning' },
  { screen: 'jobs' as Screen, icon: Briefcase, labelKey: 'nav.jobs' },
  { screen: 'courses' as Screen, icon: GraduationCap, labelKey: 'nav.courses' },
  { screen: 'profile' as Screen, icon: User, labelKey: 'nav.profile' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, setScreen }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50 px-0">
      {/* Blurred backdrop bar */}
      <div className="w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-8px_32px_rgba(0,70,74,0.08)]">
        <nav className="flex justify-around items-center px-2 py-1.5 max-w-lg mx-auto">
          {navItems.map(({ screen, icon: Icon, labelKey }) => {
            const isActive = currentScreen === screen;
            return (
              <button
                key={screen}
                onClick={() => setScreen(screen)}
                className="relative flex flex-col items-center justify-center w-16 h-14 transition-all rounded-2xl group focus:outline-none"
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-x-1 top-1 bottom-1 bg-primary/10 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative z-10 flex flex-col items-center gap-0.5"
                >
                  <Icon
                    className={`w-5 h-5 transition-all ${
                      isActive
                        ? 'text-primary stroke-[2.5px]'
                        : 'text-on-surface-variant group-hover:text-primary/70'
                    }`}
                  />
                  <span
                    className={`font-body text-[9px] font-bold tracking-wide uppercase transition-all ${
                      isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary/70'
                    }`}
                  >
                    {t(labelKey)}
                  </span>
                </motion.div>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
        {/* Safe area padding for mobile */}
        <div className="h-safe-area-inset-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  );
};

export default BottomNavBar;
