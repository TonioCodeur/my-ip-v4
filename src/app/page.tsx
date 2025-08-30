import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function detectLocaleFromHeaders(): Promise<string> {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')
  const supportedLocales = ['en', 'fr']
  
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map((lang: string) => lang.split('-')[0].split(';')[0].trim())

    for (const lang of languages) {
      if (supportedLocales.includes(lang)) {
        return lang
      }
    }
  }
  
  return 'en' // default locale
}

export default async function RootPage() {
  const locale = await detectLocaleFromHeaders()
  redirect(`/${locale}`)
}