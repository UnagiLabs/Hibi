import type { ReactNode } from "react";

import type { DemoPhoto } from "@/lib/demo";
import type { Locale } from "@/lib/i18n";

export function PhotoTile({ photo, locale }: { photo: DemoPhoto; locale: Locale }) {
  return (
    <figure className={`photo-tile tone-${photo.tone}`}>
      <figcaption className="photo-caption">{photo.caption[locale]}</figcaption>
    </figure>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  hint,
  action
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {hint ? <p className="hint">{hint}</p> : null}
      </div>
      {action ?? null}
    </div>
  );
}
