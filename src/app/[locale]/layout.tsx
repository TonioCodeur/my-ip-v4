import React from 'react'
import { I18nProviderClient } from '../../../locales/client'

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
      {children}
    </I18nProviderClient>
  )
}