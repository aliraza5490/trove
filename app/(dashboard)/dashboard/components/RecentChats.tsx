import RecentChatsClient from "./RecentChatsClient";

type Chat = {
  id: string;
  title: string;
  updatedAt: string;
};

export default async function RecentChats() {
  // Fetch user's chats on the server later. For now static list.
  const chats: Chat[] = [
    { id: '1', title: 'Project scope Q&A', updatedAt: '2h ago' },
    { id: '2', title: 'Design guidelines', updatedAt: 'yesterday' },
    { id: '3', title: 'Onboarding checklist', updatedAt: 'Mon' },
    { id: '4', title: 'Sprint planning notes', updatedAt: 'Aug 1' },
  ];

  if (!chats.length) {
    return (
      <div className="text-sm text-muted-foreground px-2 py-4">No chats yet</div>
    );
  }

  return <RecentChatsClient initialChats={chats} />;
}
