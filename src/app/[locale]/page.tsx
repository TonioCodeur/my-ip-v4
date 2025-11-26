import { saveIpInfo } from "@/actions/save-ip-info";
import { IpDashboard } from "@/components/ip-dashboard";
import { getUserIp } from "@/lib/get-user-ip";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "../../../locales/server";

// Force cette page à être dynamique pour avoir accès aux headers en production
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const t = await getI18n();
  const userIp = await getUserIp();

  console.log(`[Page Home] Locale: ${locale}, IP détectée: ${userIp || 'null'}, NODE_ENV: ${process.env.NODE_ENV}`);

  // Stocker automatiquement l'IP de l'utilisateur en base de données
  // En production, Vercel fournira automatiquement l'IP via les headers (x-forwarded-for)
  try {
    const result = await saveIpInfo(userIp || undefined);
    if (!result.success) {
      console.error("[Page Home] ❌ Erreur lors de la sauvegarde de l'IP:", result.error);
    } else if (result.skipped) {
      console.log("[Page Home] ⏭️ IP déjà enregistrée récemment:", result.data?.ipAddress);
    } else {
      console.log("[Page Home] ✅ IP sauvegardée avec succès:", result.data?.id, result.data?.ipAddress);
    }
  } catch (error) {
    console.error("[Page Home] ❌ Exception lors de la sauvegarde:", error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="z-10 max-w-7xl w-full flex-1">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("app.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("app.description")}
          </p>
        </div>

        <IpDashboard initialIp={userIp} />
      </div>

      <footer className="mt-12 py-6 border-t w-full max-w-7xl">
        <div className="text-center text-sm text-muted-foreground">
          <a
            href={`/${locale}/terms`}
            className="hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            {t("footer.terms")}
          </a>
        </div>
      </footer>
    </main>
  );
}
