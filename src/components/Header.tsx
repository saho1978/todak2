import React from 'react';
import { Bookmark, Moon, Sun, HeartHandshake, Bell } from 'lucide-react';

interface HeaderProps {
  currentTab: 'chat' | 'analysis' | 'relax';
  setCurrentTab: (tab: 'chat' | 'analysis' | 'relax') => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenReminderModal: () => void;
  isReminderEnabled: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  savedCount,
  onOpenSavedModal,
  onOpenReminderModal,
  isReminderEnabled,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentTab('chat')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                토닥토닥
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                지친 직장인 야간 상담소
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentTab('chat')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'chat'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            고민 상담소
          </button>
          <button
            onClick={() => setCurrentTab('analysis')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'analysis'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            감정 분석 & 위로 처방
          </button>
          <button
            onClick={() => setCurrentTab('relax')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'relax'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            마음 쉼표
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Saved quotes, Reminder Bell, Theme toggle) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSavedModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="위로 보관함 보기"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">위로 보관함</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenReminderModal}
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="저녁 감정 기록 알림 설정"
            aria-label="저녁 알림 설정"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {isReminderEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="화면 모드 전환"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
