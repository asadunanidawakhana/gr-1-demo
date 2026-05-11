'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Download, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface Catalog {
  id: string; title: string; season: string; year: number;
  image_url: string; pdf_url: string;
}

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('catalogs').select('*').eq('is_active', true).order('year', { ascending: false }).then(({ data }) => {
      setCatalogs(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', color: '#fff', padding: '100px 0 60px', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Lookbooks</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, marginBottom: 24 }}>Seasonal Catalogs</h1>
          <p style={{ maxWidth: 600, margin: '0 auto', color: 'rgba(255,255,255,0.6)', fontSize: 18, lineHeight: 1.6 }}>
            Explore our curated collections through our seasonal lookbooks. Download the high-quality PDF versions for inspiration.
          </p>
        </div>
      </div>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={40} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
          ) : catalogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: 'var(--text-muted)' }}>No catalogs available at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 40 }}>
              {catalogs.map(catalog => (
                <div key={catalog.id} className="card" style={{ overflow: 'hidden', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f0ece6' }}>
                    {catalog.image_url && (
                      <Image src={catalog.image_url} alt={catalog.title} fill style={{ objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
                      {catalog.pdf_url && (
                        <a href={catalog.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: 48, height: 48, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Download size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                      {catalog.season} {catalog.year}
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{catalog.title}</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={16} /> Lookbook PDF
                      </span>
                      <a href={catalog.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        View Catalog <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
