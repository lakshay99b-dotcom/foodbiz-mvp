import { NextResponse } from 'next/server'

// Payment is deferred. This route stays so checkout can fall back to COD
// until Razorpay keys and the razorpay package are added.
export async function POST() {
  return NextResponse.json(
    { error: 'Online payment is not enabled yet. Place the order as cash / pay later.' },
    { status: 503 }
  )
}
