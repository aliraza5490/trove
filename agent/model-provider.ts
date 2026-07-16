import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ModelConfig } from './types';

export class ModelProvider {
  static getModel(config?: ModelConfig): any {
    const provider = config?.provider || this.getDefaultProvider();
    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (provider === 'google' && googleApiKey) {
      return new ChatGoogleGenerativeAI({
        apiKey: googleApiKey,
        model: config?.modelName || "gemini-2.5-flash",
        streaming: true,
        temperature: config?.temperature ?? 0.7,
      });
    }

    if (provider === 'openai' && openaiApiKey) {
      return new ChatOpenAI({
        apiKey: openaiApiKey,
        modelName: config?.modelName || "gpt-4o-mini",
        streaming: true,
        temperature: config?.temperature ?? 0.7,
      });
    }

    // Default to whichever key is available if provider is not explicitly set
    if (!config?.provider) {
      if (googleApiKey) {
        return new ChatGoogleGenerativeAI({
          apiKey: googleApiKey,
          model: "gemini-2.5-flash",
          streaming: true,
        });
      }
      if (openaiApiKey) {
        return new ChatOpenAI({
          apiKey: openaiApiKey,
          modelName: "gpt-4o-mini",
          streaming: true,
        });
      }
    }

    return null;
  }

  private static getDefaultProvider(): 'google' | 'openai' | 'mock' {
    if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) return 'google';
    if (process.env.OPENAI_API_KEY) return 'openai';
    return 'mock';
  }
}
