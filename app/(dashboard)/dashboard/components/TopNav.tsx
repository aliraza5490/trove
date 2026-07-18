"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, Search } from "lucide-react";

export function TopNav() {
  return (
    <header className="flex h-13 items-center justify-between gap-3 border-b bg-background/80 px-3.5 backdrop-blur-md sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground transition-colors" />

        <div className="h-4 w-px bg-border/60 shrink-0" />

        {/* Dashboard Title with 20px (size-5) Icon */}
        <div className="flex items-center gap-2 shrink-0 text-sm font-medium text-foreground">
          <LayoutDashboard className="size-5 text-primary shrink-0" />
          <span className="font-semibold text-foreground">Dashboard</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Quick Search Button */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-command-menu"));
          }}
          className="hidden md:flex items-center gap-2 h-8 px-2.5 text-xs text-muted-foreground bg-accent/40 hover:bg-accent border border-border/50 rounded-lg transition-all hover:text-foreground cursor-pointer shadow-2xs"
        >
          <Search className="size-3.5 text-muted-foreground/80" />
          <span>Search chats...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-background border border-border/70 rounded text-muted-foreground font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
