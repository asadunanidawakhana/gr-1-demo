'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ArrowRight } from 'lucide-react'

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollections() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      setCollections(data || [])
      setLoading(false)
    }
    fetchCollections()
  }, [])

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(40px, 6vw, 80px) 0' }}>
        <div className="container">
          <span className="section-eyebrow" style={{ color: 'var(--gold)' }}>Curated</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>Our Collections</h1>
        </div>
      </div>

      <div className="container section">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--gold)' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
            {collections.map(col => (
              <Link key={col.id} href={`/categories?col=${col.slug}`} className="collection-card" style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  <Image 
                    src={col.image_url || 'https://images.unsplash.com/photo-1441984908796-9039c052e191?q=80&w=800'} 
                    alt={col.title} 
                    fill 
                    style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#fff' }}>
                     <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{col.title}</h3>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{col.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Explore Collection <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {collections.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <p style={{ color: 'var(--text-muted)' }}>No collections available at the moment.</p>
          </div>
        )}
      </div>

      <style>{`
        .collection-card:hover img { transform: scale(1.1); }
        .collection-card:hover h3 { color: var(--gold) !important; }
      `}</style>
    </div>
  )
}
