import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-primary">FoodBiz</span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-primary text-primary-foreground rounded-lg px-4 py-2"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Your own store.
            <br />
            <span className="text-primary">Zero commissions.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Built for Indian home bakers, cloud kitchens & tiffin sellers.
            Create a mobile store, share one link, accept orders & UPI payments.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold px-8 py-3.5 text-base shadow-sm hover:bg-orange-600 transition"
            >
              Create your store — Free
            </Link>
            <Link
              href="/s/demo"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white font-medium px-8 py-3.5 text-base hover:bg-muted transition"
            >
              See demo store
            </Link>
          </div>
        </section>

        <section className="bg-white border-y border-border">
          <div className="max-w-5xl mx-auto px-4 py-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "One link store",
                desc: "Share on Instagram bio or WhatsApp status. Customers order in seconds.",
              },
              {
                title: "UPI payments",
                desc: "Razorpay integration. Money goes directly to you. No marketplace cut.",
              },
              {
                title: "WhatsApp alerts",
                desc: "Get order notifications instantly on WhatsApp so you never miss one.",
              },
              {
                title: "Pickup & delivery",
                desc: "Set delivery radius, fees, and daily order limits. Stay in control.",
              },
              {
                title: "Mobile-first",
                desc: "Designed for phones. Your customers and you both use it on mobile.",
              },
              {
                title: "Own your customers",
                desc: "No Zomato/Swiggy middleman. Build your own direct ordering channel.",
              },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-2xl bg-muted/50">
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        FoodBiz — Infrastructure for independent food businesses in India
      </footer>
    </div>
  );
}
