import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  TrendingDown,
  Sparkles,
  Flame,
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { EmotionHistoryEntry } from '../types';

interface EmotionCalendarProps {
  history: EmotionHistoryEntry[];
  onSelectDay?: (entry: EmotionHistoryEntry) => void;
}

// Color mapping for different office worker emotions
export const EMOTION_COLORS: Record<string, { bg: string; text: string; fill: string; border: string }> = {
  '번아웃': { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', fill: '#f43f5e', border: 'border-rose-200 dark:border-rose-900' },
  '불안': { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', fill: '#f59e0b', border: 'border-amber-200 dark:border-amber-900' },
  '자책감': { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', fill: '#fb923c', border: 'border-orange-200 dark:border-orange-900' },
  '피로': { bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', fill: '#6366f1', border: 'border-indigo-200 dark:border-indigo-900' },
  '평온': { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', fill: '#10b981', border: 'border-emerald-200 dark:border-emerald-900' },
  '보람': { bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300', fill: '#0ea5e9', border: 'border-sky-200 dark:border-sky-900' },
  '답답함': { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', fill: '#a855f7', border: 'border-purple-200 dark:border-purple-900' },
};

const DEFAULT_COLOR = {
  bg: 'bg-amber-100 dark:bg-amber-950/60',
  text: 'text-amber-800 dark:text-amber-300',
  fill: '#d97706',
  border: 'border-amber-200 dark:border-amber-900',
};

export const EmotionCalendar: React.FC<EmotionCalendarProps> = ({ history }) => {
  const [selectedEntry, setSelectedEntry] = useState<EmotionHistoryEntry | null>(() => {
    return history.length > 0 ? history[history.length - 1] : null;
  });
  const [activeChartTab, setActiveChartTab] = useState<'trend' | 'distribution'>('trend');

  // Compute summary stats
  const avgStress = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.stressScore, 0) / history.length)
    : 0;

  // Compute emotion frequency
  const emotionCounts: Record<string, number> = {};
  history.forEach((h) => {
    emotionCounts[h.emotion] = (emotionCounts[h.emotion] || 0) + 1;
  });

  const emotionDistributionData = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      name: emotion,
      count,
      fill: EMOTION_COLORS[emotion]?.fill || '#d97706',
    }))
    .sort((a, b) => b.count - a.count);

  const topEmotion = emotionDistributionData[0]?.name || '피로';
  const calmDaysCount = history.filter((h) => h.stressScore < 50).length;

  // Custom Tooltip for AreaChart
  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: EmotionHistoryEntry = payload[0].payload;
      const colorScheme = EMOTION_COLORS[data.emotion] || DEFAULT_COLOR;

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-lg text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.date} ({data.dayOfWeek})
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorScheme.bg} ${colorScheme.text}`}>
              {data.emotion}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
            <span>스트레스 지수</span>
            <strong className="text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {data.stressScore}%
            </strong>
          </div>
          {data.note && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              "{data.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                월간 감정 캘린더 & 스트레스 트래커
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                지난 한 달간 나의 마음 날씨와 스트레스 흐름을 한눈에 돌아봅니다.
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Toggle Tabs (Button/Tab segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveChartTab('trend')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeChartTab === 'trend'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            스트레스 추이 그래프
          </button>
          <button
            onClick={() => setActiveChartTab('distribution')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeChartTab === 'distribution'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            감정 분포 통계
          </button>
        </div>
      </div>

      {/* Monthly Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
            월 평균 스트레스
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {avgStress}
            </span>
            <span className="text-xs text-slate-400">%</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
            가장 잦았던 감정
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
              {topEmotion}
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ({emotionCounts[topEmotion] || 0}일)
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
            마음 회복한 날
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {calmDaysCount}
            </span>
            <span className="text-xs text-slate-400">일 / 30일</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
            연속 기록 일수
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {history.length}
            </span>
            <span className="text-xs text-slate-400">일 연속</span>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization Section using recharts */}
      <div className="h-64 w-full pt-2">
        {activeChartTab === 'trend' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <Area
                type="monotone"
                dataKey="stressScore"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#stressGradient)"
                activeDot={{
                  r: 6,
                  fill: '#d97706',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  onClick: (_event, payload: any) => setSelectedEntry(payload.payload),
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                unit="일"
              />
              <Tooltip
                formatter={(value: any) => [`${value}일`, '기록 일수']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {emotionDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 30-Day Emotion Calendar Grid */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            날짜별 감정 날씨 그리드 (클릭하여 상세 위로 보기)
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 평온
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 불안/자책
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 번아웃
            </span>
          </div>
        </div>

        {/* 30 days grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {history.map((day) => {
            const isSelected = selectedEntry?.id === day.id;
            const colorScheme = EMOTION_COLORS[day.emotion] || DEFAULT_COLOR;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedEntry(day)}
                className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-between min-h-[58px] ${
                  isSelected
                    ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/50 dark:bg-amber-950/40'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-mono">{day.dayLabel}</div>
                <div
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md my-0.5 whitespace-nowrap ${colorScheme.bg} ${colorScheme.text}`}
                >
                  {day.emotion}
                </div>
                <div className="text-[9px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {day.stressScore}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Solace Card Drawer / Box */}
      {selectedEntry && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {selectedEntry.date} ({selectedEntry.dayOfWeek}요일)
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  (EMOTION_COLORS[selectedEntry.emotion] || DEFAULT_COLOR).bg
                } ${(EMOTION_COLORS[selectedEntry.emotion] || DEFAULT_COLOR).text}`}
              >
                {selectedEntry.emotion}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                스트레스 지수 <strong className="font-mono tabular-nums">{selectedEntry.stressScore}%</strong>
              </span>
            </div>

            {selectedEntry.note && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                당시 상황: "{selectedEntry.note}"
              </p>
            )}

            {selectedEntry.comfortQuote && (
              <p className="text-xs font-serif-kr text-amber-900 dark:text-amber-200 font-medium pt-1">
                추천 위로: "{selectedEntry.comfortQuote}"
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
              <Heart className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>그날도 당신은 최선을 다했습니다</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
