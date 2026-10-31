import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  ShieldCheck,
  Moon,
} from 'lucide-react';
import { ReminderSettings } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
  playGentleChime,
  isNotificationSupported,
} from '../utils/notification';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onSaveSettings: (settings: ReminderSettings) => void;
  onTriggerInAppToast: (message: string) => void;
}

const TIME_PRESETS = [
  { label: '퇴근길', time: '18:30', desc: '지하철이나 버스 안에서 하루를 정리할 때' },
  { label: '저녁 쉼표', time: '20:00', desc: '저녁 식사를 마치고 온전히 쉴 때' },
  { label: '잠들기 전', time: '22:00', desc: '침대에 누워 마음을 가라앉힐 때' },
];

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTriggerInAppToast,
}) => {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [time, setTime] = useState(settings.time || '20:00');
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnabled(settings.enabled);
      setTime(settings.time || '20:00');
      setPermission(getNotificationPermission());
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleSendTestNotification = () => {
    playGentleChime();
    const success = showBrowserNotification('🌙 토닥토닥 저녁 마음 쉼표', {
      body: '오늘 하루도 끝까지 버텨낸 당신, 정말 고생 많으셨어요. 잠시 들러 오늘의 마음 날씨를 기록해보세요.',
      tag: 'todak-test-reminder',
    });

    onTriggerInAppToast(
      '🌙 [저녁 알림 테스트] 오늘 하루도 끝까지 버텨낸 당신, 정말 고생 많으셨어요. 잠시 들러 오늘의 마음 날씨를 기록해보세요.'
    );

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSave = () => {
    const updated: ReminderSettings = {
      enabled,
      time,
      lastNotifiedDate: settings.lastNotifiedDate,
    };
    onSaveSettings(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                매일 저녁 감정 기록 알림 설정
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                퇴근 후 지친 마음을 잊지 않고 보살필 수 있도록 알림을 보내드려요.
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Notification Permission State Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {permission === 'granted' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : permission === 'denied' ? (
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <Bell className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {permission === 'granted'
                      ? '브라우저 알림 권한이 허용되어 있습니다'
                      : permission === 'denied'
                      ? '브라우저 알림 권한이 차단되어 있습니다'
                      : '브라우저 알림 권한 허용이 필요합니다'}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {permission === 'granted'
                      ? '지정한 시간에 기기 바탕화면이나 모바일 화면에 부드러운 알림이 전달됩니다.'
                      : permission === 'denied'
                      ? '브라우저 설정(주소창 좌측 설정 아이콘)에서 알림을 허용해 주세요. (앱 접속 중에는 인앱 배너로 알려드립니다)'
                      : '웹 브라우저 알림 API를 통해 정해진 시간에 위로 문구와 기록 독려를 받아보세요.'}
                  </p>
                </div>
              </div>

              {permission !== 'granted' && permission !== 'unsupported' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shrink-0 transition-colors shadow-sm"
                >
                  권한 허용
                </button>
              )}
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                매일 저녁 감정 기록 알림 켜기
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                하루에 한 번, 나를 위한 마음 점검 시간을 가져보세요.
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Time Selector */}
          <div className={`space-y-3 transition-opacity ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>알림 받을 시간</span>
              </label>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                현재 설정: {time}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-4 py-2.5 text-base font-mono font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              <span className="text-xs text-slate-400">24시간 형식 (예: 20:00)</span>
            </div>

            {/* Quick time chips */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">추천 시간대:</span>
              <div className="grid grid-cols-3 gap-2">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => setTime(preset.time)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      time === preset.time
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[11px] font-mono tabular-nums opacity-80">{preset.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Notification Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {testSent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>테스트 알림이 전송되었습니다!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>알림 미리보기 테스트 발송하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-sm"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
