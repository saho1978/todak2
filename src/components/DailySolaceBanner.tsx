import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Quote } from 'lucide-react';

export const DailySolaceBanner: React.FC = () => {
  const [quoteData, setQuoteData] = useState<{
    quote: string;
    author: string;
    cheerNote: string;
  }>({
    quote: '오늘 하루도 끝까지 버텨낸 당신, 이미 충분히 훌륭합니다.',
    author: '토닥이',
    cheerNote: '무거운 마음은 퇴근길에 두고, 오늘 밤은 오직 당신만을 위해 쉬어가세요.',
  });
  const [loading, setLoading] = useState(false);

  const fetchDailyQuote = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/daily-quote');
      if (res.ok) {
        const data = await res.json();
        if (data.quote) {
          setQuoteData(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-r from-amber-50 via-orange-50/50 to-stone-50 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[160px]">
        {/* Left: Sunset photo banner */}
        <div className="md:col-span-4 relative h-36 md:h-auto overflow-hidden">
          <img
            src="/src/assets/images/peaceful_sunset_commute_1793460983182.jpg"
            alt="퇴근길 노을 풍경"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-black/20 to-transparent md:to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <span className="text-[11px] font-medium tracking-wide uppercase text-amber-200">
              퇴근길 마음 쉼표
            </span>
            <p className="text-xs font-light text-slate-100">수고한 나를 위한 한 줄</p>
          </div>
        </div>

        {/* Right: Solace Quote */}
        <div className="md:col-span-8 p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>오늘의 위로 한마디</span>
            </div>
            <button
              onClick={fetchDailyQuote}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors disabled:opacity-50"
              title="새로운 위로 문구 가져오기"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">새 문구</span>
            </button>
          </div>

          <div className="my-2.5">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base font-serif-kr text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                "{quoteData.quote}"
              </p>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 pl-6">
              {quoteData.cheerNote}
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-400 dark:text-slate-500">
            — {quoteData.author}
          </div>
        </div>
      </div>
    </div>
  );
};
