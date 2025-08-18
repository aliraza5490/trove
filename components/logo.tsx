import { Bot } from "lucide-react"
import Link from "next/link"
import React from 'react'

interface ILogoProps {
    link?: string
}

const Logo = ({
    link = '/'
}: ILogoProps) => {
  return (
    <Link href={link} className="flex items-center justify-center gap-2 py-4">
        <Bot aria-hidden className="size-12 text-primary" />
        <span className="font-semibold text-xl">Trove</span>
    </Link>
  )
}

export default Logo