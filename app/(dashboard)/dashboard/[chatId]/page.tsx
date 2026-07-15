import React from 'react';

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Chat {chatId}</h1>
      <p className="text-muted-foreground mt-2">This is a placeholder chat view.</p>
    </div>
  );
}
