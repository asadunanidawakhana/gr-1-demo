'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import ProductCard from '@/components/ui/ProductCard'
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Zap, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_price?: number | null;
  images: string[];
  sizes?: string[] | null;
  colors?: string[] | null;
  stock?: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  tags?: string[];
  category_id?: string | null;
  is_active?: boolean;
  categories?: { name: string; slug: string } | null;
}
interface Review { id: string; rating: number; title: string | null; body: string | null; created_at: string; profiles?: { full_name: string | null } }

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { addItem } = useCart()
  const { profile } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [imgZoomed, setImgZoomed] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (!data) { notFound(); return }
      
      // Handle Supabase returning categories as an array
      const formattedProduct = {
        ...data,
        categories: Array.isArray(data.categories) ? data.categories[0] : data.categories
      }
      
      setProduct(formattedProduct)
      setSelectedSize(data.sizes?.[0] || '')
      setSelectedColor(data.colors?.[0] || '')

      // Fetch reviews
      const { data: revData } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', data.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setReviews(revData || [])

      // Fetch related
      if (data.category_id) {
        const { data: relData } = await supabase
          .from('products')
          .select('id,name,slug,price,compare_price,images,is_best_seller,is_featured')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .eq('is_active', true)
          .limit(4)
        
        if (relData) {
          // Add null categories to match Product interface
          const formattedRelated = relData.map(p => ({ ...p, categories: null }))
          setRelated(formattedRelated as Product[])
        }
      }
      setLoading(false)
    }
    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 12 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: 32, width: '70%' }} />
            <div className="skeleton" style={{ height: 24, width: '40%' }} />
            <div className="skeleton" style={{ height: 80 }} />
            <div className="skeleton" style={{ height: 48 }} />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : null
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) { toast.error('Please select a size'); return }
    addItem({
      id: product.id, name: product.name, price: product.price,
      image: product.images[0] || '', size: selectedSize,
      color: selectedColor, slug: product.slug
    }, quantity)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const submitReview = async () => {
    if (!profile) { toast.error('Please login to leave a review'); return }
    setSubmittingReview(true)
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: profile.id,
      rating: newReview.rating,
      title: newReview.title,
      body: newReview.body,
      is_verified: true
    })
    setSubmittingReview(false)
    if (error) {
      if (error.code === '23505') toast.error('You have already reviewed this product')
      else toast.error(error.message)
    } else {
      toast.success('Review submitted successfully')
      setShowReviewForm(false)
      setNewReview({ rating: 5, title: '', body: '' })
      // Refresh reviews
      const { data } = await supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', product.id).order('created_at', { ascending: false })
      setReviews(data || [])
    }
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link href="/categories" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Shop</Link>
          {product.categories && (
            <><span>/</span><Link href={`/categories?cat=${product.categories.slug}`} style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>{product.categories.name}</Link></>
          )}
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(280px, 50%, 600px) 1fr', gap: 'clamp(24px, 4vw, 64px)', alignItems: 'start' }}>

          {/* Images */}
          <div>
            {/* Main Image */}
            <div
              style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden', background: '#f0ece6', cursor: imgZoomed ? 'zoom-out' : 'zoom-in', marginBottom: 12 }}
              onClick={() => setImgZoomed(!imgZoomed)}
            >
              {product.images && product.images[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover', transition: 'transform 0.4s ease', transform: imgZoomed ? 'scale(1.5)' : 'scale(1)' }}
                  priority
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No Image</div>
              )}

              {discount && <span className="product-card-badge">-{discount}%</span>}
              {product.is_best_seller && <span className="product-card-badge gold" style={{ top: discount ? 40 : 12 }}>Best Seller</span>}

              {product.images && product.images.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + product.images.length) % product.images.length) }} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % product.images.length) }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} style={{ flexShrink: 0, width: 72, height: 80, borderRadius: 6, overflow: 'hidden', border: i === activeImage ? '2px solid var(--gold)' : '2px solid var(--border)', cursor: 'pointer', padding: 0, background: '#f0ece6' }}>
                    <Image src={img} alt="" width={72} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {product.categories && (
              <Link href={`/categories?cat=${product.categories.slug}`} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>{product.categories.name}</Link>
            )}

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: 'var(--dark)', lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= avgRating ? '#C9A66B' : 'none'} color={s <= avgRating ? '#C9A66B' : 'var(--border)'} />)}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: 'var(--dark)', fontFamily: 'var(--font-heading)' }}>
                Rs. {product.price.toLocaleString()}
              </span>
              {product.compare_price && (
                <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  Rs. {product.compare_price.toLocaleString()}
                </span>
              )}
              {discount && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>Save {discount}%</span>}
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: (product.stock ?? 0) > 0 ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
              <span style={{ color: (product.stock ?? 0) > 0 ? '#15803d' : '#ef4444', fontWeight: 600 }}>
                {(product.stock ?? 0) > 10 ? 'In Stock' : (product.stock ?? 0) > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="form-label">Size: <strong>{selectedSize}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`size-btn${selectedSize === size ? ' selected' : ''}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="form-label" style={{ display: 'block', marginBottom: 10 }}>Color: <strong>{selectedColor}</strong></span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)} style={{
                      padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 500,
                      border: selectedColor === color ? '2px solid var(--dark)' : '1.5px solid var(--border)',
                      background: selectedColor === color ? 'var(--dark)' : '#fff',
                      color: selectedColor === color ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="form-label" style={{ display: 'block', marginBottom: 10 }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--border)', borderRadius: 6, width: 'fit-content', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 44, height: 44, border: 'none', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 18, color: 'var(--text-primary)', borderRight: '1px solid var(--border)' }}>−</button>
                <span style={{ width: 56, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} style={{ width: 44, height: 44, border: 'none', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 18, color: 'var(--text-primary)', borderLeft: '1px solid var(--border)' }}>+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={handleAddToCart} className="btn btn-outline" disabled={product.stock === 0} style={{ flex: 1, minWidth: 140 }}>
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn btn-primary" disabled={product.stock === 0} style={{ flex: 1, minWidth: 140 }}>
                <Zap size={16} /> Buy Now
              </button>
              <button onClick={() => setWishlist(!wishlist)} style={{ width: 48, height: 48, border: '1.5px solid var(--border)', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: wishlist ? '#ef4444' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                <Heart size={18} fill={wishlist ? '#ef4444' : 'none'} />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }} style={{ width: 48, height: 48, border: '1.5px solid var(--border)', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                <Share2 size={18} />
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, color: 'var(--text-secondary)' }}>Description</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* COD Notice */}
            <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>🚚</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#854d0e' }}>Cash on Delivery Available</div>
                <div style={{ fontSize: 12, color: '#713f12', marginTop: 2 }}>Free delivery on orders above Rs. 2,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 className="heading-lg" style={{ margin: 0 }}>Customer Reviews</h2>
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn btn-outline" style={{ height: 40, fontSize: 13 }}>
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <div className="card" style={{ padding: 32, marginBottom: 40, background: '#fafafa', border: '2px solid var(--gold)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setNewReview({ ...newReview, rating: s })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Star size={24} fill={s <= newReview.rating ? '#C9A66B' : 'none'} color={s <= newReview.rating ? '#C9A66B' : '#cbd5e1'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Title (Optional)</label>
                  <input className="form-input" value={newReview.title} onChange={e => setNewReview({ ...newReview, title: e.target.value })} placeholder="Great quality!" />
                </div>
                <div className="form-group">
                  <label className="form-label">Review Body</label>
                  <textarea className="form-input" value={newReview.body} onChange={e => setNewReview({ ...newReview, body: e.target.value })} placeholder="Tell us what you liked..." rows={4} />
                </div>
                <button onClick={submitReview} disabled={submittingReview} className="btn btn-primary" style={{ width: 'fit-content', padding: '0 40px' }}>
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reviews.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this product!</div>
            ) : reviews.map(review => (
                <div key={review.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{review.profiles?.full_name || 'Anonymous'}</div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= review.rating ? '#C9A66B' : 'none'} color={s <= review.rating ? '#C9A66B' : 'var(--border)'} />)}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  {review.title && <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{review.title}</div>}
                  {review.body && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.body}</p>}
                </div>
              ))}
            </div>
          </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
            <h2 className="heading-lg" style={{ marginBottom: 32 }}>You May Also Like</h2>
            <div className="product-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: clamp(280px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
