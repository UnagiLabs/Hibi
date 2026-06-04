import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell home-shell">
      <section className="empty-state">
        <div className="brand-mark">Hibi</div>
        <h1>Memory View</h1>
        <p>Open a view URL returned by Hibi API.</p>
        <Link className="text-link" href="/v/demo">
          /v/:viewId
        </Link>
      </section>
    </main>
  );
}
