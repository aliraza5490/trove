import { auth } from '@/auth';
import prisma from '@/lib/db';
import RecentChatsClient from "./RecentChatsClient";

type Chat = {
  id: string;
  title: string;
  updatedAt: string;
};

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default async function RecentChats() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-sm text-muted-foreground px-2 py-4">Not logged in</div>;
  }

  const dbChats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  const chats: Chat[] = dbChats.map(chat => ({
    id: chat.id,
    title: chat.title,
    updatedAt: formatRelativeTime(chat.updatedAt),
  }));

  if (!chats.length) {
    return (
      <div className="text-sm text-muted-foreground px-2 py-4">No chats yet</div>
    );
  }

  return <RecentChatsClient initialChats={chats} />;
}
