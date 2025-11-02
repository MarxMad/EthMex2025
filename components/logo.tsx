'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  showText?: boolean
  href?: string
  className?: string
}

export function Logo({ size = 40, showText = true, href = '/', className }: LogoProps) {
  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/LogoC.jpeg" 
        alt="CriKula Logo" 
        width={size} 
        height={size} 
        className="rounded-full object-cover"
      />
      {showText && (
        <span className="text-xl font-bold text-foreground">CriKula</span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

