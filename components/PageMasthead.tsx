export function PageMasthead({
  brand,
  headline,
  blurb,
  accent = "tide",
}: {
  brand: string;
  headline: string;
  blurb: string;
  accent?: "tide" | "veto";
}) {
  const accentBar = accent === "veto" ? "bg-veto" : "bg-tide";

  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/cork-hero.jpg)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/75 to-ink/55"
        aria-hidden
      />
      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${accentBar}`}
        aria-hidden
      />
      <div
        className="absolute -right-16 top-0 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            accent === "veto"
              ? "rgba(185, 28, 28, 0.55)"
              : "rgba(15, 118, 110, 0.55)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          {brand}
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {headline}
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-white/75">
          {blurb}
        </p>
      </div>
    </section>
  );
}
