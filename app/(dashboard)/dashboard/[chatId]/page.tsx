import React from 'react';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import ChatClient from '../components/ChatClient';

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return redirect('/login');
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!chat || chat.userId !== userId) {
    return redirect('/dashboard');
  }

  // Format messages matching ChatClient's Message type
  const initialMessages = chat.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return <ChatClient chatId={chatId} initialMessages={initialMessages} key={chatId} />;
}

