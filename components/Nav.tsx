import Link from "next/link";

const links = [
  { href: "/", label: "Scan" },
  { href: "/lease", label: "Lease" },
  { href: "/toolkit", label: "Toolkit" },
];

export function Nav({ active }: { active?: string }) {
  return (
    <header className="border-b border-ink/10 bg-paper/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-3xl tracking-tight text-ink">
            Veto
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-mute sm:inline">
            before you pay
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-ink text-paper"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
