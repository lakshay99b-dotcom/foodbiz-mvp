import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/utils'
import type { Store, Product, Order } from '@/types/database'
import { StoreActions } from './store-actions'

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!store) notFound()

  const typedStore = store as Store

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', id)
    .order('sort_order', { ascending: true })

  const productList = (products || []) as Product[]

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const orderList = (orders || []) as Order[]

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground">
            ←
          </Link>
          <span className="font-semibold truncate">{typedStore.name}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Store info */}
        <section className="bg-white rounded-2xl border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold">{typedStore.name}</h1>
              <p className="text-sm text-muted-foreground">
                foodbiz.app/s/{typedStore.slug}
              </p>
              {typedStore.description && (
                <p className="mt-1 text-sm">{typedStore.description}</p>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                typedStore.is_active
                  ? 'bg-green-50 text-green-700'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {typedStore.is_active ? 'Live' : 'Inactive'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/s/${typedStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5"
            >
              View store →
            </a>
            <StoreActions storeId={typedStore.id} isActive={typedStore.is_active} />
          </div>
        </section>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Products ({productList.length})</h2>
            <Link
              href={`/dashboard/stores/${id}/products/new`}
              className="text-sm font-medium text-primary"
            >
              + Add product
            </Link>
          </div>

          {productList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-5 text-center text-muted-foreground text-sm">
              No products yet. Add your first item.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border divide-y divide-border">
              {productList.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatINR(p.price)}
                      {!p.is_available && ' · Unavailable'}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/stores/${id}/products/${p.id}`}
                    className="text-sm text-primary shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orders */}
        <section>
          <h2 className="font-semibold mb-3">Orders ({orderList.length})</h2>
          {orderList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-5 text-center text-muted-foreground text-sm">
              No orders yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border divide-y divide-border">
              {orderList.map((order) => (
                <div key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        #{order.order_number} · {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_phone} · {order.order_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatINR(order.total_amount)}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {order.status} · {order.payment_status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
