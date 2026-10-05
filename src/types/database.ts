export type OrderType = 'pickup' | 'delivery'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  owner_id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  whatsapp_number: string | null
  pickup_enabled: boolean
  delivery_enabled: boolean
  delivery_fee: number
  delivery_radius_km: number | null
  daily_order_limit: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  daily_limit: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  store_id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string | null
  order_type: OrderType
  status: OrderStatus
  payment_status: PaymentStatus
  payment_id: string | null
  subtotal: number
  delivery_fee: number
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}
