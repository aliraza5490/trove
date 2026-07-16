export interface FileAttachment {
  name: string;
  content: string;
  url?: string;
  googleUri?: string | null;
  mimeType?: string;
  size?: number;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | string;
  content: string;
}

export interface AgentInput {
  message: string;
  history: AgentMessage[];
  webSearch?: boolean;
  attachments?: FileAttachment[];
  onToken?: (token: string) => void | Promise<void>;
  onComplete?: (fullText: string) => void | Promise<void>;
}

export interface ModelConfig {
  provider?: 'google' | 'openai' | 'mock';
  modelName?: string;
  temperature?: number;
}
