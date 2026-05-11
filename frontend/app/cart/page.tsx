'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart()

  const DELIVERY_FEE = totalPrice >= 2000 ? 0 : 200
  const grandTotal = totalPrice + DELIVERY_FEE

  if (items.length === 0) {
    return (
      <div className="page-enter container section" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={64} color="var(--border)" style={{ marginBottom: 24 }} />
        <h1 className="heading-lg" style={{ marginBottom: 12 }}>Your cart is empty</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Add some items to get started</p>
        <Link href="/categories" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(24px, 4vw, 40px) 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800 }}>
            Shopping Cart <span style={{ color: 'var(--gold)', fontSize: '0.7em' }}>({totalItems} items)</span>
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, alignItems: 'start' }}>

          {/* Cart Items */}
          <div>
            {items.map(item => (
              <div key={`${item.id}-${item.size}-${item.color}`} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                <Link href={`/product/${item.slug}`} style={{ flexShrink: 0, width: 96, height: 112, borderRadius: 8, overflow: 'hidden', background: '#f0ece6', display: 'block' }}>
                  {item.image && <Image src={item.image} alt={item.name} width={96} height={112} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                </Link>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: 'var(--dark)' }}>{item.name}</Link>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                    {item.size && <span>Size: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong></span>}
                    {item.color && <span>Color: <strong style={{ color: 'var(--text-primary)' }}>{item.color}</strong></span>}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: 16 }}>Rs. {item.price.toLocaleString()}</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} style={{ width: 36, height: 36, border: 'none', background: 'var(--bg-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)} style={{ width: 36, height: 36, border: 'none', background: 'var(--bg-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontWeight: 700, color: 'var(--dark)' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.id, item.size, item.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/categories" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Shop
              </Link>
              <button onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 'calc(var(--nav-height) + 16px)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: 600 }}>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                <span style={{ fontWeight: 600, color: DELIVERY_FEE === 0 ? '#22c55e' : 'var(--text-primary)' }}>
                  {DELIVERY_FEE === 0 ? 'FREE' : `Rs. ${DELIVERY_FEE}`}
                </span>
              </div>
              {DELIVERY_FEE > 0 && (
                <div style={{ background: '#fef3c7', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#92400e' }}>
                  Add Rs. {(2000 - totalPrice).toLocaleString()} more for free delivery
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--dark)', paddingTop: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>Grand Total</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--dark)' }}>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/categories" style={{ display: 'block', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
              Continue Shopping
            </Link>

            <div style={{ marginTop: 20, padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
              💳 Cash on Delivery · 🔒 Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0, 1fr) 360px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
