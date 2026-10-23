// Groq AI Client Integration for DateMind AI with Key Rotation & Model Fallback

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_SECONDARY,
].filter((k): k is string => Boolean(k && k.trim().length > 0));

let currentKeyIndex = 0;

export async function callGroqChat(
  messages: ChatMessage[],
  temperature = 0.7,
  responseFormatJson = false
): Promise<string> {
  const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  const fallbackModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];

  const modelsToTry = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];

  let lastError: Error | null = null;

  for (let keyAttempt = 0; keyAttempt < GROQ_KEYS.length; keyAttempt++) {
    const apiKey = GROQ_KEYS[(currentKeyIndex + keyAttempt) % GROQ_KEYS.length];

    for (const model of modelsToTry) {
      try {
        const payload: Record<string, unknown> = {
          model,
          messages,
          temperature,
          max_tokens: 1500,
        };

        if (responseFormatJson) {
          payload.response_format = { type: 'json_object' };
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.warn(`Groq model ${model} with key ${apiKey.substring(0, 10)}... failed status ${res.status}: ${errorText}`);
          lastError = new Error(`Groq API error (${model}): ${res.status}`);
          continue;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content.trim();
        }
      } catch (err: unknown) {
        console.warn(`Attempt with ${model} encountered error:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // Switch key for next attempts
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
  }

  throw lastError || new Error('All Groq models and keys failed to respond.');
}

/**
 * Extracts and parses JSON from LLM output, handling markdown fences or reasoning text
 */
export function extractJsonFromResponse<T>(rawContent: string): T {
  try {
    // 1. Try direct parse
    return JSON.parse(rawContent) as T;
  } catch {
    // 2. Try removing markdown code blocks ```json ... ```
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch {
        // Continue
      }
    }

    // 3. Try finding first '{' and last '}'
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = rawContent.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate) as T;
    }

    throw new Error(`Failed to parse JSON from AI response: ${rawContent.substring(0, 300)}...`);
  }
}
