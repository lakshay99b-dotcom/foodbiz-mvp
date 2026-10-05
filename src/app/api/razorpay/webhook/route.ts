import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify signature
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (expected !== signature) {
    console.error('Invalid Razorpay webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  try {
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity || event.payload?.order?.entity
      const notes = payment?.notes || {}
      const foodbizOrderId = notes.foodbiz_order_id
      const razorpayPaymentId = payment?.id || payment?.order_id

      if (foodbizOrderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_id: razorpayPaymentId,
            status: 'confirmed',
          })
          .eq('id', foodbizOrderId)

        // TODO: trigger WhatsApp notification here
      }
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity
      const notes = payment?.notes || {}
      const foodbizOrderId = notes.foodbiz_order_id

      if (foodbizOrderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', foodbizOrderId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
