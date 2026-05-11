'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductCard, { ProductCardSkeleton } from '@/components/ui/ProductCard'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; price: number;
  compare_price?: number | null; images: string[];
  is_best_seller?: boolean; is_featured?: boolean
}
interface Category { id: string; name: string; slug: string }

const PRICE_RANGES = [
  { label: 'Under Rs. 1,000', min: 0, max: 1000 },
  { label: 'Rs. 1,000 – 2,500', min: 1000, max: 2500 },
  { label: 'Rs. 2,500 – 5,000', min: 2500, max: 5000 },
  { label: 'Above Rs. 5,000', min: 5000, max: 999999 },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Best Sellers', value: 'best_seller' },
]

function CategoriesContent() {
  const searchParams = useSearchParams()
  const catSlug = searchParams.get('cat')
  const colSlug = searchParams.get('col')
  const sortParam = searchParams.get('sort')
  const featuredParam = searchParams.get('featured')
  const queryParam = searchParams.get('q')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<{id: string, title: string, slug: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(catSlug || '')
  const [activeCollection, setActiveCollection] = useState(colSlug || '')
  const [activePriceRange, setActivePriceRange] = useState<typeof PRICE_RANGES[0] | null>(null)
  const [sort, setSort] = useState(sortParam === 'best_seller' ? 'best_seller' : 'created_at:desc')
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    supabase.from('categories').select('id,name,slug').eq('is_active', true).order('sort_order').then(({ data }) => setCategories(data || []))
    supabase.from('collections').select('id,title,slug').eq('is_active', true).then(({ data }) => setCollections(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(0)
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeCollection, activePriceRange, sort, queryParam, featuredParam])

  async function fetchProducts() {
    let query = supabase.from('products').select('id,name,slug,price,compare_price,images,is_featured,is_best_seller', { count: 'exact' }).eq('is_active', true)
    if (activeCategory) {
      const cat = categories.find(c => c.slug === activeCategory)
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (activeCollection) {
      const col = collections.find(c => c.slug === activeCollection)
      if (col) query = query.eq('collection_id', col.id)
    }
    if (activePriceRange) query = query.gte('price', activePriceRange.min).lte('price', activePriceRange.max)
    if (featuredParam === 'true') query = query.eq('is_featured', true)
    if (sort === 'best_seller') query = query.eq('is_best_seller', true)
    if (queryParam) query = query.ilike('name', `%${queryParam}%`)
    if (sort !== 'best_seller') {
      const [col, dir] = sort.split(':')
      query = query.order(col, { ascending: dir === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    query = query.range(0, PAGE_SIZE - 1)
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const clearFilters = () => {
    setActiveCategory('')
    setActiveCollection('')
    setActivePriceRange(null)
    setSort('created_at:desc')
  }

  const hasFilters = activeCategory || activeCollection || activePriceRange

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ background: 'var(--dark)', padding: 'clamp(32px, 5vw, 56px) 0' }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
            {activeCategory ? categories.find(c => c.slug === activeCategory)?.name : activeCollection ? 'Collection' : 'All Products'}
          </div>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {queryParam ? `Search: "${queryParam}"` : activeCategory ? categories.find(c => c.slug === activeCategory)?.name : activeCollection ? collections.find(c => c.slug === activeCollection)?.title : 'Shop All'}
          </h1>
        </div>
      </div>

      <div className="container section">
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setFilterOpen(!filterOpen)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={16} /> Filters {hasFilters && <span style={{ background: 'var(--gold)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={14} /> Clear
              </button>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{products.length} products</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sort by:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 32px 8px 12px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', appearance: 'none', background: '#fff', color: 'var(--text-primary)', outline: 'none' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Filter Sidebar */}
          {filterOpen && (
            <div className="filter-sidebar" style={{ minWidth: 220, width: 220 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 20 }}>Categories</div>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.slug ? '' : cat.slug)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px',
                  background: activeCategory === cat.slug ? 'var(--dark)' : 'transparent',
                  color: activeCategory === cat.slug ? '#fff' : 'var(--text-primary)',
                  border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer',
                  fontWeight: activeCategory === cat.slug ? 600 : 400, transition: 'all 0.2s',
                  marginBottom: 2
                }}>
                  {cat.name}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 20, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 20 }}>Price Range</div>
              {PRICE_RANGES.map(range => (
                <button key={range.label} onClick={() => setActivePriceRange(activePriceRange?.label === range.label ? null : range)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px',
                  background: activePriceRange?.label === range.label ? 'var(--dark)' : 'transparent',
                  color: activePriceRange?.label === range.label ? '#fff' : 'var(--text-primary)',
                  border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 2
                }}>
                  {range.label}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            <div className="product-grid">
              {loading
                ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.length > 0
                  ? products.map(p => <ProductCard key={p.id} product={p} />)
                  : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No products found</h3>
                      <p>Try changing your filters or search term</p>
                      <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: 20 }}>Clear Filters</button>
                    </div>
                  )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return <Suspense fallback={<div className="container section"><div className="product-grid">{Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}</div></div>}>
    <CategoriesContent />
  </Suspense>
}
