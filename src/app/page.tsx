'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getLocaleFromBrowser(): string {
  if (typeof window === 'undefined') return 'en'
  
  const supportedLocales = ['en', 'fr']
  const languages = navigator.languages || [navigator.language]
  
  for (const lang of languages) {
    const locale = lang.split('-')[0]
    if (supportedLocales.includes(locale)) {
      return locale
    }
  }
  
  return 'en'
}

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    const locale = getLocaleFromBrowser()
    router.push(`/${locale}`)
  }, [router])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Detecting your language...</p>
      </div>
    </div>
  )
}