export type PersonaType = 'warm_friend' | 'senior_mentor' | 'mindfulness_fairy';

export interface PersonaInfo {
  id: PersonaType;
  name: string;
  roleTitle: string;
  avatar: string;
  shortDesc: string;
  greeting: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ComfortQuote {
  quote: string;
  category: string;
  reason: string;
}

export interface HealingPrescription {
  title: string;
  message: string;
  threeSteps: string[];
  comfortTeaOrSnack: string;
}

export interface EmotionAnalysisResult {
  primaryEmotion: string;
  emotionBadge: string;
  stressScore: number;
  empathySummary: string;
  comfortQuotes: ComfortQuote[];
  healingPrescription: HealingPrescription;
  analyzedAt?: string;
  userStory?: string;
}

export interface SavedQuote {
  id: string;
  quote: string;
  category: string;
  reason: string;
  savedAt: string;
}

export interface EmotionHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "10/02"
  dayOfWeek: string; // "월", "화", ...
  emotion: string; // "번아웃", "불안", "자책감", "피로", "평온", "뿌듯함"
  stressScore: number; // 0 - 100
  note?: string;
  comfortQuote?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:mm", e.g. "20:00"
  lastNotifiedDate?: string;
}
