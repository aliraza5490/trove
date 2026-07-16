"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { Paperclip, Send, Upload, Image as ImageIcon, FileText, Wrench, X } from "lucide-react";
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
  content: string;
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

const MOCK_CHAT_HISTORY: Record<string, Message[]> = {
  "1": [
    {
      id: "msg-1-1",
      role: "user",
      content: "What is the scope of the Trove project?",
    },
    {
      id: "msg-1-2",
      role: "assistant",
      content: "The Trove project is a modern web application designed for document analysis, web search, and interactive chat. It features a responsive dashboard, a dark/light mode toggle, recent chats sidebar, and a rich document upload functionality.",
    },
  ],
  "2": [
    {
      id: "msg-2-1",
      role: "user",
      content: "Can you summarize the design guidelines?",
    },
    {
      id: "msg-2-2",
      role: "assistant",
      content: "Sure! The design guidelines emphasize premium aesthetics, HSL tailored dark themes, Outfit or Inter typography, responsive layouts, smooth micro-animations, and avoiding browser defaults or generic colors.",
    },
  ],
  "3": [
    {
      id: "msg-3-1",
      role: "user",
      content: "What are the first steps for onboarding?",
    },
    {
      id: "msg-3-2",
      role: "assistant",
      content: "Here is your onboarding checklist:\n1. Set up your local environment (.env file)\n2. Run Prisma migrations to initialize the database\n3. Start the development server using `pnpm dev`\n4. Register a new user at `/signup`",
    },
  ],
  "4": [
    {
      id: "msg-4-1",
      role: "user",
      content: "Show me the latest sprint planning notes.",
    },
    {
      id: "msg-4-2",
      role: "assistant",
      content: "The notes from the latest sprint include:\n- Implement the sidebar navigation and logo alignment.\n- Build the dynamic chat composer and stream responses.\n- Enhance the login/signup page UI.\n- Refactor recent chats page to share the main chat interface.",
    },
  ],
};

interface ChatClientProps {
  chatId?: string;
  initialMessages?: Message[];
}

export default function ChatClient({ chatId, initialMessages = [] }: ChatClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
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
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");
    
    const attachments = selectedDocs.map(d => ({
      name: d.name,
      content: d.content
    }));
    setSelectedDocs([]);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: text,
          webSearch,
          attachments,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const newChatId = response.headers.get("x-chat-id");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let done = false;
      let assistantText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          assistantText += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m))
          );
        }
      }

      if (newChatId && newChatId !== chatId) {
        router.push(`/dashboard/${newChatId}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      toast.error(err.message || "Failed to generate AI response");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, chatId, webSearch, selectedDocs, router]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setSelectedDocs((prev) => {
            if (prev.some((d) => d.name === file.name && d.size === file.size)) return prev;
            toast.success(`Attached ${file.name}`);
            return [...prev, {
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              type: file.type,
              content: content || ""
            }];
          });
        };
        if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
          reader.readAsText(file);
        } else {
          setSelectedDocs((prev) => {
            if (prev.some((d) => d.name === file.name && d.size === file.size)) return prev;
            toast.success(`Attached metadata for binary file: ${file.name}`);
            return [...prev, {
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              type: file.type,
              content: `[Binary/Non-text File content omitted: ${file.name}]`
            }];
          });
        }
      });
    }
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
      <div className={cn("mx-auto w-full max-w-3xl", inConversation ? "pt-4" : "")}>
        {!inConversation ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(60dvh)] pb-40">
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

      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="max-h-32 min-h-14 w-full resize-none border-0 bg-transparent px-2 py-1.5 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 md:text-sm"
        aria-label="Chat input"
      />

      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
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
                  <span className="text-sm">Disable Web Search</span>
                </> : <>
                  <span className="text-sm">Enable Web Search</span>
                </>}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={onSend}
          disabled={!input.trim() || isStreaming}
          size="icon"
          className="shrink-0 rounded-lg"
        >
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
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
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed
              [&_a]:text-primary-600 [&_a]:underline hover:[&_a]:text-primary-500
              [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2
              [&_p]:my-1.5 [&_p]:first:mt-0 [&_p]:last:mb-0
              [&_code]:bg-accent/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_pre]:bg-black/90 [&_pre]:text-white [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white
              [&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2
              [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2
              [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1.5
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-3
              [&_th]:border [&_th]:border-border [&_th]:p-1.5 [&_th]:bg-accent [&_th]:font-semibold
              [&_td]:border [&_td]:border-border [&_td]:p-1.5"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
