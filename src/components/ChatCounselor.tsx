import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  Coffee,
  Briefcase,
  Leaf,
  ArrowRight,
  Bot,
  User,
} from 'lucide-react';
import { ChatMessage, PersonaType, PersonaInfo, EmotionAnalysisResult } from '../types';

interface ChatCounselorProps {
  onAnalyzeStory: (text: string) => void;
  activeEmotionContext?: EmotionAnalysisResult | null;
}

const PERSONAS: PersonaInfo[] = [
  {
    id: 'warm_friend',
    name: '토닥이',
    roleTitle: '다정한 공감 친구',
    avatar: '/src/assets/images/counselor_companion_1793460982682.jpg',
    shortDesc: '판단 없이 내 편이 되어 따뜻하게 안아주는 힐링 동반자',
    greeting:
      '오늘 하루도 정말 고생 많으셨어요. 회사에서 어떤 일이 있었나요? 사소한 것이라도 다 털어놓아 보세요. 제가 전부 들어드릴게요.',
  },
  {
    id: 'senior_mentor',
    name: '든든한 10년차 선배',
    roleTitle: '직장 생존 멘토',
    avatar: '/src/assets/images/counselor_companion_1793460982682.jpg',
    shortDesc: '산전수전 겪은 사수의 현실적 공감과 슬기로운 대처 조언',
    greeting:
      '어서 와요 후배님. 회사 일이라는 게 뜻대로 안 되고 속상할 때가 참 많죠. 무슨 일인지 편하게 얘기해 봐요. 같이 풀어봅시다.',
  },
  {
    id: 'mindfulness_fairy',
    name: '칼퇴 치유 요정',
    roleTitle: '워라밸 경계 지킴이',
    avatar: '/src/assets/images/counselor_companion_1793460982682.jpg',
    shortDesc: '업무 걱정 스위치를 끄고 나 자신을 지키는 힐링 가이드',
    greeting:
      '오늘 근무 시간은 끝났습니다. 당신은 오늘 할 일을 충분히 다했어요. 마음속에 남아있는 회사의 짐을 내려놓고 나를 지키는 대화를 나눠요.',
  },
];

const PROMPT_SUGGESTIONS = [
  '오늘 상사한테 억울하게 질책을 들었어요 😢',
  '매일 반복되는 야근 때문에 몸도 마음도 방전됐어요 🔋',
  '이 직무가 맞는지 회의감이 들고 남들과 비교돼요 🌧️',
  '퇴근 후에도 일 생각과 내일 출근 걱정이 멈추지 않아요 🌙',
];

export const ChatCounselor: React.FC<ChatCounselorProps> = ({
  onAnalyzeStory,
  activeEmotionContext,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaType>('warm_friend');
  const selectedPersona = PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'init-msg',
        role: 'model',
        content: selectedPersona.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When persona changes, offer to switch greeting if it was just the initial message
  const handleSelectPersona = (id: PersonaType) => {
    if (id === selectedPersonaId) return;
    setSelectedPersonaId(id);
    const newPersona = PERSONAS.find((p) => p.id === id) || PERSONAS[0];
    if (messages.length <= 1) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'model',
          content: newPersona.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      // Append persona switch notice
      setMessages((prev) => [
        ...prev,
        {
          id: `switch-${Date.now()}`,
          role: 'model',
          content: `상담사가 [${newPersona.name} - ${newPersona.roleTitle}]님으로 연결되었습니다. 언제든 편히 말씀해 주세요.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('상담 대화 내역을 새로 시작할까요?')) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: 'model',
          content: selectedPersona.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setErrorMessage(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: selectedPersonaId,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          emotionContext: activeEmotionContext
            ? {
                primaryEmotion: activeEmotionContext.primaryEmotion,
                stressScore: activeEmotionContext.stressScore,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '답변을 불러오지 못했습니다.');
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Collect user's shared feelings to analyze
  const getFullUserConversation = () => {
    return messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n\n');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[580px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Bar inside Chat: Persona selector & actions */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
        {/* Persona Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl">
          {PERSONAS.map((p) => {
            const isSelected = p.id === selectedPersonaId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p.id === 'warm_friend' && <Coffee className="w-3.5 h-3.5" />}
                {p.id === 'senior_mentor' && <Briefcase className="w-3.5 h-3.5" />}
                {p.id === 'mindfulness_fairy' && <Leaf className="w-3.5 h-3.5" />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {messages.some((m) => m.role === 'user') && (
            <button
              onClick={() => onAnalyzeStory(getFullUserConversation())}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg transition-colors whitespace-nowrap"
              title="지금 나눈 대화를 바탕으로 감정 분석 및 위로 문구 추천받기"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>내 감정 분석받기</span>
            </button>
          )}

          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="대화 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Persona Banner Notice */}
      <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <img
            src={selectedPersona.avatar}
            alt={selectedPersona.name}
            className="w-6 h-6 rounded-full object-cover border border-amber-300 dark:border-amber-600"
          />
          <span className="font-medium text-amber-900 dark:text-amber-200">
            {selectedPersona.name}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {selectedPersona.shortDesc}
          </span>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-400 shrink-0 font-medium ml-2">
          Gemini 3.8 Flash 연동
        </span>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-semibold">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <img
                    src={selectedPersona.avatar}
                    alt={selectedPersona.name}
                    className="w-8 h-8 rounded-full object-cover border border-amber-200 dark:border-amber-700"
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-amber-100' : 'text-slate-400 dark:text-slate-400'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <img
              src={selectedPersona.avatar}
              alt={selectedPersona.name}
              className="w-8 h-8 rounded-full object-cover border border-amber-200 dark:border-amber-700"
            />
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>{selectedPersona.name}님이 마음을 담아 글을 적고 있어요...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => handleSendMessage()}
              className="underline font-semibold ml-2 hover:text-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips (when quiet or low message count) */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">
            가슴이 답답할 때 바로 털어놓기:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-200 border border-slate-200 dark:border-slate-700 rounded-full transition-colors whitespace-nowrap shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${selectedPersona.name}에게 오늘 있었던 힘든 일이나 고민을 털어놓으세요...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:text-slate-100 placeholder:text-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">보내기</span>
          </button>
        </form>
      </div>
    </div>
  );
};
