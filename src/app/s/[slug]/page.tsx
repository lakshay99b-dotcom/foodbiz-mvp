import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Store, Product } from '@/types/database'
import { StoreFront } from './store-front'

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!store) notFound()

  const typedStore = store as Store

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', typedStore.id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  const productList = (products || []) as Product[]

  return <StoreFront store={typedStore} products={productList} />
}
