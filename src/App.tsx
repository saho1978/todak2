import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DailySolaceBanner } from './components/DailySolaceBanner';
import { ChatCounselor } from './components/ChatCounselor';
import { EmotionAnalyzer } from './components/EmotionAnalyzer';
import { MindfulnessZone } from './components/MindfulnessZone';
import { SavedQuotesModal } from './components/SavedQuotesModal';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { ReminderToast } from './components/ReminderToast';
import {
  ComfortQuote,
  EmotionAnalysisResult,
  SavedQuote,
  EmotionHistoryEntry,
  ReminderSettings,
} from './types';
import { getInitial30DayHistory, saveEmotionRecordToHistory } from './utils/emotionData';
import { showBrowserNotification } from './utils/notification';
import { Coffee } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'analysis' | 'relax'>('chat');
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistoryEntry[]>(() =>
    getInitial30DayHistory()
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('todak_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('todak_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('todak_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Saved Comfort Quotes in local storage
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    try {
      const stored = localStorage.getItem('todak_saved_quotes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Evening Reminder Settings in local storage
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    try {
      const stored = localStorage.getItem('todak_reminder_settings');
      return stored
        ? JSON.parse(stored)
        : {
            enabled: false,
            time: '20:00',
          };
    } catch {
      return { enabled: false, time: '20:00' };
    }
  });

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [inAppToastMessage, setInAppToastMessage] = useState<string | null>(null);

  const handleSaveReminderSettings = (newSettings: ReminderSettings) => {
    setReminderSettings(newSettings);
    localStorage.setItem('todak_reminder_settings', JSON.stringify(newSettings));
  };

  // Notification Scheduler Loop: checks every 30 seconds
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toDateString();

      // Check if it's past or at the scheduled time today and hasn't notified yet today
      if (
        currentTimeStr >= reminderSettings.time &&
        reminderSettings.lastNotifiedDate !== todayStr
      ) {
        const notifBody =
          '오늘 하루도 끝까지 버텨낸 당신, 정말 고생 많으셨어요. 잠시 들러 오늘의 마음 날씨를 기록해보세요.';

        // Fire browser notification
        showBrowserNotification('🌙 토닥토닥 저녁 마음 쉼표', {
          body: notifBody,
          tag: 'todak-evening-reminder',
        });

        // Fire in-app toast
        setInAppToastMessage(notifBody);

        // Update lastNotifiedDate
        const updated = {
          ...reminderSettings,
          lastNotifiedDate: todayStr,
        };
        setReminderSettings(updated);
        localStorage.setItem('todak_reminder_settings', JSON.stringify(updated));
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [reminderSettings]);

  // Cross-tab data sharing
  const [prefilledStoryForAnalysis, setPrefilledStoryForAnalysis] = useState('');
  const [activeEmotionContext, setActiveEmotionContext] =
    useState<EmotionAnalysisResult | null>(null);

  const handleSaveQuote = (item: ComfortQuote) => {
    if (savedQuotes.some((q) => q.quote === item.quote)) return;

    const newQuote: SavedQuote = {
      id: `quote-${Date.now()}`,
      quote: item.quote,
      category: item.category,
      reason: item.reason,
      savedAt: new Date().toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      }),
    };

    const updated = [newQuote, ...savedQuotes];
    setSavedQuotes(updated);
    localStorage.setItem('todak_saved_quotes', JSON.stringify(updated));
  };

  const handleRemoveQuote = (id: string) => {
    const updated = savedQuotes.filter((q) => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('todak_saved_quotes', JSON.stringify(updated));
  };

  const handleClearAllQuotes = () => {
    if (window.confirm('보관된 모든 위로 문구를 삭제하시겠습니까?')) {
      setSavedQuotes([]);
      localStorage.removeItem('todak_saved_quotes');
    }
  };

  const handleJumpToAnalysisWithStory = (storyText: string) => {
    setPrefilledStoryForAnalysis(storyText);
    setCurrentTab('analysis');
  };

  const handleContinueChatWithEmotion = (analysisResult: EmotionAnalysisResult) => {
    setActiveEmotionContext(analysisResult);
    setCurrentTab('chat');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        savedCount={savedQuotes.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        isReminderEnabled={reminderSettings.enabled}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Daily Solace Quote Banner */}
        <DailySolaceBanner />

        {/* Tab 1: 고민 상담소 (Gemini Multi-turn Chat) */}
        {currentTab === 'chat' && (
          <div className="space-y-4">
            <ChatCounselor
              onAnalyzeStory={handleJumpToAnalysisWithStory}
              activeEmotionContext={activeEmotionContext}
            />
          </div>
        )}

        {/* Tab 2: 감정 분석 & 위로 처방 */}
        {currentTab === 'analysis' && (
          <div className="space-y-4">
            <EmotionAnalyzer
              initialStory={prefilledStoryForAnalysis}
              onSaveQuote={handleSaveQuote}
              savedQuoteIds={savedQuotes.map((q) => q.quote)}
              onContinueChatWithEmotion={handleContinueChatWithEmotion}
              onRecordEmotionHistory={(res) =>
                setEmotionHistory((prev) => saveEmotionRecordToHistory(res, prev))
              }
            />
          </div>
        )}

        {/* Tab 3: 마음 쉼표 (퇴근 이완 의식 & 감정 캘린더) */}
        {currentTab === 'relax' && (
          <div className="space-y-4">
            <MindfulnessZone
              emotionHistory={emotionHistory}
              reminderSettings={reminderSettings}
              onOpenReminderModal={() => setIsReminderModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>토닥토닥 · 지친 직장인을 위한 따뜻한 쉼터</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>오늘 하루도 정말 고생 많으셨습니다</span>
            <span aria-hidden="true">·</span>
            <span>Gemini AI 기반 심리 위로 케어</span>
          </div>
        </div>
      </footer>

      {/* Saved Quotes Modal */}
      <SavedQuotesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedQuotes={savedQuotes}
        onRemoveQuote={handleRemoveQuote}
        onClearAll={handleClearAllQuotes}
      />

      {/* Evening Reminder Settings Modal */}
      <ReminderSettingsModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        settings={reminderSettings}
        onSaveSettings={handleSaveReminderSettings}
        onTriggerInAppToast={(msg) => setInAppToastMessage(msg)}
      />

      {/* In-App Reminder Toast */}
      <ReminderToast
        message={inAppToastMessage}
        onClose={() => setInAppToastMessage(null)}
        onGoToAnalysis={() => setCurrentTab('analysis')}
      />
    </div>
  );
}
