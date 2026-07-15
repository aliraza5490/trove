import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"
import Link from "next/link"
import React from 'react'

interface ILogoProps {
    link?: string
    className?: string
}

const Logo = ({
    link = '/',
    className
}: ILogoProps) => {
  return (
    <Link href={link} className={cn("flex items-center justify-center gap-2 py-4", className)}>
        <Bot aria-hidden className="size-12 text-primary" />
        <span className="font-semibold text-xl">Trove</span>
    </Link>
  )
}

export default Logo