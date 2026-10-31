import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Bookmark,
  Check,
  Copy,
  AlertCircle,
  Coffee,
  ShieldAlert,
  ArrowRight,
  Smile,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { EmotionAnalysisResult, ComfortQuote, SavedQuote } from '../types';

interface EmotionAnalyzerProps {
  initialStory?: string;
  onSaveQuote: (quote: ComfortQuote) => void;
  savedQuoteIds: string[];
  onContinueChatWithEmotion: (result: EmotionAnalysisResult) => void;
  onRecordEmotionHistory?: (result: EmotionAnalysisResult) => void;
}

const PRESET_WORRIES = [
  {
    label: '상사의 부당한 질책',
    text: '오늘 회의 도중에 상사가 다른 사람들 다 보는 앞에서 제 보고서를 심하게 깎아내리고 인신공격성 발언을 했어요. 하루 종일 손이 떨리고 억울해서 눈물이 날 것 같아요.',
  },
  {
    label: '반복되는 야근 & 번아웃',
    text: '최근 몇 달간 매일 밤 10시까지 야근하고 주말에도 업무 메신저를 확인하고 있어요. 몸과 마음이 완전히 방전되어서 아침에 일어나는 것조차 고통스럽고 삶의 의미를 잃어버린 것 같아요.',
  },
  {
    label: '남들과 비교 & 자책감',
    text: '동기들은 다 이직에 성공하거나 큰 프로젝트를 맡아서 인정받는데, 저만 제자리걸음인 것 같아 불안해요. 내가 능력이 부족해서 이런 건가 싶고 끝없이 자책하게 돼요.',
  },
  {
    label: '퇴근 후에도 멈추지 않는 불안',
    text: '퇴근을 했는데도 마음속에서 회사 생각이 떠나질 않아요. 내일 출근해서 실수할까 봐 가슴이 두근거리고, 침대에 누워도 잠이 오지 않아서 미치겠어요.',
  },
];

export const EmotionAnalyzer: React.FC<EmotionAnalyzerProps> = ({
  initialStory = '',
  onSaveQuote,
  savedQuoteIds,
  onContinueChatWithEmotion,
  onRecordEmotionHistory,
}) => {
  const [story, setStory] = useState(initialStory);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EmotionAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedQuoteIndex, setCopiedQuoteIndex] = useState<number | null>(null);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || story).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '감정 분석에 실패했습니다.');
      }

      const data: EmotionAnalysisResult = await response.json();
      data.analyzedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      data.userStory = text;
      setResult(data);
      if (onRecordEmotionHistory) {
        onRecordEmotionHistory(data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyQuote = (quoteText: string, index: number) => {
    navigator.clipboard.writeText(quoteText);
    setCopiedQuoteIndex(index);
    setTimeout(() => {
      setCopiedQuoteIndex(null);
    }, 2000);
  };

  const getStressColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900';
    if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900';
  };

  return (
    <div className="space-y-6">
      {/* Story Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>직장인 감정 분석 & 맞춤 위로 추천</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              오늘 당신을 괴롭힌 일, 차마 남들에게 하지 못했던 속마음을 편하게 적어주세요.
            </p>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="mb-3">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-1.5">
            자주 겪는 직장 고민 예시:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_WORRIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setStory(preset.text);
                  handleAnalyze(preset.text);
                }}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-200 rounded-lg transition-colors whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={4}
            placeholder="예: 오늘 팀장님한테 보고서 때문에 사람들 앞에서 한 소리를 들었어요. 제가 정말 무능한 사람처럼 느껴지고 내일 출근하기가 너무 두려워요..."
            disabled={isLoading}
            className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:text-slate-100 placeholder:text-slate-400 transition-all resize-none"
          />
        </div>

        {errorMessage && (
          <div className="mt-2.5 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {story.length > 0 ? `${story.length}자 작성 중` : '비밀이 보장되는 안전한 공간입니다.'}
          </span>
          <button
            onClick={() => handleAnalyze()}
            disabled={!story.trim() || isLoading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-medium text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>감정 정밀 분석 중...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white/20" />
                <span>감정 분석 & 위로 처방 받기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Diagnostic Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {result.emotionBadge}
                  </span>
                  <span className="text-xs text-slate-400">분석 시각: {result.analyzedAt}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                  주요 감정: {result.primaryEmotion}
                </h3>
              </div>

              {/* Stress Level Meter */}
              <div className="sm:text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center sm:justify-end gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>현재 추정 스트레스 지수</span>
                </div>
                <div className="flex items-center sm:justify-end gap-2">
                  <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${
                        result.stressScore >= 80
                          ? 'bg-red-500'
                          : result.stressScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, result.stressScore))}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {result.stressScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Empathy Summary */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif-kr">
                "{result.empathySummary}"
              </p>
            </div>
          </div>

          {/* Section: 3 Recommended Comfort Quotes */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  지금 당신의 지친 마음에 건네는 3가지 위로 문구
                </h4>
              </div>
              <span className="text-xs text-slate-400">마음에 와닿는 문구를 보관함에 담아보세요</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.comfortQuotes.map((item, idx) => {
                const isSaved = savedQuoteIds.includes(item.quote);
                const isCopied = copiedQuoteIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-amber-300 dark:hover:border-amber-800 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">#0{idx + 1}</span>
                      </div>

                      <blockquote className="text-sm sm:text-base font-serif-kr text-slate-900 dark:text-slate-100 leading-relaxed mb-3">
                        "{item.quote}"
                      </blockquote>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        {item.reason}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyQuote(item.quote, idx)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="문구 복사"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>복사</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onSaveQuote(item)}
                        disabled={isSaved}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                          isSaved
                            ? 'text-amber-700 bg-amber-100 dark:bg-amber-950/60'
                            : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                        <span>{isSaved ? '보관됨' : '보관하기'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: 오늘 밤 마음 회복 처방전 (Night Care Prescription) */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {result.healingPrescription.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.healingPrescription.message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
              {result.healingPrescription.threeSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-amber-100 dark:border-slate-700/80 flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/40 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  오늘의 힐링 페어링:
                </span>
                <span>{result.healingPrescription.comfortTeaOrSnack}</span>
              </div>

              <button
                onClick={() => onContinueChatWithEmotion(result)}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 transition-colors self-end sm:self-auto"
              >
                <span>이 분석 결과로 토닥이와 대화 이어가기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
