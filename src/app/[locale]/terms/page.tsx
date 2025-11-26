import { setStaticParamsLocale } from "next-international/server";
import { getI18n } from "../../../../locales/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);

  const t = await getI18n();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="z-10 max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("terms.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("terms.lastUpdated")} {new Date().toLocaleDateString(locale)}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-6">
              {t("terms.intro")}
            </p>

            {/* Data Collection Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.dataCollection.title")}
              </h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.dataCollection.description")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t("terms.dataCollection.item1")}</li>
                <li>{t("terms.dataCollection.item2")}</li>
                <li>{t("terms.dataCollection.item3")}</li>
                <li>{t("terms.dataCollection.item4")}</li>
              </ul>
            </section>

            {/* Data Usage Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.dataUsage.title")}
              </h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.dataUsage.description")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t("terms.dataUsage.item1")}</li>
                <li>{t("terms.dataUsage.item2")}</li>
                <li>{t("terms.dataUsage.item3")}</li>
              </ul>
            </section>

            {/* Anonymity Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.anonymity.title")}
              </h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.anonymity.description")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t("terms.anonymity.item1")}</li>
                <li>{t("terms.anonymity.item2")}</li>
                <li>{t("terms.anonymity.item3")}</li>
                <li>{t("terms.anonymity.item4")}</li>
              </ul>
            </section>

            {/* Data Retention Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.retention.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("terms.retention.description")}
              </p>
            </section>

            {/* Rights Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.rights.title")}
              </h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.rights.description")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>{t("terms.rights.item1")}</li>
                <li>{t("terms.rights.item2")}</li>
              </ul>
            </section>

            {/* Changes Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.changes.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("terms.changes.description")}
              </p>
            </section>

            {/* Contact Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">
                {t("terms.contact.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("terms.contact.description")}
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href={`/${locale}`}>
            <Button variant="outline" size="lg">
              {t("terms.backToHome")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
