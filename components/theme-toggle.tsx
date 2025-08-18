"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const current = (resolvedTheme ?? theme ?? "system") as string
  const isDark = current === "dark" || (current === "system" && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggle = () => setTheme(isDark ? "light" : "dark")

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle} className="hover:bg-accent/60">
      {mounted && isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
