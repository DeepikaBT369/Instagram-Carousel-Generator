import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const data = JSON.parse(formData.get('formData'));

    const prompt = `You are an Instagram content strategist. Generate a carousel plan.

Details:
- Niche: ${data.niche}
- Audience: ${data.audience || 'general audience'}
- Tone: ${data.tone}
- Goal: ${data.goal || 'increase engagement'}
- Slides: ${data.slides}

Return ONLY a valid JSON object. No extra text. No markdown. No backticks. Just pure JSON like this:
{"slides":[{"number":1,"type":"hook","headline":"Your headline","body":"Your body text","visual_suggestion":"visual note"},{"number":2,"type":"value","headline":"Your headline","body":"Your body text","visual_suggestion":"visual note"}],"caption":"Instagram caption with emojis and hashtags","best_time":"Wednesday 6-9pm","hook_tip":"Why the first slide works"}

Rules:
- First slide type = hook
- Middle slides type = value  
- Last slide type = cta
- Headline max 5 words
- Body max 15 words
- Generate exactly ${data.slides} slides
- NO apostrophes or special characters in text
- Keep all text simple and short`;

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a JSON generator. You only output valid JSON. Never use apostrophes. Never add extra text.' 
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;
    
    // Extract JSON
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const clean = text.slice(start, end + 1);
    
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}