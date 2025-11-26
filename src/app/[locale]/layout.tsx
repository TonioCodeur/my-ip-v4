import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { I18nProviderClient } from "../../../locales/client";

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
        <Toaster />
      </QueryProvider>
    </I18nProviderClient>
  );
}
