import { IpDashboard } from "@/components/ip-dashboard";
import { getUserIp } from "@/lib/get-user-ip";
import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "../../../locales/server";
import { saveIpInfo } from "@/actions/save-ip-info";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const t = await getI18n();
  const userIp = await getUserIp();

  // Stocker automatiquement l'IP de l'utilisateur en base de données
  if (userIp) {
    const result = await saveIpInfo(userIp);
    if (!result.success) {
      console.error("Erreur lors de la sauvegarde de l'IP:", result.error);
    } else {
      console.log("IP sauvegardée avec succès:", result.data?.id);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="z-10 max-w-7xl w-full">
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
    </main>
  );
}
