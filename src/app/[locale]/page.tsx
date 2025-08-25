import { setStaticParamsLocale } from 'next-international/server';
import { getI18n } from '../../../locales/server';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  
  const t = await getI18n()
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          {t('hello')}
        </h1>
        <p className="text-center text-lg">
          {t('welcome')}
        </p>
      </div>
    </main>
  );
}
