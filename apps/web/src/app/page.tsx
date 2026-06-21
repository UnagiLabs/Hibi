import {
  ArrowRight,
  Baby,
  Calendar,
  CalendarDays,
  CalendarRange,
  Camera,
  History,
  Images
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { FamilyAccessPanel } from "@/components/family-access-panel";
import { SiteHeader } from "@/components/site-header";
import {
  demoHighlightPhotos,
  demoNotes,
  demoArchiveStatus,
  demoRecentViews,
  type ArchiveStatusItem,
  type Tone
} from "@/lib/demo";
import { getDictionary, parseLocale, withLocale, type Dictionary, type Locale } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

type QuickAction = {
  key: keyof Dictionary["actions"];
  href: string;
  tone: Tone;
  Icon: LucideIcon;
  soon?: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  { key: "thisMonth", href: "/albums/monthly", tone: "yellow", Icon: CalendarDays },
  { key: "thisYear", href: "/albums/yearly", tone: "pink", Icon: CalendarRange },
  { key: "onThisDay", href: "/albums/on-this-day", tone: "green", Icon: History },
  { key: "openAlbum", href: "/albums", tone: "blue", Icon: Images },
  { key: "careLog", href: "/v/demo", tone: "pink", Icon: Baby },
  { key: "photoLibrary", href: "/albums/photos", tone: "green", Icon: Camera }
];

export default async function HomePage({ searchParams }: PageProps) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  const dictionary = getDictionary(locale);
  const steps = dictionary.homeHowToSteps;
  const showcaseAlbumPhotos = demoHighlightPhotos.slice(0, 4);
  const showcaseNotes = demoNotes.slice(0, 2);

  return (
    <main className="shell">
      <SiteHeader locale={locale} currentPath="/" active="home" />

      <section className="home-hero fade-up">
        <div className="home-copy">
          <p className="eyebrow">{dictionary.tagline}</p>
          <h1>{dictionary.homeHeroTitle}</h1>
          <p className="lead">{dictionary.homeHeroBody}</p>
          <div className="home-actions">
            <Link className="primary-link" href={withLocale("/albums", locale)}>
              {dictionary.actions.openAlbum.title}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="text-link" href={withLocale("/v/demo", locale)}>
              {dictionary.openViewUrl}
            </Link>
          </div>
        </div>
        <div className="home-preview" aria-hidden="true">
          <div className="phone-frame">
            <div className="phone-top" />
            <div className="mini-log pink" />
            <div className="mini-log yellow" />
            <div className="mini-log green" />
            <div className="mini-log blue" />
          </div>
        </div>
      </section>

      <section className="fade-up fade-up-1 home-showcase" aria-labelledby="showcase-heading">
        <div className="section-header">
          <div>
            <p className="eyebrow">{dictionary.homeShowcaseTitle}</p>
            <h2 id="showcase-heading">{dictionary.homeShowcaseTitle}</h2>
            <p className="hint">{dictionary.homeShowcaseHint}</p>
          </div>
        </div>
        <div className="showcase-grid">
          <article className="showcase-card">
            <div className="showcase-copy">
              <p className="eyebrow">{dictionary.nav.albums}</p>
              <h3>{dictionary.homeShowcaseAlbumTitle}</h3>
              <p>{dictionary.homeShowcaseAlbumBody}</p>
            </div>
            <div className="showcase-media" aria-hidden="true">
              <p className="showcase-label">{dictionary.homeShowcaseAlbumCover}</p>
              <div className="mock-photo-grid">
                {showcaseAlbumPhotos.map((photo) => (
                  <span key={photo.id} className={`mock-photo tone-${photo.tone}`}>
                    <span>{photo.caption[locale]}</span>
                  </span>
                ))}
              </div>
            </div>
            <Link className="text-link" href={withLocale("/albums/monthly", locale)}>
              {dictionary.homeShowcaseAlbumLink}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
          <article className="showcase-card">
            <div className="showcase-copy">
              <p className="eyebrow">{dictionary.careLog}</p>
              <h3>{dictionary.homeShowcaseCareLogTitle}</h3>
              <p>{dictionary.homeShowcaseCareLogBody}</p>
            </div>
            <div className="showcase-media" aria-hidden="true">
              <p className="showcase-label">{dictionary.homeShowcaseCareLogListLabel}</p>
              <div className="log-mock">
                {showcaseNotes.map((note) => (
                  <article key={note.id} className="log-item">
                    <p className="log-date">{note.date[locale]}</p>
                    <p>{note.text[locale]}</p>
                  </article>
                ))}
              </div>
            </div>
            <Link className="text-link" href={withLocale("/v/demo", locale)}>
              {dictionary.homeShowcaseCareLogLink}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <FamilyAccessPanel locale={locale} />

      <section className="fade-up fade-up-2" aria-labelledby="quick-actions-heading">
        <div className="section-header">
          <div>
            <p className="eyebrow">{dictionary.quickActions}</p>
            <h2 id="quick-actions-heading">{dictionary.quickActions}</h2>
            <p className="hint">{dictionary.quickActionsHint}</p>
          </div>
        </div>
        <div className="action-grid">
          {QUICK_ACTIONS.map((action) => {
            const copy = dictionary.actions[action.key];
            return (
              <Link
                key={action.key}
                className="action-card"
                href={withLocale(action.href, locale)}
              >
                <span className={`tile-icon tone-${action.tone}`}>
                  <action.Icon size={24} aria-hidden="true" />
                </span>
                <strong>{copy.title}</strong>
                <span>{action.soon ? dictionary.comingSoon : copy.hint}</span>
                <ArrowRight className="arrow" size={18} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="fade-up fade-up-3" aria-labelledby="howto-heading">
        <div className="section-header">
          <div>
            <p className="eyebrow">{dictionary.homeHowToTitle}</p>
            <h2 id="howto-heading">{dictionary.homeHowToTitle}</h2>
            <p className="hint">{dictionary.homeHowToHint}</p>
          </div>
        </div>
        <ol className="step-list">
          {steps.map((step, idx) => (
            <li key={step.title} className="step-item">
              <span className="step-index">{idx + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="fade-up fade-up-4" aria-labelledby="recent-heading">
        <div className="section-header">
          <div>
            <p className="eyebrow">{dictionary.recentViews}</p>
            <h2 id="recent-heading">{dictionary.recentViews}</h2>
            <p className="hint">{dictionary.recentViewsHint}</p>
          </div>
        </div>
        <div className="recent-list">
          {demoRecentViews.map((view) => (
            <Link key={view.id} className="recent-card" href={withLocale(view.href, locale)}>
              <span className={`recent-thumb tone-${view.tone}`} aria-hidden="true" />
              <span>
                <strong>{view.title[locale]}</strong>
                <span>{view.subtitle[locale]}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="fade-up fade-up-3" aria-labelledby="archive-heading">
        <div className="section-header">
          <div>
            <p className="eyebrow">{dictionary.archiveStatus}</p>
            <h2 id="archive-heading">{dictionary.archiveStatus}</h2>
            <p className="hint">{dictionary.archiveStatusHint}</p>
          </div>
        </div>
        <ArchiveCard items={demoArchiveStatus} locale={locale} />
      </section>
    </main>
  );
}

function ArchiveCard({ items, locale }: { items: ArchiveStatusItem[]; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const labels: Record<ArchiveStatusItem["id"], string> = {
    walrus: dictionary.walrusSaved,
    memwal: dictionary.memwalRemembered,
    sui: dictionary.suiVerified
  };
  const icons: Record<ArchiveStatusItem["id"], LucideIcon> = {
    walrus: Images,
    memwal: Calendar,
    sui: CalendarRange
  };

  return (
    <div className="archive-card">
      <div className="archive-rows">
        {items.map((item) => {
          const Icon = icons[item.id];
          return (
            <div className="archive-row" key={item.id}>
              <span className={`status-dot ${item.state}`} aria-hidden="true" />
              <Icon size={17} aria-hidden="true" />
              <strong>{labels[item.id]}</strong>
              <span className="proof">
                {item.state === "demo" ? dictionary.demoMode : item.proof}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
