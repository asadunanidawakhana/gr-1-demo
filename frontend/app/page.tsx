'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Shirt, 
  ShoppingBag, 
  Watch, 
  Baby, 
  Snowflake, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  RefreshCw,
  Tractor as Jeans,
  Ghost as Hoodie,
  Layers as Jacket,
  Activity as Accessories
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ProductCard, { ProductCardSkeleton } from '@/components/ui/ProductCard'

// Category icons/data

const CATEGORIES_GRID = [
  { name: 'Men Wear', slug: 'men-wear', icon: Shirt },
  { name: 'Women Wear', slug: 'women-wear', icon: Sparkles },
  { name: 'Jeans', slug: 'jeans', icon: Jeans },
  { name: 'Hoodies', slug: 'hoodies', icon: Hoodie },
  { name: 'T-Shirts', slug: 't-shirts', icon: Shirt },
  { name: 'Shirts', slug: 'shirts', icon: Shirt },
  { name: 'Jackets', slug: 'jackets', icon: Jacket },
  { name: 'Shoes', slug: 'shoes', icon: ShoppingBag },
  { name: 'Watches', slug: 'watches', icon: Watch },
  { name: 'Accessories', slug: 'accessories', icon: Accessories },
  { name: 'Kids Wear', slug: 'kids-wear', icon: Baby },
  { name: 'Winter', slug: 'winter-collection', icon: Snowflake },
]

interface Product {
  id: string; name: string; slug: string; price: number;
  compare_price?: number | null; images: string[];
  is_best_seller?: boolean; is_featured?: boolean
}
interface Banner { id: string; title: string; subtitle?: string; cta_text?: string; cta_link?: string; image_url: string }
interface Collection { id: string; title: string; slug: string; description?: string; image_url?: string }
interface Category { id: string; name: string; slug: string; image_url?: string }

export default function HomePage() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [banners, setBanners] = useState<Banner[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return
    setSlideIndex(i => (i + 1) % banners.length)
  }, [banners.length])

  const prevSlide = () => {
    if (banners.length === 0) return
    setSlideIndex(i => (i - 1 + banners.length) % banners.length)
  }

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(nextSlide, 7000)
    return () => clearInterval(timer)
  }, [nextSlide, banners.length])

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const [bannersRes, featuredRes, bestSellersRes, collectionsRes, categoriesRes] = await Promise.all([
        supabase.from('banners').select('*').eq('type', 'hero').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('id,name,slug,price,compare_price,images,is_featured,is_best_seller').eq('is_featured', true).eq('is_active', true).limit(8),
        supabase.from('products').select('id,name,slug,price,compare_price,images,is_featured,is_best_seller').eq('is_best_seller', true).eq('is_active', true).limit(8),
        supabase.from('collections').select('*').eq('is_featured', true).eq('is_active', true).order('sort_order').limit(4),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ])
      setBanners(bannersRes.data || [])
      setFeaturedProducts(featuredRes.data || [])
      setBestSellers(bestSellersRes.data || [])
      setCollections(collectionsRes.data || [])
      setCategories(categoriesRes.data || [])
      setLoadingProducts(false)
    }
    fetchData()
  }, [])

  const slides = banners.map(b => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || '',
    cta: b.cta_text || 'Shop Now',
    href: b.cta_link || '/categories',
    image: b.image_url,
    accent: '#C9A66B'
  }))

  return (
    <div className="page-enter">

      {/* ═══════════════════════════════════════
          HERO SLIDER
      ═══════════════════════════════════════ */}
      {slides.length > 0 && (
        <section style={{ position: 'relative', height: 'clamp(480px, 80vh, 780px)', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {slides.map((slide, i) => i === slideIndex && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--dark)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {slide.image && (
                  <Image src={slide.image} alt={slide.title} fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority={i === 0} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
                      hidden: {}
                    }}
                    style={{ maxWidth: 600 }}
                  >
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: slide.accent, marginBottom: 16 }}
                    >
                      Premium Collection 2026
                    </motion.div>
                    
                    <h1 style={{
                      fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                      fontWeight: 800, color: '#fff', lineHeight: 1.05,
                      letterSpacing: '-0.02em', marginBottom: 20,
                      whiteSpace: 'pre-line',
                      overflow: 'hidden'
                    }}>
                      {slide.title.split('').map((char, index) => (
                        <motion.span
                          key={index}
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 }
                          }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </h1>

                    <motion.p 
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      transition={{ duration: 0.8 }}
                      style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'rgba(255,255,255,0.75)', marginBottom: 36, lineHeight: 1.6, maxWidth: 460 }}
                    >
                      {slide.subtitle}
                    </motion.p>

                    <motion.div 
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                    >
                      <Link href={slide.href} className="btn btn-gold btn-lg">
                        {slide.cta}
                      </Link>
                      <Link href="/categories" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
                        View All
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Slider Controls */}
          {slides.length > 1 && (
            <>
              <button onClick={prevSlide} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextSlide} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setSlideIndex(i)} style={{
                    width: i === slideIndex ? 24 : 8, height: 8,
                    borderRadius: 4, background: i === slideIndex ? '#C9A66B' : 'rgba(255,255,255,0.4)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0
                  }} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════
          FEATURED CATEGORIES
      ═══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Browse By</div>
            <h2 className="heading-xl">Featured Categories</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12
          }}>
            {CATEGORIES_GRID.map(cat => {
              const dbCat = categories.find(c => c.slug === cat.slug)
              return (
                <Link key={cat.slug} href={`/categories?cat=${cat.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    padding: '20px 12px', borderRadius: 10,
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    transition: 'all 0.3s ease', cursor: 'pointer'
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--gold)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
                  >
                    {dbCat?.image_url ? (
                      <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden' }}>
                        <Image src={dbCat.image_url} alt={cat.name} width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </div>
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: 8, background: 'linear-gradient(135deg, #f0ece6, #e8ddd0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                        <cat.icon size={24} />
                      </div>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.3 }}>
                      {cat.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', marginBottom: 40 }}>
            <div>
              <div className="section-eyebrow">Handpicked</div>
              <h2 className="heading-xl">Featured Items</h2>
            </div>
            <Link href="/categories?featured=true" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {loadingProducts
              ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.length > 0
                ? featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
                : <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 48 }}>Products coming soon. Add products from the admin panel.</p>
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COLLECTIONS EDITORIAL
      ═══════════════════════════════════════ */}
      {collections.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <div className="section-eyebrow">Curated</div>
              <h2 className="heading-xl">Premium Collections</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {collections.map((col, i) => (
                <Link key={col.id} href={`/collections/${col.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    position: 'relative', borderRadius: 12, overflow: 'hidden',
                    aspectRatio: i === 0 ? '16/9' : '4/5',
                    background: '#1a1a1a',
                    gridColumn: i === 0 ? '1/-1' : undefined,
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                  >
                    {col.image_url && (
                      <Image src={col.image_url} alt={col.title} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
                      <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: i === 0 ? 28 : 20, fontWeight: 700, marginBottom: 6 }}>{col.title}</h3>
                      {col.description && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{col.description}</p>}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          BEST SELLERS
      ═══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <div className="section-eyebrow">Trending Now</div>
              <h2 className="heading-xl">Best Sellers</h2>
            </div>
            <Link href="/categories?sort=best_seller" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {loadingProducts
              ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : bestSellers.length > 0
                ? bestSellers.map(p => <ProductCard key={p.id} product={p} />)
                : featuredProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROMO BANNER
      ═══════════════════════════════════════ */}
      <section style={{ 
        position: 'relative', 
        padding: 'clamp(48px, 8vw, 80px) 0', 
        backgroundImage: 'url(/images/promo-bg-v2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>
            Limited Time Offer
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Free Delivery on Orders<br />
            <span style={{ color: 'var(--gold)' }}>Above Rs. 2,000</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 36 }}>
            Shop your favorite styles and get free delivery across Pakistan
          </p>
          <Link href="/categories" className="btn btn-gold btn-lg">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW WE PACK OUR CUSTOMER
      ═══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 64, 
            alignItems: 'center' 
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="section-eyebrow">Our Process</div>
              <h2 className="heading-xl" style={{ marginBottom: 24 }}>How We Pack Your Orders</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                At Aurangzaib Garments, we believe that the unboxing experience should be as premium as the garments themselves. Every piece is carefully inspected, folded with precision, and wrapped in eco-friendly protective layers.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                We use custom-designed packaging that ensures your items arrive in pristine condition, ready to wear. Our commitment to quality extends from the first stitch to the moment it reaches your doorstep.
              </p>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>100%</div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Safe Delivery</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>Eco</div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Materials</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              style={{ 
                position: 'relative', 
                borderRadius: 24, 
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                aspectRatio: '9/16',
                maxWidth: 400,
                margin: '0 auto'
              }}
            >
              <video 
                src="/videos/packing.mp4" 
                autoPlay 
                muted 
                loop 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                pointerEvents: 'none'
              }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHAT WE OFFER (CATEGORIES)
      ═══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow">Our Catalog</div>
            <h2 className="heading-xl">What We Offer</h2>
            <p style={{ maxWidth: 600, margin: '16px auto 0', color: 'var(--text-muted)' }}>
              From classic essentials to contemporary trends, explore our diverse range of premium garments tailored for every style and occasion.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 24,
            marginTop: 48
          }}>
            {CATEGORIES_GRID.map((cat, idx) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Link href={`/categories?cat=${cat.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: 32,
                    borderRadius: 20,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 16
                  }}
                  onMouseEnter={e => { 
                    const el = e.currentTarget; 
                    el.style.borderColor = 'var(--gold)'; 
                    el.style.transform = 'translateY(-8px)';
                    el.style.boxShadow = '0 12px 24px rgba(201, 166, 107, 0.15)';
                  }}
                  onMouseLeave={e => { 
                    const el = e.currentTarget; 
                    el.style.borderColor = 'var(--border)'; 
                    el.style.transform = 'none';
                    el.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ 
                      width: 56, 
                      height: 56, 
                      borderRadius: 14, 
                      background: 'rgba(201, 166, 107, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'var(--gold)' 
                    }}>
                      <cat.icon size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>{cat.name}</h3>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        Explore our latest {cat.name.toLowerCase()} collection featuring premium quality and modern designs.
                      </p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>
                      View Collection <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Nationwide delivery in 3–5 days' },
              { icon: ShieldCheck, title: 'Premium Quality', desc: 'Handpicked, quality-assured garments' },
              { icon: CreditCard, title: 'Cash on Delivery', desc: 'Pay safely when you receive' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free return policy' },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ color: 'var(--gold)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <item.icon size={40} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--dark)' }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
