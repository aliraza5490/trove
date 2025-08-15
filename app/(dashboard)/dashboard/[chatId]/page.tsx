import React from 'react';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Chat {params.chatId}</h1>
      <p className="text-muted-foreground mt-2">This is a placeholder chat view.</p>
    </div>
  );
}
