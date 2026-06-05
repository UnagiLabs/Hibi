import Link from "next/link";

import { WalletSlot } from "@/components/wallet-slot";

export default function HomePage() {
  return (
    <main className="shell">
      <div className="top-bar home-top-bar">
        <WalletSlot locale="ja" />
      </div>
      <section className="home-hero">
        <div className="home-copy">
          <div className="brand-mark">Hibi</div>
          <p className="eyebrow">Family memories, remembered.</p>
          <h1>Family memories, remembered.</h1>
          <p>
            Open childcare logs and growth albums created from chat, then connect a Sui wallet to prepare for family archive verification.
          </p>
          <div className="home-actions">
            <Link className="primary-link" href="/v/demo">
              Open a View URL
            </Link>
            <a className="text-link" href="http://127.0.0.1:4000/api/health">
              Check API status
            </a>
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
    </main>
  );
}
