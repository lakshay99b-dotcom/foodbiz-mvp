'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

export default function NewStorePage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleNameChange(value: string) {
    setName(value)
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('stores')
      .insert({
        owner_id: user.id,
        name,
        slug: slugify(slug),
        description: description || null,
        whatsapp_number: whatsapp || null,
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        setError('This store link is already taken. Try another.')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    router.push(`/dashboard/stores/${data.id}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground">
            ←
          </Link>
          <span className="font-semibold">Create store</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Store name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Priya's Home Bakery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Store link</label>
            <div className="flex items-center gap-1 rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
              <span className="pl-3 text-sm text-muted-foreground whitespace-nowrap">
                /s/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-1 py-2.5 text-base focus:outline-none"
                placeholder="priyas-bakery"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Only lowercase letters, numbers and hyphens
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Short description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              placeholder="Fresh cakes & cookies made with love"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              WhatsApp number for order alerts
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="9876543210"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create store'}
          </button>
        </form>
      </main>
    </div>
  )
}
