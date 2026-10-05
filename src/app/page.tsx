import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight text-primary">FoodBiz</span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Merchant login
            </Link>
            <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(232,93,4,0.12),_transparent_55%)]" />
          <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 text-center md:pb-24 md:pt-20">
            <div className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Built for Indian home food businesses
            </div>
            <h1 className="animate-fade-up text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              Your store.
              <br />
              <span className="bg-gradient-to-r from-primary to-[#ff8c42] bg-clip-text text-transparent">
                Zero commissions.
              </span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Create a mobile mini-store, share one link on Instagram or WhatsApp.
              Customers order. You get paid. No marketplace middleman.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary w-full px-8 py-3.5 text-base sm:w-auto">
                Create merchant account
              </Link>
              <Link
                href="/s/priyas-bakery"
                className="w-full rounded-xl border border-border bg-white px-8 py-3.5 text-base font-medium shadow-sm transition hover:bg-muted sm:w-auto"
              >
                View demo store →
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Merchants manage products · Customers only browse & order
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-white">
          <div className="mx-auto grid max-w-5xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['One link store', 'Share on Instagram bio or WhatsApp status. Customers order in seconds.'],
              ['Merchant dashboard', 'Add products, manage orders, pause the store — only you control the shop.'],
              ['Customer checkout', 'Clean mobile menu, cart, pickup or delivery. No login required for buyers.'],
              ['Direct customers', 'No Zomato or Swiggy cut. Build your own ordering channel.'],
              ['Mobile-first', 'Designed for phones — the way your customers already shop.'],
              ['UPI ready', 'Payment hooks in place. Cash / pay-later works today.'],
            ].map(([title, desc], i) => (
              <div key={title} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        FoodBiz — infrastructure for independent food businesses in India
      </footer>
    </div>
  )
}
