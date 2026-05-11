'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Search, Filter, Loader2, ChevronDown, Eye } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Order {
  id: string; order_number: string; customer_name: string; customer_phone: string;
  customer_city: string; total: number; status: string; payment_method: string;
  created_at: string; items: Array<{ product_name: string; quantity: number; price: number; size?: string }>
}

const STATUSES = ['pending', 'approved', 'processing', 'shipping', 'out_for_delivery', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', approved: '#3b82f6', processing: '#8b5cf6',
  shipping: '#06b6d4', out_for_delivery: '#f97316', delivered: '#22c55e', cancelled: '#ef4444'
}

export default function AdminOrdersPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => { if (profile?.is_admin) fetchOrders() }, [profile, statusFilter])

  async function fetchOrders() {
    setFetching(true)
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    setOrders(data || [])
    setFetching(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true)
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const statusHistory = [
      { status: newStatus, timestamp: new Date().toISOString(), note: `Status changed to ${newStatus}` }
    ]
    const { error } = await supabase.from('orders').update({ status: newStatus, status_history: statusHistory }).eq('id', orderId)
    setUpdatingStatus(false)
    if (error) toast.error(error.message)
    else {
      toast.success(`Order updated to ${newStatus}`)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  )

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="orders" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Orders</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{orders.length} orders</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} className="form-input" placeholder="Search order, customer, phone..." style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input" style={{ paddingLeft: 32 }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
          {/* Orders Table */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            {fetching ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} /></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)' }}>
                    {['Order #', 'Customer', 'City', 'Total', 'Status', 'Date', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order.id} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', background: selectedOrder?.id === order.id ? 'var(--bg-secondary)' : 'transparent' }} onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--dark)' }}>{order.order_number}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.customer_phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{order.customer_city}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>Rs. {order.total.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}><Eye size={16} color="var(--text-muted)" /></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Order Detail Panel */}
          {selectedOrder && (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{selectedOrder.order_number}</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              </div>

              {/* Status Updater */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Update Status</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="form-input"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Customer */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedOrder.customer_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedOrder.customer_phone}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedOrder.customer_city}</div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Items</div>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{item.product_name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, padding: '10px 0 0', fontFamily: 'var(--font-heading)' }}>
                  <span>Total</span>
                  <span>Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`https://wa.me/92${selectedOrder.customer_phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  📱 WhatsApp
                </a>
                <a href={`/track-order?order=${selectedOrder.order_number}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  Track Page
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
