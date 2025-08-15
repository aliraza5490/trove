"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Send, Upload, Search, ChevronDown, X, FileText, Image as ImageIcon, Wrench, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type SelectedDoc = {
  id: string;
  name: string;
  size: number;
  type: string;
};

function useAutoResizeTextarea<T extends HTMLTextAreaElement>() {
  const ref = useRef<T>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, []);
  return { ref, resize } as const;
}

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<SelectedDoc[]>([]);

  const inConversation = messages.length > 0;

  const { ref: textareaRef, resize } = useAutoResizeTextarea<HTMLTextAreaElement>();
  useEffect(() => resize(), [input, resize]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const mockGenerate = useCallback(async (prompt: string) => {
    // Simple mock streaming response; replace with your backend later.
    const base = webSearch
      ? `I searched the web and found some relevant info about: ${prompt}. `
      : `Here's a response to: ${prompt}. `;
    const filler =
      "This is a simulated streaming reply to showcase the chat UI behavior. You can wire this up to your API later for real responses.";
    const full = base + filler;
    const chunks = full.split(/(\s+)/); // stream word-ish chunks
    return chunks;
  }, [webSearch]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");
    setSelectedDocs([]);

    // Add user message
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // Prepare assistant message
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    setIsStreaming(true);
    const chunks = await mockGenerate(text);

    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 30));
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
      );
    }
    setIsStreaming(false);
  }, [input, isStreaming, mockGenerate]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      const mapped = files.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setSelectedDocs((prev) => {
        // dedupe by name+size
        const existingKey = new Set(prev.map((d) => `${d.name}:${d.size}`));
        const toAdd = mapped.filter((d) => !existingKey.has(`${d.name}:${d.size}`));
        const next = [...prev, ...toAdd];
        if (toAdd.length) toast.success(`Added ${toAdd.length} file${toAdd.length > 1 ? "s" : ""}`);
        return next;
      });
      // TODO: Upload files to your API and attach to conversation context
    }
    // reset for same file re-select
    e.currentTarget.value = "";
  }, []);

  const removeSelectedDoc = useCallback((id: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const placeholder = useMemo(
    () => (webSearch ? "Ask anything... (Web Search ON)" : "Ask anything..."),
    [webSearch]
  );

  return (
    <div className="relative min-h-full">
      {/* Conversation area */}
      <div className={cn("mx-auto w-full max-w-3xl", inConversation ? "pt-4" : "")}>
        {!inConversation ? (
          <div className="grid min-h-[calc(60dvh)] place-items-center">
            <div className="w-full max-w-2xl px-4">
              <HeroHeading />
            </div>
          </div>
        ) : (
          <div className="px-2 sm:px-4">
            <div
              ref={scrollRef}
              className={cn("h-[calc(100dvh-15.6rem)] overflow-y-auto pr-1 sm:pr-2", selectedDocs.length > 0 && "h-[calc(100dvh-18.6rem)]")}
            >
              <MessageList messages={messages} />
            </div>
          </div>
        )}
      </div>

      {/* Input composer */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 transition-all duration-500 ease-in-out w-full flex justify-center",
          inConversation
            ? "bottom-5 translate-y-0"
            : "top-1/2 -translate-y-1/2"
        )}
      >
        <div className="pointer-events-auto w-full max-w-3xl px-2 sm:px-4">
          <Composer
            textareaRef={textareaRef}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            placeholder={placeholder}
            isStreaming={isStreaming}
            webSearch={webSearch}
            setWebSearch={setWebSearch}
            onUploadClick={handleUploadClick}
            selectedDocs={selectedDocs}
            onRemoveDoc={removeSelectedDoc}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileSelected}
  multiple
        accept=".pdf,.txt,.md,.doc,.docx,.csv,.json,.png,.jpg,.jpeg"
      />
    </div>
  );
}

function HeroHeading() {
  return (
    <div className="mx-auto text-center">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground/90">
        Welcome to your chat
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ask questions, analyze docs, and explore the web.
      </p>
    </div>
  );
}

function Composer(props: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  isStreaming: boolean;
  webSearch: boolean;
  setWebSearch: (v: boolean) => void;
  onUploadClick: () => void;
  selectedDocs: SelectedDoc[];
  onRemoveDoc: (id: string) => void;
}) {
  const { textareaRef, input, setInput, onSend, placeholder, isStreaming, webSearch, setWebSearch, onUploadClick, selectedDocs, onRemoveDoc } = props;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const iconFor = (mime: string) => {
    if (mime.startsWith("image/")) return <ImageIcon className="size-3.5" />;
    return <FileText className="size-3.5" />;
  };

  return (
    <div className="bg-background/80 supports-[backdrop-filter]:backdrop-blur-md border shadow-lg rounded-xl p-2 sm:p-3">
      {selectedDocs.length > 0 && (
        <div className="flex overflow-x-auto items-center gap-2 px-1 pb-2">
          {selectedDocs.map((d) => (
            <div
              key={d.id}
              className="group inline-flex items-center gap-2 rounded-full bg-accent/60 text-xs text-foreground px-2.5 py-1.5 border"
            >
              <span className="text-muted-foreground">{iconFor(d.type)}</span>
              <span className="max-w-[14rem] truncate" title={`${d.name} • ${formatBytes(d.size)}`}>
                {d.name}
              </span>
              <span className="hidden sm:inline text-muted-foreground min-w-fit">· {formatBytes(d.size)}</span>
              <button
                type="button"
                onClick={() => onRemoveDoc(d.id)}
                className="ml-0.5 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                aria-label={`Remove ${d.name}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="max-h-56 min-h-14 flex-1 resize-none bg-transparent"
          aria-label="Chat input"
        />
        
        <Button
          onClick={onSend}
          disabled={!input.trim() || isStreaming}
          className="shrink-0 absolute bottom-2 right-2"
        >
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2 px-1">
        <button
          type="button"
          aria-label="Attach"
          onClick={onUploadClick}
          className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent"
        >
          <Paperclip className="size-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <Wrench className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem  onSelect={(e) => { e.preventDefault(); onUploadClick(); }}>
              <Upload className="size-4" /> Upload Document
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={webSearch}
              onCheckedChange={(v) => setWebSearch(Boolean(v))}
            >
              {webSearch ? <>
                <span className="text-sm">Enable Web Search</span>
              </> : <>
                <span className="text-sm">Disable Web Search</span>
              </>}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2 rounded-full", webSearch ? "bg-emerald-500" : "bg-muted")}></span>
          Web search {webSearch ? "enabled" : "disabled"}
        </span>
        <span>•</span>
        <span>Press Enter to send, Shift+Enter for new line</span>
      </div>
    </div>
  );
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ul className="space-y-6">
        {messages.map((m) => (
          <li key={m.id}>
            <ChatBubble role={m.role} content={m.content} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatBubble({ role, content }: { role: Message["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full items-start gap-3", isUser ? "justify-end" : "justify-start")}> 
      {!isUser && (
        <Avatar>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {content}
      </div>
      {isUser && (
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
