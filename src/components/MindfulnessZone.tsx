import React, { useState, useEffect } from 'react';
import { Wind, Trash2, CheckCircle, Sparkles, Moon, Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { EmotionCalendar } from './EmotionCalendar';
import { EmotionHistoryEntry, ReminderSettings } from '../types';

interface MindfulnessZoneProps {
  emotionHistory: EmotionHistoryEntry[];
  reminderSettings?: ReminderSettings;
  onOpenReminderModal?: () => void;
}

export const MindfulnessZone: React.FC<MindfulnessZoneProps> = ({
  emotionHistory,
  reminderSettings,
  onOpenReminderModal,
}) => {
  // 1. Breathing Pacer State (4-7-8 method)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // 2. Worry Dissolver State
  const [worryText, setWorryText] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [dissolvedSuccess, setDissolvedSuccess] = useState(false);

  // 3. Mental Clock-out Ritual
  const [clockedOut, setClockedOut] = useState(() => {
    return localStorage.getItem('todak_clocked_out_date') === new Date().toDateString();
  });

  // Breathing timer engine
  useEffect(() => {
    if (!isBreathingActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 7;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 8;
          } else {
            setPhase('inhale');
            setCyclesCompleted((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, phase]);

  const toggleBreathing = () => {
    if (!isBreathingActive) {
      setPhase('inhale');
      setTimeLeft(4);
    }
    setIsBreathingActive(!isBreathingActive);
  };

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setPhase('inhale');
    setTimeLeft(4);
    setCyclesCompleted(0);
  };

  const handleDissolveWorry = () => {
    if (!worryText.trim() || isDissolving) return;

    setIsDissolving(true);
    setTimeout(() => {
      setIsDissolving(false);
      setWorryText('');
      setDissolvedSuccess(true);
      setTimeout(() => setDissolvedSuccess(false), 4000);
    }, 1800);
  };

  const handleClockOut = () => {
    setClockedOut(true);
    localStorage.setItem('todak_clocked_out_date', new Date().toDateString());
  };

  return (
    <div className="space-y-6">
      {/* Mental Clock-out Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            <Moon className="w-4 h-4" />
            <span>오늘의 마음 퇴근 의식</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {clockedOut ? '오늘 하루 수고 많으셨습니다. 공식 마음 퇴근 완료!' : '아직 마음은 회사에 남아있나요?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {clockedOut
              ? '업무 스위치는 꺼졌습니다. 이제부터 온전히 나만을 위한 휴식을 취하세요.'
              : '퇴근 도장을 찍고 마음속 업무 모드를 공식적으로 종료해 보세요.'}
          </p>
        </div>

        <div>
          <button
            onClick={handleClockOut}
            disabled={clockedOut}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
              clockedOut
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{clockedOut ? '마음 퇴근 완료됨' : '지금 마음 퇴근하기'}</span>
          </button>
        </div>
      </div>

      {/* Evening Reminder Prompt Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>매일 저녁 감정 기록 알림</span>
              {reminderSettings?.enabled ? (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-mono">
                  매일 {reminderSettings.time} 알림 활성
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  알림 꺼짐
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {reminderSettings?.enabled
                ? '설정하신 시간에 브라우저 알림으로 오늘의 마음 날씨를 기록하도록 다정하게 알려드려요.'
                : '퇴근 후 나를 돌아보는 시간을 놓치지 않도록 저녁 시간 알림을 켜보세요.'}
            </p>
          </div>
        </div>

        {onOpenReminderModal && (
          <button
            onClick={onOpenReminderModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap self-end sm:self-auto"
          >
            {reminderSettings?.enabled ? '알림 시간 변경' : '알림 켜기'}
          </button>
        )}
      </div>

      {/* Emotion Calendar Recharts Visualization */}
      <EmotionCalendar history={emotionHistory} />

      {/* Breathing & Worry Shredder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. 4-7-8 퇴근 숨고르기 (Decompression Breathing Pacer) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  4-7-8 퇴근 후 이완 호흡
                </h3>
              </div>
              <span className="text-xs text-slate-400">자율신경계 안정</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              긴장된 교감신경을 가라앉히고 편안한 수면 상태를 유도합니다. (들숨 4초 → 멈춤 7초 → 날숨 8초)
            </p>

            {/* Visual breathing circle */}
            <div className="relative my-8 flex flex-col items-center justify-center">
              <div
                className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                  phase === 'inhale'
                    ? 'scale-110 bg-amber-100/80 dark:bg-amber-950/50 border-4 border-amber-400 text-amber-800 dark:text-amber-200'
                    : phase === 'hold'
                    ? 'scale-105 bg-orange-100/80 dark:bg-orange-950/50 border-4 border-orange-400 text-orange-800 dark:text-orange-200'
                    : 'scale-90 bg-emerald-100/70 dark:bg-emerald-950/40 border-4 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                <span className="text-xs font-semibold tracking-wider uppercase">
                  {phase === 'inhale' && '천천히 들이마시기'}
                  {phase === 'hold' && '숨을 멈추고 머물기'}
                  {phase === 'exhale' && '입으로 천천히 내쉬기'}
                </span>
                <span className="text-4xl font-bold font-mono tabular-nums my-1">{timeLeft}</span>
                <span className="text-[11px] opacity-70">
                  {isBreathingActive ? '호흡에 집중하세요' : '시작 버튼을 누르세요'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              완료한 사이클: <strong className="text-slate-700 dark:text-slate-300 font-mono tabular-nums">{cyclesCompleted}회</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={resetBreathing}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleBreathing}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>호흡 시작</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. 업무 걱정 파쇄기 (Work Worry Shredder) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  오늘의 업무 걱정 흘려보내기
                </h3>
              </div>
              <span className="text-xs text-slate-400">마음 비우기</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              내일까지 안고 갈 필요 없는 스트레스, 상사의 잔소리, 사소한 실수를 적어 완전히 소멸시켜 보세요.
            </p>

            <div className="relative">
              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                rows={5}
                disabled={isDissolving}
                placeholder="예: 오늘 팀장님이 쳐다보던 차가운 눈빛, 내일 아침 보고서 걱정, 동기한테 괜히 쌀쌀맞게 굴었던 것 같은 후회..."
                className={`w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-all duration-1000 ${
                  isDissolving ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'
                }`}
              />

              {isDissolving && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl">
                  <Sparkles className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    걱정을 따뜻한 밤하늘 먼지로 흩날려 보내는 중...
                  </p>
                </div>
              )}
            </div>

            {dissolvedSuccess && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  오늘의 걱정을 깨끗이 흘려보냈습니다. 오늘 밤 당신의 방에는 오직 평온함만 머뭅니다.
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">작성 후 흘려보내면 어디에도 저장되지 않습니다.</span>
            <button
              onClick={handleDissolveWorry}
              disabled={!worryText.trim() || isDissolving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>마음에서 완전히 지우기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
