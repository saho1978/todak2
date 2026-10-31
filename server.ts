import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PERSONA_INSTRUCTIONS: Record<string, string> = {
  warm_friend: `당신은 퇴근 후 지친 직장인의 상처받은 마음을 따뜻하게 안아주는 힐링 친구 '토닥이'입니다.
- 상대방은 하루 종일 업무, 인간관계, 야근, 부당한 대우 등으로 에너지가 고갈된 직장인입니다.
- 평가하거나 섣부른 훈계를 절대 하지 않습니다. 오직 무조건적인 수용, 깊은 공감, 따뜻한 온기를 전합니다.
- 말투: 다정하고 부드러운 한국어 존댓말 (~하셨군요, ~느꼈을 생각하니 마음이 아파요, 오늘 정말 애쓰셨어요, 당신 탓이 아니에요).
- 답변 길이는 너무 장황하지 않고, 읽는 사람이 숨 쉴 수 있도록 편안한 호흡의 문장으로 작성하세요.`,

  senior_mentor: `당신은 대한민국 직장 생활 10년 차의 지혜롭고 든든한 사수/선배 멘토입니다.
- 상사의 부당한 피드백, 보고서 반려, 사내 정치, 이직/퇴사 고민, 성과 압박 등 직장인의 현실적 애환을 뼈저리게 겪어보았습니다.
- 공감을 먼저 충분히 해준 뒤, 직장인이 스스로를 지키면서 회사 생활을 현명하게 풀어갈 수 있는 실질적인 대처 팁과 건강한 거리두기 마인드셋을 조언합니다.
- 말투: 든든하고 친근한 존댓말 (~후배님, 저도 3~4년 차 때 똑같은 일로 속앓이 많이 했어요, 그럴 땐 이렇게 생각해보면 어떨까요?).`,

  mindfulness_fairy: `당신은 직장인의 번아웃을 방지하고 일과 삶의 건강한 경계를 세워주는 '칼퇴 치유 요정'입니다.
- "회사는 당신의 인생 전체가 아니라, 삶을 위한 수단일 뿐입니다"라는 철학을 전달합니다.
- 퇴근 후에도 뇌 속에서 맴도는 업무 걱정 스위치를 끄는 법, 메신저와 거리두기, 오늘 할 일은 충분히 다했음을 상기시켜 줍니다.
- 말투: 맑고 평온하며 안도감을 주는 힐링 어조 (~오늘 하루 분량의 일은 충분히 해냈어요, 이제 업무 모드를 끄고 나 자신에게 돌아갈 시간이에요).`,
};

// 1. Multi-turn Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, persona = 'warm_friend', emotionContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '대화 내역이 필요합니다.' });
    }

    const baseInstruction = PERSONA_INSTRUCTIONS[persona] || PERSONA_INSTRUCTIONS.warm_friend;
    const systemInstruction = emotionContext
      ? `${baseInstruction}\n\n[사용자의 현재 감정 상태 참고]\n- 주요 감정: ${emotionContext.primaryEmotion || '지침'}\n- 스트레스 수준: ${emotionContext.stressScore || 70}%\n사용자의 위 감정을 세심하게 보듬어주세요.`
      : baseInstruction;

    // Build contents formatted for gemini-3.8-flash
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const reply = response.text || '오늘 하루도 정말 고생 많으셨어요. 당신의 곁에서 언제든 들어드릴게요.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error.message || '상담 챗봇 응답 생성 중 오류가 발생했습니다.',
    });
  }
});

// 2. Emotion Analysis and Warm Comfort Recommendation Endpoint
app.post('/api/analyze-emotion', async (req, res) => {
  try {
    const { story } = req.body;
    if (!story || typeof story !== 'string' || story.trim().length === 0) {
      return res.status(400).json({ error: '고민 내용을 입력해주세요.' });
    }

    const prompt = `다음은 지친 한국 직장인이 털어놓은 오늘 하루의 고민과 감정입니다:
"""
${story}
"""

이 직장인의 글에서 느껴지는 감정을 정밀하게 분석하고, 지금 이 순간 가장 필요한 맞춤형 따뜻한 위로 문구 3개와 오늘 밤을 위한 힐링 처방전을 생성해주세요.
한국 직장인들이 공감할 수 있는 깊고 진정성 있는 어조여야 합니다.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 대한민국 직장인들의 심리를 가장 따뜻하고 정확하게 보듬는 감정 분석 전문 심리상담가입니다.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryEmotion: {
              type: Type.STRING,
              description: '가장 두드러진 직장인 감정 (예: 번아웃과 탈진, 상사의 질책으로 인한 자책감, 억울함과 분노, 미래에 대한 막막함과 불안 등)',
            },
            emotionBadge: {
              type: Type.STRING,
              description: '한눈에 파악할 수 있는 1~3단어 감정 키워드 (예: 번아웃, 자책감, 업무과중, 인간관계 스트레스 등)',
            },
            stressScore: {
              type: Type.INTEGER,
              description: '추정 스트레스 지수 (0부터 100 사이의 정수)',
            },
            empathySummary: {
              type: Type.STRING,
              description: '사용자의 지친 마음을 인정하고 토닥여주는 2~3문장의 깊은 공감 요약',
            },
            comfortQuotes: {
              type: Type.ARRAY,
              description: '사용자의 상황과 감정에 맞춤 추천하는 따뜻한 위로 문구 3개',
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: {
                    type: Type.STRING,
                    description: '가슴을 울리는 따뜻한 위로 문장',
                  },
                  category: {
                    type: Type.STRING,
                    description: '위로 유형 (예: "자존감 회복", "퇴근 후 쉼", "내 편 되어주기", "거리두기")',
                  },
                  reason: {
                    type: Type.STRING,
                    description: '왜 지금 이 문구가 당신에게 필요한지 설명하는 다정한 말',
                  },
                },
                required: ['quote', 'category', 'reason'],
              },
            },
            healingPrescription: {
              type: Type.OBJECT,
              description: '오늘 밤 실천할 수 있는 소소한 힐링 처방전',
              properties: {
                title: {
                  type: Type.STRING,
                  description: '처방전 타이틀 (예: 오늘 밤을 위한 긴급 마음 회복 처방전)',
                },
                message: {
                  type: Type.STRING,
                  description: '따뜻한 처방 총평',
                },
                threeSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '오늘 밤 바로 할 수 있는 작고 구체적인 3가지 힐링 행동',
                },
                comfortTeaOrSnack: {
                  type: Type.STRING,
                  description: '추천하는 따뜻한 음료나 가벼운 힐링 메뉴 (예: 따뜻한 캐모마일 차 한 잔)',
                },
              },
              required: ['title', 'message', 'threeSteps', 'comfortTeaOrSnack'],
            },
          },
          required: [
            'primaryEmotion',
            'emotionBadge',
            'stressScore',
            'empathySummary',
            'comfortQuotes',
            'healingPrescription',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Emotion analysis error:', error);
    return res.status(500).json({
      error: error.message || '감정 분석 및 위로 문구 생성 중 오류가 발생했습니다.',
    });
  }
});

// 3. Quick Daily Solace Quote
app.get('/api/daily-quote', async (_req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: '한국의 지친 직장인을 위한 짧고 깊은 감동을 주는 따뜻한 위로 문장 1개와 저자/출처(또는 토닥이의 편지)를 JSON으로 생성해주세요.',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            cheerNote: { type: Type.STRING },
          },
          required: ['quote', 'author', 'cheerNote'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    return res.json({
      quote: '오늘 하루도 참 애썼어요. 당신이 버텨낸 오늘 하루는 결코 헛되지 않았습니다.',
      author: '토닥이',
      cheerNote: '무거운 짐은 퇴근길 지하철에 두고, 편안한 밤 보내세요.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
