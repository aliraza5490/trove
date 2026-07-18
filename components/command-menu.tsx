"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  IconMessage,
  IconPlus,
  IconDeviceDesktop,
  IconSun,
  IconMoon,
  IconArrowRight,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

type SearchChatResult = {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage?: string | null;
};

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chats, setChats] = useState<SearchChatResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Listen for Ctrl+K / Cmd+K and custom event "open-command-menu"
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-menu", handleCustomOpen);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-menu", handleCustomOpen);
    };
  }, []);

  // Fetch chats from search API when modal opens or query changes
  const fetchChats = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chats/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (e) {
      console.error("Failed to fetch chats for command menu:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        fetchChats(inputValue);
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [open, inputValue, fetchChats]);

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="sr-only">
        <DialogTitle>Command Menu</DialogTitle>
        <DialogDescription>
          Search chats or navigate through the app.
        </DialogDescription>
      </DialogHeader>

      <DialogContent
        className="gap-0 overflow-hidden rounded-xl border-border/50 bg-popover p-0 shadow-2xl sm:max-w-lg"
        showCloseButton={false}
      >
        <Command className="flex h-full w-full flex-col overflow-hidden bg-popover">
          <div className="flex h-12 items-center gap-2 border-b border-border/50 px-4">
            <IconSearch className="size-4 shrink-0 text-muted-foreground/70" />
            <CommandInput
              className="h-10 text-[15px]"
              onValueChange={setInputValue}
              placeholder="Search chats or commands..."
              value={inputValue}
            />
            <button
              className="flex shrink-0 items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close command menu"
            >
              <Kbd>Esc</Kbd>
            </button>
          </div>

          <CommandList className="max-h-[400px] py-2">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              {loading ? "Searching..." : "No chats found."}
            </CommandEmpty>

            {chats.length > 0 && (
              <CommandGroup heading="Chats">
                {chats.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    className="mx-2 rounded-lg py-2.5 cursor-pointer"
                    onSelect={() => navigateTo(`/dashboard/${chat.id}`)}
                  >
                    <IconMessage className="size-4 text-primary shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-sm font-medium text-foreground">
                        {chat.title}
                      </span>
                      {chat.lastMessage && (
                        <span className="truncate text-xs text-muted-foreground/70">
                          {chat.lastMessage}
                        </span>
                      )}
                    </div>
                    <KbdGroup className="ml-auto shrink-0">
                      <Kbd>↵</Kbd>
                    </KbdGroup>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Quick Actions">
              <CommandItem
                className="mx-2 rounded-lg py-2.5 cursor-pointer"
                onSelect={() => navigateTo("/dashboard")}
              >
                <IconPlus className="size-4 text-muted-foreground shrink-0" />
                <span>New Chat</span>
                <KbdGroup className="ml-auto">
                  <Kbd>⌘</Kbd>
                  <Kbd>N</Kbd>
                </KbdGroup>
              </CommandItem>
              <CommandItem
                className="mx-2 rounded-lg py-2.5 cursor-pointer"
                onSelect={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
              >
                {theme === "dark" ? (
                  <IconSun className="size-4 text-amber-400 shrink-0" />
                ) : (
                  <IconMoon className="size-4 text-indigo-500 shrink-0" />
                )}
                <span>Toggle Theme ({theme === "dark" ? "Light" : "Dark"})</span>
                <KbdGroup className="ml-auto">
                  <Kbd>⌘</Kbd>
                  <Kbd>T</Kbd>
                </KbdGroup>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Navigation">
              <CommandItem
                className="mx-2 rounded-lg py-2.5 cursor-pointer"
                onSelect={() => navigateTo("/dashboard")}
              >
                <IconArrowRight className="size-4 text-muted-foreground shrink-0" />
                <span>Go to <strong className="font-semibold">Dashboard</strong></span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
