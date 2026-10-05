import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, amount } = body // amount in INR rupees

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order or amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()

    // Verify the order exists and is still pending payment
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status, store_id')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Amount must be in paise
    const amountInPaise = Math.round(Number(amount) * 100)

    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        foodbiz_order_id: orderId,
        store_id: order.store_id,
      },
    })

    // Save Razorpay order id on our order
    await supabase
      .from('orders')
      .update({ payment_id: rpOrder.id })
      .eq('id', orderId)

    return NextResponse.json({
      id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key: keyId,
    })
  } catch (err: any) {
    console.error('Razorpay create-order error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
