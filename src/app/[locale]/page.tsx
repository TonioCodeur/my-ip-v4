import { setStaticParamsLocale } from 'next-international/server';
import { getI18n } from '../../../locales/server';
import { getUserIp } from '@/lib/get-user-ip';
import { IpInfo } from '@/components/ip-info';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  
  const t = await getI18n()
  const userIp = await getUserIp();
  
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 max-w-6xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t('hello')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('welcome')}
          </p>
        </div>
        
        <IpInfo ip={userIp} />
      </div>
    </main>
  );
}
