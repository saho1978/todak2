import { EmotionHistoryEntry, EmotionAnalysisResult } from '../types';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const SAMPLE_ENTRIES: Array<{
  emotion: string;
  stressRange: [number, number];
  notes: string[];
  quotes: string[];
}> = [
  {
    emotion: '번아웃',
    stressRange: [75, 95],
    notes: [
      '연속된 야근으로 몸과 마음이 한계에 부딪힌 날',
      '회의가 4개나 연속되어 완전히 탈진한 오후',
      '주말 출근 일정 통보받고 가슴이 답답했던 날',
    ],
    quotes: [
      '회사는 당신의 전부가 아니에요. 오늘은 아무것도 하지 말고 쉬세요.',
      '버텨낸 것만으로도 대단한 날이었습니다. 스스로를 안아주세요.',
      '에너지가 방전되었을 땐 억지로 채우려 하지 않아도 괜찮아요.',
    ],
  },
  {
    emotion: '불안',
    stressRange: [60, 80],
    notes: [
      '중요한 프로젝트 발표 앞두고 가슴이 두근거렸던 날',
      '동기들의 이직 소식에 나만 뒤처지는 것 같았던 하루',
      '내일 있을 상사와의 면담 때문에 잠이 오지 않던 밤',
    ],
    quotes: [
      '당신은 당신만의 속도로 이미 잘 걸어가고 있습니다.',
      '아직 일어나지 않은 내일의 일로 오늘의 밤을 빼앗기지 마세요.',
      '불안은 잘 해내고 싶다는 당신의 성실한 마음의 증거입니다.',
    ],
  },
  {
    emotion: '자책감',
    stressRange: [65, 85],
    notes: [
      '사소한 실수로 팀에 폐를 끼친 것 같아 온종일 괴로웠던 날',
      '보고서 피드백을 차갑게 받고 자존감이 바닥친 날',
    ],
    quotes: [
      '실수는 누구나 해요. 당신의 가치가 결코 깎인 것이 아닙니다.',
      '당신 탓이 아니에요. 오늘 하루 충분히 최선을 다했습니다.',
    ],
  },
  {
    emotion: '피로',
    stressRange: [50, 70],
    notes: [
      '월요일 아침부터 쏟아지는 업무 폭탄에 지친 퇴근길',
      '단순 반복 업무에 집중력이 흐려지고 졸음이 쏟아진 날',
      '모니터를 너무 오래 봐서 눈과 목이 뻐근했던 하루',
    ],
    quotes: [
      '따뜻한 물로 샤워하고 오늘은 조금 일찍 불을 꺼보세요.',
      '퇴근길 지하철에서 고생한 두 다리를 가볍게 토닥여주세요.',
    ],
  },
  {
    emotion: '평온',
    stressRange: [20, 40],
    notes: [
      '금요일 칼퇴 성공하고 좋아하는 음악을 들으며 산책한 날',
      '주말에 늦잠 자고 따뜻한 커피 한 잔과 책을 읽은 평화로운 오후',
      '혼자서 조용히 맛있는 저녁을 차려 먹은 밤',
    ],
    quotes: [
      '이 평온함이 내일의 당신을 든든하게 지켜줄 거예요.',
      '온전한 나만의 시간, 오늘 밤 마음껏 누리세요.',
    ],
  },
  {
    emotion: '보람',
    stressRange: [25, 45],
    notes: [
      '오랫동안 끌어온 프로젝트가 무사히 배포되어 칭찬받은 날',
      '후배에게 실질적인 도움을 주고 고맙다는 인사를 들은 날',
    ],
    quotes: [
      '당신의 노력이 마침내 빛을 발한 순간, 진심으로 축하해요.',
      '뿌듯한 마음을 가슴에 품고 기분 좋은 꿈을 꾸세요.',
    ],
  },
];

export function getInitial30DayHistory(): EmotionHistoryEntry[] {
  const stored = localStorage.getItem('todak_emotion_history');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Generate 30 days of data ending today
  const entries: EmotionHistoryEntry[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayLabel = `${month}/${day}`;
    const dayOfWeek = DAY_NAMES[d.getDay()];

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isMonday = d.getDay() === 1;

    let sampleCategory;
    if (isWeekend) {
      sampleCategory = SAMPLE_ENTRIES.find((s) => s.emotion === '평온') || SAMPLE_ENTRIES[4];
    } else if (isMonday) {
      sampleCategory = SAMPLE_ENTRIES.find((s) => s.emotion === '피로') || SAMPLE_ENTRIES[3];
    } else {
      // Pick random weekday patterns
      const randIdx = Math.floor(Math.random() * SAMPLE_ENTRIES.length);
      sampleCategory = SAMPLE_ENTRIES[randIdx];
    }

    const minStress = sampleCategory.stressRange[0];
    const maxStress = sampleCategory.stressRange[1];
    const stressScore = Math.floor(Math.random() * (maxStress - minStress + 1)) + minStress;

    const note = sampleCategory.notes[Math.floor(Math.random() * sampleCategory.notes.length)];
    const quote = sampleCategory.quotes[Math.floor(Math.random() * sampleCategory.quotes.length)];

    entries.push({
      id: `entry-${dateStr}`,
      date: dateStr,
      dayLabel,
      dayOfWeek,
      emotion: sampleCategory.emotion,
      stressScore,
      note,
      comfortQuote: quote,
    });
  }

  localStorage.setItem('todak_emotion_history', JSON.stringify(entries));
  return entries;
}

export function saveEmotionRecordToHistory(
  result: EmotionAnalysisResult,
  currentHistory: EmotionHistoryEntry[]
): EmotionHistoryEntry[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const dayLabel = `${month}/${day}`;
  const dayOfWeek = DAY_NAMES[today.getDay()];

  // Normalize emotion badge into known categories or keep it clean
  let emotion = result.emotionBadge || '피로';
  if (emotion.includes('번아웃')) emotion = '번아웃';
  else if (emotion.includes('불안')) emotion = '불안';
  else if (emotion.includes('자책')) emotion = '자책감';
  else if (emotion.includes('피로') || emotion.includes('탈진')) emotion = '피로';
  else if (emotion.includes('답답')) emotion = '답답함';

  const newEntry: EmotionHistoryEntry = {
    id: `entry-${todayStr}-${Date.now()}`,
    date: todayStr,
    dayLabel,
    dayOfWeek,
    emotion: emotion,
    stressScore: result.stressScore || 65,
    note: result.userStory?.slice(0, 60) || result.empathySummary?.slice(0, 60),
    comfortQuote: result.comfortQuotes?.[0]?.quote || '오늘 하루도 끝까지 버텨낸 당신, 애쓰셨어요.',
  };

  // Replace today's entry if already recorded, or append and keep last 30
  const filtered = currentHistory.filter((h) => h.date !== todayStr);
  const updated = [...filtered, newEntry];

  // Keep last 30 days
  const trimmed = updated.slice(-30);
  localStorage.setItem('todak_emotion_history', JSON.stringify(trimmed));
  return trimmed;
}
