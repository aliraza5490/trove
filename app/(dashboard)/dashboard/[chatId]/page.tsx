import React from 'react';
import ChatClient from '../components/ChatClient';

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  return <ChatClient chatId={chatId} key={chatId} />;
}

