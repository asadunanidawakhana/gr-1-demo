'use client'

import { useEffect, useState } from 'react'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { toast } from '@/lib/toast'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    const saved = localStorage.getItem('wishlist')
    if (saved) setWishlist(JSON.parse(saved))
  }, [])

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter(item => item.id !== id)
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
    toast.success('Removed from wishlist')
  }

  const moveToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      slug: product.slug,
      size: '',
      color: ''
    })
    removeFromWishlist(product.id)
    toast.success('Moved to cart')
  }

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(40px, 6vw, 80px) 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800 }}>My Wishlist</h1>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 0 100px' }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
              <Heart size={40} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Save your favorite items to keep track of them.</p>
            <Link href="/categories" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
            {wishlist.map(product => (
              <div key={product.id} className="card product-card" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', background: '#f0ece6' }}>
                  {product.images?.[0] && (
                    <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                  )}
                  <button onClick={() => removeFromWishlist(product.id)} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{product.name}</h3>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 20 }}>Rs. {product.price.toLocaleString()}</div>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => moveToCart(product)} className="btn btn-primary" style={{ flex: 1, height: 44, fontSize: 13 }}>
                      <ShoppingBag size={16} /> Add to Cart
                    </button>
                    <Link href={`/product/${product.slug}`} className="btn btn-outline" style={{ padding: '0 12px', height: 44 }}>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
