export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--ara-border)] bg-[var(--ara-ivory)]/70 py-8">
      <div className="ara-container flex flex-col justify-between gap-3 text-sm text-[var(--ara-muted)] md:flex-row">
        <p>© {new Date().getFullYear()} ARA by Shanaya. Crafted for timeless style.</p>
        <p>Order support: arabyshanya@gmail.com</p>
      </div>
    </footer>
  );
}
