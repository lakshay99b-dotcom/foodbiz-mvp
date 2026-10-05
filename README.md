# FoodBiz MVP

Mobile-first SaaS for Indian home bakers, cloud kitchens, tiffin sellers and small food businesses.

Merchants create a mini online store, share one link (Instagram / WhatsApp bio). Customers browse, order (pickup or delivery), and pay. Merchants get order notifications.

**Not another Zomato** — this is infrastructure so small food businesses own their direct customer orders with zero marketplace commissions.

## Stack

- **Next.js 16** (App Router) + React + TypeScript
- **Supabase** (Auth, PostgreSQL, Row Level Security)
- **Tailwind CSS**
- **Vercel** (deployment target)
- Razorpay / WhatsApp (next phase)

## Features (MVP)

- [x] Merchant signup / login (Supabase Auth)
- [x] Merchant dashboard
- [x] Store creation + custom slug link (`/s/your-store`)
- [x] Product CRUD (name, price, availability)
- [x] Customer ordering flow (mobile-first)
- [x] Pickup / home-delivery option
- [x] Delivery fee support
- [x] Order management for merchants
- [x] Secure multi-tenant DB with RLS
- [ ] Daily order limits (schema ready)
- [ ] Razorpay UPI payment + webhooks
- [ ] WhatsApp order notifications
- [ ] Basic analytics
- [ ] Image uploads (Supabase Storage)

## Local development

```bash
cp .env.example .env.local
# Fill in Supabase URL + anon key

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

PostgreSQL schema lives in Supabase project `foodbiz-mvp` (ap-south-1).

Tables: `profiles`, `stores`, `products`, `orders`, `order_items`.

All tables have Row Level Security. Merchants only see their own data. Public can view active stores and place orders.

## Project structure

```
src/
  app/
    (auth)/          # login, signup
    (dashboard)/     # merchant dashboard + store management
    s/[slug]/        # public customer storefront
    auth/signout/    # logout route
  lib/
    supabase/        # browser + server clients + middleware
    utils.ts
  types/
    database.ts
```

## Roadmap

1. Razorpay payment integration + webhook confirmation
2. WhatsApp Cloud API notifications
3. Product images via Supabase Storage
4. Daily order / product limits enforcement
5. Simple analytics (orders today, revenue)
6. Multi-store support polish

## License

Private — all rights reserved.
