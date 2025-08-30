import React from 'react'
import { I18nProviderClient } from '../../../locales/client'
import { QueryProvider } from '@/components/providers/query-provider'

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  return (
    <I18nProviderClient locale={locale}>
      <QueryProvider>
        {children}
      </QueryProvider>
    </I18nProviderClient>
  )
}