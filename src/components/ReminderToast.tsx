import React from 'react';
import { Bell, ArrowRight, X, Heart } from 'lucide-react';

interface ReminderToastProps {
  message: string | null;
  onClose: () => void;
  onGoToAnalysis: () => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  message,
  onClose,
  onGoToAnalysis,
}) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 shadow-xl shadow-amber-900/10 dark:shadow-black/40">
        <div className="flex items-start justify-between gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Heart className="w-4 h-4 fill-amber-500/30" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                토닥토닥 저녁 마음 쉼표
              </span>
              <span className="text-[10px] text-slate-400">방금 전</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onGoToAnalysis();
                  onClose();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>지금 감정 기록하기</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onClose}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                나중에
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
