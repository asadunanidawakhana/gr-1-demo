'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  statusCounts: { [key: string]: number };
}

export default function AdminDashboard() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !profile?.is_admin) {
      router.push('/admin/login')
    }
  }, [profile, authLoading, router])

  useEffect(() => {
    if (profile?.is_admin) fetchStats()
  }, [profile])

  async function fetchStats() {
    try {
      setLoading(true)
      
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      const { data: products } = await supabase.from('products').select('id')
      const { data: profiles } = await supabase.from('profiles').select('id').eq('is_admin', false)

      const revenue = orders?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0
      const statusCounts = orders?.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {}) || {}

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: revenue,
        totalProducts: products?.length || 0,
        totalUsers: profiles?.length || 0,
        recentOrders: orders?.slice(0, 5) || [],
        statusCounts
      })
    } catch (error: any) {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && !stats)) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} />
      </div>
    )
  }

  const CARDS = [
    { label: 'Total Revenue', value: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: '#0ea5e9', trend: '+12.5%', isUp: true },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: '#f59e0b', trend: '+8.2%', isUp: true },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: '#10b981', trend: '-2.1%', isUp: false },
    { label: 'Active Users', value: stats?.totalUsers || 0, icon: Users, color: '#8b5cf6', trend: '+4.3%', isUp: true },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="dashboard" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: 'var(--dark)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Welcome back, {profile?.full_name}. Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
          {CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: card.isUp ? '#10b981' : '#ef4444' }}>
                    {card.trend} {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)' }}>{loading ? '...' : card.value}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          {/* Recent Orders */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Orders</h2>
              <button style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Order ID</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Customer</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total</th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                      <td style={{ padding: '16px 24px' }}>{order.customer_name}</td>
                      <td style={{ padding: '16px 24px' }}>PKR {Number(order.total || 0).toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: order.status === 'delivered' ? '#dcfce7' : order.status === 'pending' ? '#fef3c7' : '#f3f4f6', color: order.status === 'delivered' ? '#166534' : order.status === 'pending' ? '#92400e' : '#374151' }}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Order Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { label: 'Pending', count: stats?.statusCounts.pending || 0, icon: Clock, color: '#f59e0b' },
                { label: 'Confirmed', count: stats?.statusCounts.confirmed || 0, icon: CheckCircle, color: '#0ea5e9' },
                { label: 'Shipped', count: stats?.statusCounts.shipped || 0, icon: Truck, color: '#8b5cf6' },
                { label: 'Delivered', count: stats?.statusCounts.delivered || 0, icon: CheckCircle, color: '#10b981' },
                { label: 'Cancelled', count: stats?.statusCounts.cancelled || 0, icon: AlertCircle, color: '#ef4444' },
              ].map(item => {
                const percentage = stats?.totalOrders ? (item.count / stats.totalOrders) * 100 : 0
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <item.icon size={16} color={item.color} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{item.count}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: item.color, width: `${percentage}%`, borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
