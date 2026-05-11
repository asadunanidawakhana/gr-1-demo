'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const DELIVERY_FEE = totalPrice >= 2000 ? 0 : 200
  const grandTotal = totalPrice + DELIVERY_FEE

  const [form, setForm] = useState({
    full_name: '', phone: '', address: '', city: '', postal_code: '', notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required'
    if (!form.phone.trim() || !/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Valid phone number required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) { router.push('/categories'); return }

    setLoading(true)

    const orderItems = items.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      slug: item.slug,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      subtotal: item.price * item.quantity
    }))

    const { data, error } = await supabase.from('orders').insert({
      user_id: user?.id || null,
      customer_name: form.full_name,
      customer_phone: form.phone,
      customer_address: form.address,
      customer_city: form.city,
      customer_postal_code: form.postal_code,
      customer_notes: form.notes,
      items: orderItems,
      subtotal: totalPrice,
      delivery_fee: DELIVERY_FEE,
      total: grandTotal,
      payment_method: 'cash_on_delivery',
      status: 'pending',
      status_history: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed' }]
    }).select('order_number').single()

    setLoading(false)
    if (error) { alert('Failed to place order. Please try again.'); return }
    setOrderNumber(data.order_number)
    clearCart()
    setSuccess(true)
  }

  useEffect(() => {
    if (!success && items.length === 0) {
      router.push('/cart')
    }
  }, [items, success, router])

  if ((items.length === 0 && !success)) {
    return null
  }

  if (success) {
    return (
      <div className="page-enter container section" style={{ textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 600 }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dark)' }}>
            Aurangzaib
            <span style={{ color: 'var(--gold)', display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.25em', marginTop: -2 }}>Garments</span>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: 32 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(201,166,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={48} color="var(--gold)" strokeWidth={1.5} />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={{ position: 'absolute', inset: -10, border: '1px solid var(--gold)', borderRadius: '50%', opacity: 0.3 }} 
          />
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>Thank You!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 40, maxWidth: 400 }}>
          Your order has been placed successfully and is being processed.
        </p>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 48px', marginBottom: 48, boxShadow: 'var(--shadow-sm)', width: '100%' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Order Number</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, color: 'var(--dark)', letterSpacing: '0.05em' }}>{orderNumber}</div>
          <div style={{ width: 40, height: 2, background: 'var(--gold)', margin: '20px auto' }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Confirmation sent to <strong>{form.phone}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={`/track-order?order=${orderNumber}`} className="btn btn-primary btn-lg">
            Track Order Status
          </Link>
          <Link href="/" className="btn btn-outline btn-lg">
            Return to Home
          </Link>
        </div>

        <p style={{ marginTop: 48, fontSize: 13, color: 'var(--text-muted)' }}>
          Need help? <Link href="/support" style={{ color: 'var(--gold)', fontWeight: 600 }}>Contact Support</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(24px, 4vw, 40px) 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800 }}>Checkout</h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, alignItems: 'start' }}>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="heading-md" style={{ marginBottom: 4 }}>Delivery Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" id="checkout-name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Muhammad Ali" />
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" id="checkout-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="03001234567" />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <input className="form-input" id="checkout-address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="House #, Street, Area" />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" id="checkout-city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Lahore" />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input className="form-input" id="checkout-postal" value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="54000" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-input" id="checkout-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Special instructions, landmark, etc." rows={3} style={{ resize: 'vertical' }} />
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="heading-md" style={{ marginBottom: 16 }}>Payment Method</h2>
              <div style={{ border: '2px solid var(--gold)', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: '#fffbf0' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--gold)', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>💵 Cash on Delivery</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Pay when you receive your order</div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Placing Order...</> : 'Place Order'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 'calc(var(--nav-height) + 16px)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Order</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map(item => (
                <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 56, borderRadius: 4, overflow: 'hidden', background: '#f0ece6', flexShrink: 0 }}>
                    {item.image && <Image src={item.image} alt={item.name} width={48} height={56} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.size && `${item.size} · `}Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span style={{ color: DELIVERY_FEE === 0 ? '#22c55e' : 'inherit', fontWeight: 600 }}>{DELIVERY_FEE === 0 ? 'FREE' : `Rs. ${DELIVERY_FEE}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <span>Total</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0, 1fr) 360px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
