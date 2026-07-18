"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setScrolled(scrollPosition > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background border-b border-border shadow-md"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Bot aria-hidden className="size-6 text-primary" />
          <span className="font-semibold">Trove</span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-2 sm:gap-3"
        >
          <Link
            href="#features"
            className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </Link>
          <Link href="/login" className="hidden sm:inline-flex">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg">
              Get started
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
