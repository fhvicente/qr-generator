import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // idiomas suportados
  locales: ["en", "pt", "es", "fr"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
