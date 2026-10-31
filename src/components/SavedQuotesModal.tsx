import React, { useState } from 'react';
import { X, Bookmark, Trash2, Copy, Check, Heart, Sparkles } from 'lucide-react';
import { SavedQuote } from '../types';

interface SavedQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: SavedQuote[];
  onRemoveQuote: (id: string) => void;
  onClearAll: () => void;
}

export const SavedQuotesModal: React.FC<SavedQuotesModalProps> = ({
  isOpen,
  onClose,
  savedQuotes,
  onRemoveQuote,
  onClearAll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bookmark className="w-4 h-4 fill-amber-500/30" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                나만의 위로 보관함
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                힘들고 지칠 때마다 꺼내보는 나를 위한 따뜻한 위로 모음집 ({savedQuotes.length}개)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {savedQuotes.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                아직 보관된 위로 문구가 없습니다.
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                감정 분석 후 마음에 와닿은 따뜻한 위로 카드를 [보관하기] 버튼을 눌러 저장해 보세요.
              </p>
            </div>
          ) : (
            savedQuotes.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.savedAt}</span>
                  </div>

                  <blockquote className="text-sm sm:text-base font-serif-kr text-slate-900 dark:text-slate-100 leading-relaxed my-2 font-medium">
                    "{item.quote}"
                  </blockquote>

                  {item.reason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{item.reason}</p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => handleCopy(item.id, item.quote)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>복사</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveQuote(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="보관함에서 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {savedQuotes.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              전체 비우기
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-medium rounded-xl transition-colors"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
