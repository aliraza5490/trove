import { ModelProvider } from './model-provider';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Fallback title generator using smart heuristics when LLM is unavailable or fails.
 */
export function fallbackTitle(text: string): string {
  if (!text || !text.trim()) return "New Chat";

  let clean = text.trim();

  // Special exact or common patterns
  const lower = clean.toLowerCase();
  if (lower === "if else" || lower === "if/else" || lower === "ifelse") return "If-Else Logic";
  if (lower === "hello" || lower === "hi" || lower === "hey") return "New Conversation";

  // Remove common prefix phrases
  const prefixes = [
    /^(can you|could you|please|help me|tell me|explain|how do i|how to|how can i|what is|what are|show me|summarize|analyze|based on my|give me|i want to|where do we|why did)\s+/i,
    /^(the|a|an)\s+/i
  ];

  let topic = clean;
  for (const prefix of prefixes) {
    topic = topic.replace(prefix, '');
  }

  // Remove trailing punctuation
  topic = topic.replace(/[?.,!;:"]+$/g, '').trim();

  if (!topic) topic = clean;

  // Split into words
  const words = topic.split(/\s+/).filter(Boolean);

  // Take up to 4 words max
  const selectedWords = words.slice(0, 4);

  // Convert to Title Case with smart capitalizations
  const titleCased = selectedWords.map((word) => {
    // Preserve acronyms / tech terms like API, UI, SQL, JS, TS, HTML, CSS, React
    if (word === word.toUpperCase() && word.length >= 2) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  let finalTitle = titleCased.replace(/[\s\W]+$/, '').trim();

  if (!finalTitle || finalTitle.length < 2) return "New Chat";

  return finalTitle;
}

/**
 * Generates a short, interesting, and easy-to-remember chat title.
 * Uses LLM if available, falling back to smart heuristics.
 */
export async function generateChatTitle(userMessage: string, assistantResponse?: string): Promise<string> {
  const input = userMessage?.trim();
  if (!input) return "New Chat";

  try {
    const model = ModelProvider.getModel({ temperature: 0.4 });
    if (model) {
      const promptText = assistantResponse
        ? `User message: "${input.slice(0, 400)}"\nAssistant response preview: "${assistantResponse.slice(0, 300)}"`
        : `User message: "${input.slice(0, 400)}"`;

      const response = await model.invoke([
        new SystemMessage(
          `You are an expert title generator for a modern AI chat application.
Your goal: Generate a short, interesting, catchy, and easy-to-remember chat title (2 to 4 words max).

Strict Rules:
- 2 to 4 words maximum (NEVER exceed 5 words).
- Must be formatted in proper Title Case (e.g. "Sales Performance Analysis", "If-Else Logic Guide", "Top Tech Companies", "Expense Savings Plan").
- Absolutely NO quotation marks, NO markdown, NO emojis, NO prefix labels (like "Title:"), NO trailing periods, and NO ellipsis ("...").
- Make it punchy, engaging, memorable, and clear.
- Return ONLY the title text.`
        ),
        new HumanMessage(promptText),
      ]);

      let rawContent = '';
      if (typeof response?.content === 'string') {
        rawContent = response.content;
      } else if (Array.isArray(response?.content)) {
        rawContent = response.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join('');
      }

      const cleanTitle = rawContent
        .trim()
        .replace(/^["'`:]+|["'`:]+$/g, '')
        .replace(/^title:\s*/i, '')
        .replace(/\.+$/, '')
        .trim();

      // Ensure title meets criteria
      if (cleanTitle && cleanTitle.length >= 2 && cleanTitle.length <= 45 && !cleanTitle.includes('\n')) {
        return cleanTitle;
      }
    }
  } catch (error) {
    console.error("LLM title generation failed, using fallback title generator:", error);
  }

  return fallbackTitle(input);
}
