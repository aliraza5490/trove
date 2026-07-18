"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Paperclip,
  Send,
  Image as ImageIcon,
  FileText,
  Bot,
  Sparkles,
  X,
  Globe,
  Code2,
  Lightbulb,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Attachment = {
  id: string;
  name: string;
  url: string;
  googleUri?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

type SelectedDoc = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  googleUri?: string | null;
  content: string;
  isUploading: boolean;
};

const SUGGESTED_PROMPTS = [
  {
    icon: Globe,
    title: "Web Research",
    subtitle: "Search real-time news & updates",
    prompt: "What are the latest tech trends and web framework updates in 2026?",
    color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    icon: FileText,
    title: "Document Analysis",
    subtitle: "Summarize & extract key insights",
    prompt: "Help me analyze key takeaways and structure insights from my uploaded document.",
    color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    icon: Code2,
    title: "Code & Debug",
    subtitle: "Generate clean React & TS code",
    prompt: "Write a custom React component with Tailwind CSS and smooth micro-interactions.",
    color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    icon: Lightbulb,
    title: "Brainstorm Ideas",
    subtitle: "Explore features & architecture",
    prompt: "Give me 5 innovative feature ideas for an AI-powered workspace application.",
    color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  },
];

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

  const isAnyFileUploading = useMemo(
    () => selectedDocs.some((d) => d.isUploading),
    [selectedDocs]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("webSearch");
      if (saved !== null) {
        setWebSearch(saved === "true");
      }
    }
  }, []);

  const handleSetWebSearch = useCallback((value: boolean) => {
    setWebSearch(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("webSearch", String(value));
    }
  }, []);

  const inConversation = messages.length > 0;

  const { ref: textareaRef, resize } = useAutoResizeTextarea<HTMLTextAreaElement>();
  useEffect(() => resize(), [input, resize]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto focus input on mount when on new chat page
  useEffect(() => {
    if (!inConversation && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [inConversation, textareaRef]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || isAnyFileUploading) return;
    const text = input.trim();
    setInput("");
    
    const attachments = selectedDocs.map(d => ({
      name: d.name,
      content: d.content,
      url: d.url,
      googleUri: d.googleUri,
      mimeType: d.type,
      size: d.size
    }));
    setSelectedDocs([]);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      attachments: attachments.map((att, idx) => ({
        id: `att-local-${idx}-${Date.now()}`,
        name: att.name,
        url: att.url || "",
        googleUri: att.googleUri,
        mimeType: att.mimeType,
        size: att.size
      }))
    };
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
  }, [input, isStreaming, isAnyFileUploading, chatId, webSearch, selectedDocs, router]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFiles = useCallback((files: File[]) => {
    if (files.length) {
      files.forEach((file) => {
        const docId = crypto.randomUUID();
        // 1. Add placeholder with isUploading: true
        setSelectedDocs((prev) => {
          if (prev.some((d) => d.name === file.name && d.size === file.size)) return prev;
          return [...prev, {
            id: docId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: "",
            content: "",
            isUploading: true
          }];
        });

        // 2. Read content locally if it is a text file
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setSelectedDocs((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, content: content || "" } : d))
          );
        };

        if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
          reader.readAsText(file);
        } else {
          setSelectedDocs((prev) =>
            prev.map((d) =>
              d.id === docId
                ? { ...d, content: `[Binary/Non-text File content omitted: ${file.name}]` }
                : d
            )
          );
        }

        // 3. Perform upload
        const formData = new FormData();
        formData.append("file", file);

        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((res) => {
            if (!res.ok) throw new Error("Upload failed");
            return res.json();
          })
          .then((data) => {
            setSelectedDocs((prev) =>
              prev.map((d) =>
                d.id === docId
                  ? { ...d, url: data.url, googleUri: data.googleUri, isUploading: false }
                  : d
              )
            );
            toast.success(`Uploaded ${file.name}`);
          })
          .catch((err) => {
            console.error("File upload error:", err);
            toast.error(`Failed to upload ${file.name}`);
            // Remove failed doc from selection
            setSelectedDocs((prev) => prev.filter((d) => d.id !== docId));
          });
      });
    }
  }, []);

  const onFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    uploadFiles(files);
    e.currentTarget.value = "";
  }, [uploadFiles]);

  const removeSelectedDoc = useCallback((id: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleSelectSuggestedPrompt = useCallback(
    (promptText: string) => {
      setInput(promptText);
      textareaRef.current?.focus();
    },
    [textareaRef]
  );

  // Global key listener to auto-focus input on typing anywhere & handle Enter on new chat page
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputTarget =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest('[role="dialog"]') ||
          target.closest('[role="combobox"]'));

      if (isInputTarget) return;

      // Ignore modifier combinations (Ctrl+K, Cmd+C, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Handle Enter key on new chat page / anywhere when not focusing an input
      if (e.key === "Enter" && !e.shiftKey) {
        if (input.trim() && !isStreaming && !isAnyFileUploading) {
          e.preventDefault();
          handleSend();
        } else if (textareaRef.current) {
          textareaRef.current.focus();
        }
        return;
      }

      // Auto-focus input on typing any printable character
      if (e.key.length === 1 && textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [input, isStreaming, isAnyFileUploading, handleSend, textareaRef]);

  const placeholder = "Ask anything...";

  return (
    <div className="relative min-h-full">
      <div className={cn("mx-auto w-full max-w-[800px]", inConversation ? "pt-4" : "")}>
        {!inConversation ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(82dvh)] py-6 px-2 sm:px-4">
            <div className="w-full max-w-[800px] flex flex-col items-center">
              <HeroHeading />

              <div className="w-full mt-6 mb-6">
                <Composer
                  textareaRef={textareaRef}
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  placeholder={placeholder}
                  isStreaming={isStreaming}
                  webSearch={webSearch}
                  setWebSearch={handleSetWebSearch}
                  onUploadClick={handleUploadClick}
                  selectedDocs={selectedDocs}
                  onRemoveDoc={removeSelectedDoc}
                  isAnyFileUploading={isAnyFileUploading}
                  onPasteFiles={uploadFiles}
                />
              </div>

              {/* Suggested Prompts & Engagement Section */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <Compass className="size-3.5 text-primary" />
                    Suggested Prompts
                  </span>
                  <span className="text-[11px] text-muted-foreground/70">Click to fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleSelectSuggestedPrompt(item.prompt)}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card/40 hover:bg-accent/60 hover:border-border/80 transition-all duration-200 text-left group shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      <div className={cn("p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105", item.color)}>
                        <item.icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                          <span>{item.title}</span>
                          <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Keyboard Shortcuts Footer */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/80">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-muted/80 border border-border/60 rounded shadow-2xs">Ctrl + K</kbd>
                    <span>Search chats</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-muted/80 border border-border/60 rounded shadow-2xs">↵</kbd>
                    <span>Send prompt</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-muted/80 border border-border/60 rounded shadow-2xs">Shift + ↵</kbd>
                    <span>New line</span>
                  </div>
                </div>
              </div>
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

      {inConversation && (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 transition-all duration-500 ease-in-out w-full flex justify-center">
          <div className="pointer-events-auto w-full max-w-[800px] px-2 sm:px-4">
            <Composer
              textareaRef={textareaRef}
              input={input}
              setInput={setInput}
              onSend={handleSend}
              placeholder={placeholder}
              isStreaming={isStreaming}
              webSearch={webSearch}
              setWebSearch={handleSetWebSearch}
              onUploadClick={handleUploadClick}
              selectedDocs={selectedDocs}
              onRemoveDoc={removeSelectedDoc}
              isAnyFileUploading={isAnyFileUploading}
              onPasteFiles={uploadFiles}
            />
          </div>
        </div>
      )}

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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium mb-3.5 shadow-2xs">
        <Sparkles className="size-3.5 text-primary" />
        <span>Trove AI Workspace</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground/90">
        What can I help you build today?
      </h1>
      <p className="mt-2.5 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
        Research the web, analyze documents, write code, or brainstorm ideas.
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
  isAnyFileUploading: boolean;
  onPasteFiles: (files: File[]) => void;
}) {
  const {
    textareaRef,
    input,
    setInput,
    onSend,
    placeholder,
    isStreaming,
    webSearch,
    setWebSearch,
    onUploadClick,
    selectedDocs,
    onRemoveDoc,
    isAnyFileUploading,
    onPasteFiles,
  } = props;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      e.preventDefault();
      onPasteFiles(files);
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
    <div className="bg-background/85 supports-[backdrop-filter]:backdrop-blur-md border border-border/70 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-xl p-2.5 sm:p-3.5 transition-shadow">
      {selectedDocs.length > 0 && (
        <div className="flex overflow-x-auto items-center gap-2 px-1 pb-2 font-sans">
          {selectedDocs.map((d) => (
            <div
              key={d.id}
              className="group inline-flex items-center gap-2 rounded-full bg-accent/60 text-xs text-foreground px-2.5 py-1.5 border"
            >
              <span className="text-muted-foreground flex items-center justify-center">
                {d.isUploading ? (
                  <span className="animate-spin inline-block size-3.5 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  iconFor(d.type)
                )}
              </span>
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
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
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
            disabled={isStreaming}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
            title="Attach document"
          >
            <Paperclip className="size-4.5" />
          </button>

          {/* Web Search Mode Pill */}
          <button
            type="button"
            onClick={() => setWebSearch(!webSearch)}
            disabled={isStreaming}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer select-none",
              webSearch
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground border-border/40 hover:bg-accent"
            )}
            title={webSearch ? "Disable Web Search" : "Enable Web Search"}
          >
            <Globe className={cn("size-3.5", webSearch && "text-emerald-500")} />
            <span>{webSearch ? "Web Search ON" : "Web Search"}</span>
          </button>
        </div>

        <Button
          onClick={onSend}
          disabled={!input.trim() || isStreaming || isAnyFileUploading}
          size="icon"
          className="shrink-0 rounded-lg"
        >
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>

      {webSearch && (
        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-1 animate-in fade-in duration-200">
          <span className="inline-flex items-center gap-1.5">
            <Globe className="size-3 text-emerald-500" />
            🌐 Web Search Enabled
          </span>
          <span className="text-muted-foreground font-normal">Press Enter to send</span>
        </div>
      )}
    </div>
  );
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="mx-auto w-full max-w-[800px]">
      <ul className="space-y-6">
        {messages.map((m) => (
          <li key={m.id}>
            <ChatBubble role={m.role} content={m.content} attachments={m.attachments} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttachmentPill({ attachment, isUser }: { attachment: Attachment; isUser: boolean }) {
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (mime?: string | null, filename?: string) => {
    const m = mime?.toLowerCase() || "";
    const name = filename?.toLowerCase() || "";
    
    if (m.startsWith("image/") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".gif")) {
      return <ImageIcon className="size-4 shrink-0 text-sky-500" />;
    }
    if (m.includes("pdf") || name.endsWith(".pdf")) {
      return <FileText className="size-4 shrink-0 text-rose-500" />;
    }
    if (m.includes("csv") || m.includes("spreadsheet") || name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) {
      return <FileText className="size-4 shrink-0 text-emerald-500" />;
    }
    if (m.includes("json") || name.endsWith(".json")) {
      return <FileText className="size-4 shrink-0 text-amber-500" />;
    }
    return <FileText className="size-4 shrink-0 text-muted-foreground" />;
  };

  const baseClasses = cn(
    "flex items-center gap-2 rounded-lg border p-2 text-xs transition-all duration-200 max-w-[200px] sm:max-w-[240px] font-sans",
    isUser
      ? "bg-black/15 border-white/20 text-primary-foreground hover:bg-black/25"
      : "bg-background border-border text-foreground hover:bg-accent"
  );

  return (
    <a
      href={attachment.url}
      download={attachment.name}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClasses}
      title={`Download ${attachment.name}`}
    >
      {getFileIcon(attachment.mimeType, attachment.name)}
      <div className="overflow-hidden min-w-0 flex-1">
        <p className="truncate font-medium hover:underline">{attachment.name}</p>
        {attachment.size && (
          <p className={cn("text-[10px]", isUser ? "text-primary-foreground/75" : "text-muted-foreground")}>
            {formatBytes(attachment.size)}
          </p>
        )}
      </div>
    </a>
  );
}

function ChatBubble({ role, content, attachments }: { role: Message["role"]; content: string; attachments?: Attachment[] }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="size-8 border border-emerald-500/20 shadow-2xs ring-1 ring-background shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white font-medium flex items-center justify-center size-full">
            <Bot className="size-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm flex flex-col gap-2 transition-all",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md shadow-[0_2px_10px_rgba(99,102,241,0.18)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
            : "bg-muted/65 dark:bg-zinc-900/80 border border-border/60 dark:border-white/[0.06] text-foreground rounded-bl-md shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : content === "" ? (
          <div className="flex items-center gap-1.5 py-1.5 px-0.5" aria-label="Thinking">
            <span className="size-1.5 rounded-full bg-foreground/45 animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-foreground/45 animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-foreground/45 animate-bounce" />
          </div>
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

        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {attachments.map((att) => (
              <AttachmentPill key={att.id} attachment={att} isUser={isUser} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="size-8 border border-white/20 shadow-2xs ring-1 ring-background shrink-0">
          <AvatarFallback className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-xs flex items-center justify-center size-full">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
