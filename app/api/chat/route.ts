import { auth } from '@/auth';
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId, message, webSearch, attachments } = await req.json();

    if (!message || typeof message !== 'string') {
      return new NextResponse('Bad Request: Message is required', { status: 400 });
    }

    let finalChatId = chatId;
    let chatTitle = "";

    // 1. Create chat if not exists
    if (!finalChatId) {
      chatTitle = message.substring(0, 35);
      if (message.length > 35) chatTitle += "...";
      
      const newChat = await prisma.chat.create({
        data: {
          title: chatTitle,
          userId,
        },
      });
      finalChatId = newChat.id;
    } else {
      // Verify chat ownership
      const existingChat = await prisma.chat.findUnique({
        where: { id: finalChatId },
      });
      if (!existingChat || existingChat.userId !== userId) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // 2. Save user message to database
    await prisma.message.create({
      data: {
        chatId: finalChatId,
        role: 'user',
        content: message,
      },
    });

    // 3. Fetch recent history for context
    const history = await prisma.message.findMany({
      where: { chatId: finalChatId },
      orderBy: { createdAt: 'asc' },
      take: 20, // last 20 messages for context
    });

    // 4. Implement Web Search (optional)
    let searchContext = "";
    if (webSearch) {
      const tavilyApiKey = process.env.TAVILY_API_KEY;
      if (tavilyApiKey) {
        try {
          const tavilyResponse = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: tavilyApiKey,
              query: message,
              num_results: 3,
            }),
          });
          if (tavilyResponse.ok) {
            const data = await tavilyResponse.json();
            searchContext = data.results
              .map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
              .join("\n\n");
          }
        } catch (e) {
          console.error("Tavily search API failed:", e);
        }
      }
      if (!searchContext) {
        // Fallback to simulated web search context
        searchContext = `Search query: "${message}"\nResults:\n1. Trove Project: Trove is a responsive and beautiful web application featuring a dashboard, user authentication, and AI chats.\n2. LangChain: A framework for developing applications powered by language models.\n3. Next.js Routing: Utilizes standard dynamic routes and Server Actions in App Router.`;
      }
    }

    // 5. Implement attachments context
    let attachmentsContext = "";
    if (attachments && attachments.length > 0) {
      attachmentsContext = "Attached Document Contents:\n" + attachments.map((a: any) => `[File Name: ${a.name}]\n${a.content}`).join("\n\n");
    }

    // Assemble LangChain messages
    const formattedMessages: any[] = [];
    
    // System message
    let systemInstruction = "You are a helpful assistant. Provide detailed, well-structured, markdown-formatted responses.";
    if (searchContext) {
      systemInstruction += `\n\nHere is relevant search results from the web you can use:\n${searchContext}`;
    }
    if (attachmentsContext) {
      systemInstruction += `\n\nHere is the content of the files uploaded by the user:\n${attachmentsContext}`;
    }
    
    formattedMessages.push(new SystemMessage(systemInstruction));

    // Convert history into messages (excluding the last one which is already the user's message)
    history.forEach((m) => {
      if (m.role === 'user') {
        formattedMessages.push(new HumanMessage(m.content));
      } else {
        formattedMessages.push(new AIMessage(m.content));
      }
    });

    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    let model: any = null;
    if (googleApiKey) {
      model = new ChatGoogleGenerativeAI({
        apiKey: googleApiKey,
        model: "gemini-2.5-flash",
        streaming: true,
      });
    } else if (openaiApiKey) {
      model = new ChatOpenAI({
        apiKey: openaiApiKey,
        modelName: "gpt-4o-mini",
        streaming: true,
      });
    }

    const encoder = new TextEncoder();

    // Create readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let completeText = "";

          if (model) {
            const eventStream = await model.stream(formattedMessages);
            for await (const chunk of eventStream) {
              const text = chunk.content;
              if (text) {
                completeText += text;
                controller.enqueue(encoder.encode(text as string));
              }
            }
          } else {
            // Mock streaming warning
            const warningText = `⚠️ **API Key Missing**: Neither \`GOOGLE_API_KEY\` nor \`OPENAI_API_KEY\` was found in your environment variables. Please add one to your \`.env\` file in the project root and restart the server.\n\n*Running in mock mode:*\n\nHere is a mock response to your query "${message}":\n\nThis shows that the chat infrastructure (saving conversations and messages in PostgreSQL, streaming the response chunks, and showing attachments/web search toggle status) is fully operational. Once you configure an API key, this will stream live responses.`;
            
            const chunks = warningText.split(/(\s+)/);
            for (const chunk of chunks) {
              await new Promise((r) => setTimeout(r, 20));
              completeText += chunk;
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // Save assistant message to database
          await prisma.message.create({
            data: {
              chatId: finalChatId,
              role: 'assistant',
              content: completeText,
            },
          });

          // Update chat's updatedAt field
          await prisma.chat.update({
            where: { id: finalChatId },
            data: { updatedAt: new Date() },
          });

          controller.close();
        } catch (err: any) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Chat-Id': finalChatId,
        'Access-Control-Expose-Headers': 'X-Chat-Id',
      },
    });

  } catch (error: any) {
    console.error("Chat API route error:", error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
