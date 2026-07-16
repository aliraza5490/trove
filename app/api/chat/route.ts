import { auth } from '@/auth';
import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { agentRegistry } from '@/agent';

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

    const encoder = new TextEncoder();
    const chatAgent = agentRegistry.getAgent('chat');

    // Create readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await chatAgent.run({
            message,
            history: history.map((h) => ({
              role: h.role,
              content: h.content,
            })),
            webSearch,
            attachments,
            onToken: (token) => {
              controller.enqueue(encoder.encode(token));
            },
            onComplete: async (completeText) => {
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
            },
          });
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
