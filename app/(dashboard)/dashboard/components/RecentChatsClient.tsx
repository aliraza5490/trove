"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Pencil, Trash2, Check, X, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
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
  const [chats, setChats] = useState<Chat[]>(initialChats);
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

  const saveEdit = (id: string) => {
    const next = draftTitle.trim();
    if (!next) {
      toast.error('Title cannot be empty');
      return;
    }
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: next } : c)));
    setEditingId(null);
    setDraftTitle('');
    toast.success('Chat title updated');
  };

  const deleteChat = (id: string) => {
    const target = chats.find((c) => c.id === id);
    if (!target) return;
    const ok = window.confirm(`Delete chat "${target.title}"?`);
    if (!ok) return;
    setChats((prev) => prev.filter((c) => c.id !== id));
    toast.success('Chat deleted');
  };

  return (
    <>
      {chats.map((c) => {
        const isEditing = editingId === c.id;
        return (
          <SidebarMenuItem key={c.id}>
            {isEditing ? (
              <div className="flex items-center gap-2 rounded-md p-2">
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(c.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  aria-label="Chat title"
                  className="h-8"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEdit(c.id)}>
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Save</span>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </div>
            ) : (
              <>
                <SidebarMenuButton asChild>
                  <Link href={`/dashboard/${c.id}`}>
                    <span className="line-clamp-1">{c.title}</span>
                    <span className="text-muted-foreground text-xs">{c.updatedAt}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction aria-label="More actions" showOnHover>
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
