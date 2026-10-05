import { NextResponse } from 'next/server'

// Webhook stub until Razorpay is configured.
export async function POST() {
  return NextResponse.json({ received: true, configured: false })
}
