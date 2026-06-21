import { Languages } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { WalletSlot } from "@/components/wallet-slot";
import { getDictionary, withLocale, type Locale } from "@/lib/i18n";

type NavKey = "home" | "albums" | "onThisDay" | "careLog";

const NAV_ITEMS: { key: NavKey; path: string }[] = [
  { key: "home", path: "/" },
  { key: "albums", path: "/albums" },
  { key: "onThisDay", path: "/albums/on-this-day" },
  { key: "careLog", path: "/v/demo" }
];

export function SiteHeader({
  locale,
  currentPath,
  active
}: {
  locale: Locale;
  currentPath: string;
  active?: NavKey;
}) {
  const dictionary = getDictionary(locale);
  const otherLocale: Locale = locale === "ja" ? "en" : "ja";

  // Strip an existing ?lang= so the toggle rebuilds it cleanly.
  const basePath = currentPath.split("?")[0];
  const toggleHref =
    otherLocale === "en" ? basePath : `${basePath}${basePath.includes("?") ? "&" : "?"}lang=ja`;

  return (
    <header className="site-header">
      <Link className="brand-link" href={withLocale("/", locale)} aria-label={dictionary.appName}>
        <Image
          className="brand-dot"
          src="/HiBi.png"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          priority
        />
        {dictionary.appName}
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            className={`nav-link${active === item.key ? " is-active" : ""}`}
            href={withLocale(item.path, locale)}
          >
            {dictionary.nav[item.key]}
          </Link>
        ))}
      </nav>

      <div className="header-tail">
        <Link className="lang-toggle" href={toggleHref} aria-label={dictionary.language}>
          <Languages size={15} aria-hidden="true" />
          {otherLocale === "ja" ? dictionary.ja : dictionary.en}
        </Link>
        <WalletSlot locale={locale} />
      </div>
    </header>
  );
}
