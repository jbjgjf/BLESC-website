"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * The page's language, for client components.
 *
 * The layout renders this once around everything, with the locale its route
 * belongs to, so a client component anywhere below — the nav, the footer, a
 * mock screen inside a section — asks useLocale() rather than being handed a
 * prop through every server component above it. Server components cannot
 * read context and take a `locale` prop instead (see lib/i18n).
 *
 * The default is Japanese, the site's default language, so a component
 * rendered outside a provider (a test, a story) still says something.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = (): Locale => useContext(LocaleContext);
