'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search, Loader2, Package, CheckCircle, Truck, MapPin, Clock, AlertCircle } from 'lucide-react'

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const orderNumParam = searchParams.get('order')
  
  const [orderNumber, setOrderNumber] = useState(orderNumParam || '')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderNumParam) handleTrack(orderNumParam)
  }, [orderNumParam])

  const handleTrack = async (num: string = orderNumber) => {
    if (!num) return
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const { data, error: err } = await supabase.from('orders').select('*').eq('order_number', num.trim()).single()
      if (err) throw err
      if (!data) throw new Error('Order not found')
      setOrder(data)
    } catch (err: any) {
      setError(err.message === 'Order not found' ? 'Order not found. Please check the order number and try again.' : 'An error occurred while tracking your order.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
    { status: 'approved', label: 'Confirmed', icon: CheckCircle, desc: 'Your order has been verified' },
    { status: 'processing', label: 'Processing', icon: Package, desc: 'Your items are being packed' },
    { status: 'shipping', label: 'Shipped', icon: Truck, desc: 'Handed over to courier' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Rider is on the way' },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Successfully received' },
  ]

  const currentStepIndex = steps.findIndex(s => s.status === order?.status)

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(40px, 6vw, 80px) 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16 }}>Track Your Order</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>Enter your order number to see real-time delivery status.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 0 100px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          
          {/* Search Bar */}
          <div className="card" style={{ padding: 24, marginBottom: 40, border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 48, height: 56, fontSize: 16, borderRadius: 12 }} 
                  placeholder="e.g. AG-20260511-12345"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <button className="btn btn-primary" style={{ height: 56, padding: '0 32px', borderRadius: 12 }} onClick={() => handleTrack()}>
                Track
              </button>
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: 14, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={14} /> {error}</div>}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={40} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
          )}

          {order && (
            <div className="page-enter">
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, padding: '0 8px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Order Details</div>
                  <h2 style={{ fontSize: 24, fontWeight: 800 }}>{order.order_number}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Order Date</div>
                  <div style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="card" style={{ padding: '40px 24px', marginBottom: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                  {steps.map((step, i) => {
                    const isCompleted = i <= currentStepIndex
                    const isCurrent = i === currentStepIndex
                    const Icon = step.icon

                    return (
                      <div key={step.status} style={{ display: 'flex', gap: 24, position: 'relative', paddingBottom: i === steps.length - 1 ? 0 : 40 }}>
                        {/* Line */}
                        {i !== steps.length - 1 && (
                          <div style={{ position: 'absolute', left: 24, top: 48, bottom: 0, width: 2, background: i < currentStepIndex ? 'var(--gold)' : '#e2e8f0', zIndex: 0 }} />
                        )}
                        
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: isCompleted ? 'var(--gold)' : '#fff', border: `2px solid ${isCompleted ? 'var(--gold)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? '#fff' : '#cbd5e1', zIndex: 1, boxShadow: isCurrent ? '0 0 0 4px rgba(181, 148, 89, 0.2)' : 'none', transition: 'all 0.3s ease' }}>
                          <Icon size={20} />
                        </div>

                        <div style={{ flex: 1, paddingTop: 4 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: isCompleted ? 'var(--dark)' : 'var(--text-muted)', marginBottom: 2 }}>{step.label}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step.desc}</div>
                          {isCurrent && order.tracking_notes && (
                            <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, color: 'var(--gold)', fontWeight: 600, borderLeft: '3px solid var(--gold)' }}>
                              Note: {order.tracking_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                 <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Items</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {order.items.map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 40, height: 50, borderRadius: 4, background: '#f0ece6', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.size} · Qty: {item.quantity}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>PKR {item.subtotal.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Delivery Address</h3>
                    <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{order.customer_name}</div>
                      <div>{order.customer_phone}</div>
                      <div style={{ marginTop: 8 }}>{order.customer_address}</div>
                      <div>{order.customer_city}, {order.customer_postal_code}</div>
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
