"use client"

import { Languages } from "lucide-react"
import { useChangeLocale, useCurrentLocale } from "../../locales/client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()

  const handleLocaleChange = (locale: 'en' | 'fr') => {
    changeLocale(locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange("en")}
          className={currentLocale === "en" ? "bg-accent" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("fr")}
          className={currentLocale === "fr" ? "bg-accent" : ""}
        >
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
