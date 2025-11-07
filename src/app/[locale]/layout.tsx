import React from "react";
import { I18nProviderClient } from "../../../locales/client";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <I18nProviderClient locale={locale}>
      <QueryProvider>
        {children}
        <div className="fixed top-4 right-4 flex gap-2">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </QueryProvider>
    </I18nProviderClient>
  );
}
