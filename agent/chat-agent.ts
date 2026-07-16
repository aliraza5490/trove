import { BaseAgent } from './base';
import { AgentInput } from './types';
import { ModelProvider } from './model-provider';
import { executeWebSearch } from './tools/web-search';
import { formatAttachments } from './tools/file-attachment';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

export class ChatAgent extends BaseAgent {
  readonly id = 'chat';
  readonly name = 'Chat Agent';
  readonly description = 'Conversational agent capable of answering queries, using web search, and analyzing file attachments.';

  async run(input: AgentInput): Promise<void> {
    const { message, history, webSearch, attachments, onToken, onComplete } = input;

    // Get LLM model first to determine if we are using Google
    const model = ModelProvider.getModel();
    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const isGoogle = !!(googleApiKey && model && model.constructor.name === 'ChatGoogleGenerativeAI');

    // 1. Gather contexts
    let searchContext = "";
    if (webSearch) {
      searchContext = await executeWebSearch(message);
    }

    let attachmentsContext = "";
    if (attachments && attachments.length > 0 && !isGoogle) {
      attachmentsContext = formatAttachments(attachments);
    }

    const googleFiles: Array<{ uri: string; mimeType: string }> = [];
    if (isGoogle && attachments && attachments.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey: googleApiKey });
        for (const att of attachments) {
          if (att.googleUri) {
            console.log(`Using pre-uploaded Google file URI for ${att.name}: ${att.googleUri}`);
            googleFiles.push({
              uri: att.googleUri,
              mimeType: att.mimeType || 'application/octet-stream',
            });
          } else if (att.url) {
            const absolutePath = path.join(process.cwd(), 'public', att.url.replace(/^\//, ''));
            console.log(`Uploading file to Google servers (fallback): ${absolutePath}`);
            const uploadResult = await ai.files.upload({
              file: absolutePath,
              config: {
                mimeType: att.mimeType || undefined,
              },
            });

            if (!uploadResult.name) {
              throw new Error(`Upload of ${att.name} did not return a file name`);
            }
            let fileState = await ai.files.get({ name: uploadResult.name });
            while (fileState.state === 'PROCESSING') {
              console.log(`File ${att.name} is processing, waiting 2s...`);
              await new Promise((resolve) => setTimeout(resolve, 2000));
              fileState = await ai.files.get({ name: uploadResult.name });
            }

            if (!uploadResult.uri) {
              throw new Error(`Upload of ${att.name} did not return a URI`);
            }
            console.log(`File ${att.name} uploaded successfully to Google servers. URI: ${uploadResult.uri}`);
            googleFiles.push({
              uri: uploadResult.uri,
              mimeType: att.mimeType || 'application/octet-stream',
            });
          }
        }
      } catch (uploadError) {
        console.error("Google files upload failed, falling back to text prompt injection:", uploadError);
        attachmentsContext = formatAttachments(attachments);
      }
    }

    // 2. Assemble LangChain messages
    const formattedMessages: any[] = [];
    
    // System instruction
    let systemInstruction = "You are a helpful assistant. Provide detailed, well-structured, markdown-formatted responses.";
    if (searchContext) {
      systemInstruction += `\n\nHere is relevant search results from the web you can use:\n${searchContext}`;
    }
    if (attachmentsContext) {
      systemInstruction += `\n\nHere is the content of the files uploaded by the user:\n${attachmentsContext}`;
    }
    
    formattedMessages.push(new SystemMessage(systemInstruction));

    // Convert history into messages (including user's latest message, which is already saved and retrieved at the end of history)
    history.forEach((m, idx) => {
      if (m.role === 'user') {
        if (idx === history.length - 1 && googleFiles.length > 0) {
          formattedMessages.push(
            new HumanMessage({
              content: [
                { type: 'text', text: m.content },
                ...googleFiles.map((f) => ({
                  type: 'file',
                  url: f.uri,
                  mimeType: f.mimeType,
                })),
              ],
            })
          );
        } else {
          formattedMessages.push(new HumanMessage(m.content));
        }
      } else {
        formattedMessages.push(new AIMessage(m.content));
      }
    });

    // 3. Get LLM model

    let completeText = "";

    if (model) {
      const eventStream = await model.stream(formattedMessages);
      for await (const chunk of eventStream) {
        const text = chunk.content;
        if (text) {
          const textStr = typeof text === 'string' ? text : JSON.stringify(text);
          completeText += textStr;
          if (onToken) {
            await onToken(textStr);
          }
        }
      }
    } else {
      // Mock streaming warning
      const warningText = `⚠️ **API Key Missing**: Neither \`GOOGLE_API_KEY\` nor \`OPENAI_API_KEY\` was found in your environment variables. Please add one to your \`.env\` file in the project root and restart the server.\n\n*Running in mock mode:*\n\nHere is a mock response to your query "${message}":\n\nThis shows that the chat infrastructure (saving conversations and messages in PostgreSQL, streaming the response chunks, and showing attachments/web search toggle status) is fully operational. Once you configure an API key, this will stream live responses.`;
      
      const chunks = warningText.split(/(\s+)/);
      for (const chunk of chunks) {
        await new Promise((r) => setTimeout(r, 20));
        completeText += chunk;
        if (onToken) {
          await onToken(chunk);
        }
      }
    }

    if (onComplete) {
      await onComplete(completeText);
    }
  }
}
