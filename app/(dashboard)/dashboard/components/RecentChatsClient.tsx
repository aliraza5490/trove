"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { renameChat as renameChatAction, deleteChat as deleteChatAction } from './actions';
import { Pencil, Trash2, Check, X, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export type Chat = {
  id: string;
  title: string;
  updatedAt: string;
};

export default function RecentChatsClient({ initialChats }: { initialChats: Chat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>(initialChats);

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setDraftTitle(currentTitle);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
  };

  const saveEdit = async (id: string) => {
    const next = draftTitle.trim();
    if (!next) {
      toast.error('Title cannot be empty');
      return;
    }
    try {
      await renameChatAction(id, next);
      setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: next } : c)));
      setEditingId(null);
      setDraftTitle('');
      toast.success('Chat title updated');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to rename chat');
    }
  };

  const deleteChat = async (id: string) => {
    const target = chats.find((c) => c.id === id);
    if (!target) return;
    const ok = window.confirm(`Delete chat "${target.title}"?`);
    if (!ok) return;
    try {
      await deleteChatAction(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      toast.success('Chat deleted');
      if (pathname === `/dashboard/${id}`) {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete chat');
    }
  };

  return (
    <>
      {chats.map((c) => {
        const isEditing = editingId === c.id;
        const isActive = pathname === `/dashboard/${c.id}`;
        return (
          <SidebarMenuItem key={c.id}>
            {isEditing ? (
              <div className="flex items-center gap-2 rounded-lg p-2 h-13">
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(c.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  aria-label="Chat title"
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => saveEdit(c.id)}>
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Save</span>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </div>
            ) : (
              <>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "h-13 pl-3 pr-9! rounded-lg transition-all duration-150 ease-in-out flex items-center justify-between gap-1.5 group/row min-w-0",
                    "hover:bg-sidebar-accent/70 dark:hover:bg-white/[0.06]",
                    "active:scale-[0.985] active:bg-sidebar-accent/80",
                    isActive && "bg-sidebar-accent/90 text-sidebar-accent-foreground font-semibold shadow-2xs border-l-2 border-primary pl-2.5"
                  )}
                >
                  <Link href={`/dashboard/${c.id}`} className="flex min-w-0 w-full items-center justify-between gap-1.5">
                    <span className="truncate min-w-0 flex-1 text-sm font-medium">{c.title}</span>
                    <span className="text-[11px] font-normal text-muted-foreground/60 shrink-0 text-right tracking-tight pl-1">{c.updatedAt}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction aria-label="More actions" showOnHover className="right-1.5">
                      <MoreVertical className="h-4 w-4" />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end">
                    <DropdownMenuItem onSelect={() => startEdit(c.id, c.title)}>
                      <Pencil className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => deleteChat(c.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
