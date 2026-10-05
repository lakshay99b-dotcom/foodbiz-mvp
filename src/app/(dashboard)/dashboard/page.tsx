import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/utils'
import type { Store, Order } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const storeList = (stores || []) as Store[]

  // Fetch recent orders if we have stores
  let recentOrders: Order[] = []
  if (storeList.length > 0) {
    const storeIds = storeList.map((s) => s.id)
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .in('store_id', storeIds)
      .order('created_at', { ascending: false })
      .limit(10)
    recentOrders = (orders || []) as Order[]
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-primary">FoodBiz</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-muted-foreground">
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your stores and orders
          </p>
        </div>

        {/* Stores */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your stores</h2>
            <Link
              href="/dashboard/stores/new"
              className="text-sm font-medium text-primary"
            >
              + New store
            </Link>
          </div>

          {storeList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-6 text-center">
              <p className="text-muted-foreground mb-4">
                You don&apos;t have a store yet.
              </p>
              <Link
                href="/dashboard/stores/new"
                className="inline-flex rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3"
              >
                Create your first store
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {storeList.map((store) => (
                <Link
                  key={store.id}
                  href={`/dashboard/stores/${store.id}`}
                  className="block bg-white rounded-2xl border border-border p-4 hover:border-primary/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        foodbiz.app/s/{store.slug}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        store.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {store.is_active ? 'Live' : 'Inactive'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent orders */}
        {recentOrders.length > 0 && (
          <section>
            <h2 className="font-semibold mb-3">Recent orders</h2>
            <div className="bg-white rounded-2xl border border-border divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      #{order.order_number} · {order.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.order_type} · {order.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatINR(order.total_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.payment_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
