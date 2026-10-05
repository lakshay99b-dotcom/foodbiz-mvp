'use client'

import { useState } from 'react'
import { formatINR, generateOrderNumber } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Store, Product } from '@/types/database'

interface CartItem {
  product: Product
  quantity: number
}

export function StoreFront({
  store,
  products,
}: {
  store: Store
  products: Product[]
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'menu' | 'checkout' | 'success'>('menu')
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const supabase = createClient()

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const subtotal = cart.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  )
  const deliveryFee =
    orderType === 'delivery' ? Number(store.delivery_fee) : 0
  const total = subtotal + deliveryFee
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (cart.length === 0) {
      setError('Cart is empty')
      setLoading(false)
      return
    }

    if (orderType === 'delivery' && !customerAddress.trim()) {
      setError('Address is required for delivery')
      setLoading(false)
      return
    }

    const ordNum = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: store.id,
        order_number: ordNum,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: orderType === 'delivery' ? customerAddress : null,
        order_type: orderType,
        status: 'pending',
        payment_status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        notes: notes || null,
      })
      .select()
      .single()

    if (orderError || !order) {
      setError(orderError?.message || 'Failed to create order')
      setLoading(false)
      return
    }

    const items = cart.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: Number(i.product.price),
      total_price: Number(i.product.price) * i.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items)

    if (itemsError) {
      setError(itemsError.message)
      setLoading(false)
      return
    }

    setOrderNumber(ordNum)

    // Try Razorpay payment; fall back to COD if not configured
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: total }),
      })
      const data = await res.json()

      if (res.ok && data.id && data.key) {
        // Load Razorpay checkout script
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency || 'INR',
            name: store.name,
            description: `Order #${ordNum}`,
            order_id: data.id,
            prefill: {
              name: customerName,
              contact: customerPhone,
            },
            theme: { color: '#ea580c' },
            handler: async function (response: any) {
              // Payment successful on client — webhook will also confirm
              await supabase
                .from('orders')
                .update({
                  payment_status: 'paid',
                  payment_id: response.razorpay_payment_id,
                  status: 'confirmed',
                })
                .eq('id', order.id)
              setStep('success')
              setLoading(false)
            },
            modal: {
              ondismiss: function () {
                setLoading(false)
                setError('Payment cancelled. You can try again or choose cash.')
              },
            },
          }
          // @ts-ignore
          const rzp = new window.Razorpay(options)
          rzp.open()
        }
        script.onerror = () => {
          // Script failed — fall back to COD
          setStep('success')
          setLoading(false)
        }
        document.body.appendChild(script)
        return
      }
    } catch (e) {
      console.warn('Razorpay unavailable, falling back to COD', e)
    }

    // Fallback: COD / pay later
    setStep('success')
    setLoading(false)
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-border p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">✓</div>
          <h1 className="text-xl font-bold">Order placed!</h1>
          <p className="mt-2 text-muted-foreground">
            Order #{orderNumber}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {store.name} will confirm shortly.
          </p>
          <p className="mt-4 font-semibold text-lg">{formatINR(total)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Payment confirmed or pay via UPI/cash on {orderType}
          </p>
          <button
            onClick={() => {
              setCart([])
              setStep('menu')
              setCustomerName('')
              setCustomerPhone('')
              setCustomerAddress('')
              setNotes('')
            }}
            className="mt-6 w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3"
          >
            Back to menu
          </button>
        </div>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-50 bg-white border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => setStep('menu')}
              className="text-muted-foreground"
            >
              ←
            </button>
            <span className="font-semibold">Checkout</span>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          <form onSubmit={placeOrder} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Order type */}
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-sm font-medium mb-2">How do you want it?</p>
              <div className="flex gap-2">
                {store.pickup_enabled && (
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`flex-1 rounded-xl py-3 text-sm font-medium border ${
                      orderType === 'pickup'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border'
                    }`}
                  >
                    Pickup
                  </button>
                )}
                {store.delivery_enabled && (
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 rounded-xl py-3 text-sm font-medium border ${
                      orderType === 'delivery'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border'
                    }`}
                  >
                    Delivery
                    {Number(store.delivery_fee) > 0 &&
                      ` (+${formatINR(store.delivery_fee)})`}
                  </button>
                )}
              </div>
            </div>

            {/* Customer details */}
            <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="9876543210"
                />
              </div>
              {orderType === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery address
                  </label>
                  <textarea
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Flat, street, landmark"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Less spicy, call on arrival…"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-border p-4 space-y-2">
              {cart.map((i) => (
                <div
                  key={i.product.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {i.quantity}× {i.product.name}
                  </span>
                  <span>
                    {formatINR(Number(i.product.price) * i.quantity)}
                  </span>
                </div>
              ))}
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery fee</span>
                  <span>{formatINR(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3.5 disabled:opacity-60"
            >
              {loading ? 'Placing order…' : `Place order · ${formatINR(total)}`}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Pay via UPI / cash on {orderType}. Online payment coming soon.
            </p>
          </form>
        </main>
      </div>
    )
  }

  // Menu view
  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-5">
          <h1 className="text-xl font-bold">{store.name}</h1>
          {store.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {store.description}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No items available right now.
          </p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id)
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-border p-4 flex gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <p className="mt-1.5 font-medium text-primary">
                      {formatINR(product.price)}
                    </p>
                  </div>
                  <div className="flex items-end">
                    {inCart ? (
                      <div className="flex items-center gap-2 border border-border rounded-xl">
                        <button
                          onClick={() => updateQty(product.id, -1)}
                          className="w-9 h-9 flex items-center justify-center text-lg"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(product.id, 1)}
                          className="w-9 h-9 flex items-center justify-center text-lg"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="rounded-xl border border-primary text-primary font-medium text-sm px-4 py-2"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-border p-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setStep('checkout')}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3.5 flex items-center justify-between px-5"
            >
              <span>
                {cartCount} item{cartCount > 1 ? 's' : ''}
              </span>
              <span>View cart · {formatINR(subtotal)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
