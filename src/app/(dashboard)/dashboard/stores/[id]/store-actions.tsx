'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function StoreActions({
  storeId,
  isActive,
}: {
  storeId: string
  isActive: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive() {
    setLoading(true)
    await supabase
      .from('stores')
      .update({ is_active: !isActive })
      .eq('id', storeId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggleActive}
      disabled={loading}
      className="text-sm font-medium border border-border rounded-lg px-3 py-1.5 disabled:opacity-60"
    >
      {loading ? '…' : isActive ? 'Pause store' : 'Go live'}
    </button>
  )
}
