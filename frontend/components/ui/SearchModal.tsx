'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100) }
    else { setQuery(''); setResults([]) }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, images')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(6)
      setResults(data || [])
      setLoading(false)
    }, 300)
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
              zIndex: 301, width: 'min(640px, calc(100vw - 32px))',
              background: '#fff', borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', gap: 12 }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for products..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
              />
              {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />}
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div style={{ padding: 8, maxHeight: 380, overflowY: 'auto' }}>
                {results.map(product => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', textDecoration: 'none', borderRadius: 8,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 48, height: 56, borderRadius: 6, overflow: 'hidden', background: '#f0ece6', flexShrink: 0 }}>
                      {product.images?.[0] && (
                        <Image src={product.images[0]} alt={product.name} width={48} height={56} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{product.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginTop: 2 }}>Rs. {product.price.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
                <Link href={`/categories?q=${query}`} onClick={onClose} style={{ display: 'block', textAlign: 'center', padding: '12px', color: 'var(--gold)', fontSize: 13, fontWeight: 600, textDecoration: 'none', borderTop: '1px solid var(--border)', marginTop: 8 }}>
                  See all results for "{query}"
                </Link>
              </div>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No products found for "{query}"
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
