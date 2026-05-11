'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import { User, Package, MapPin, LogOut, Lock, Edit3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Order {
  id: string; order_number: string; status: string; total: number; created_at: string; items: unknown[]
}

type Tab = 'profile' | 'orders' | 'addresses' | 'password'

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Sync profile form when profile loads
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileForm(prev => {
        const next = { 
          full_name: profile.full_name || '', 
          phone: profile.phone || '' 
        }
        if (prev.full_name === next.full_name && prev.phone === next.phone) return prev
        return next
      })
    }
  }, [profile])

  if (loading || (!user && !loading)) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} />
      </div>
    )
  }

  const handleTabChange = async (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'orders' && !ordersLoaded && user) {
      const { data } = await supabase
        .from('orders')
        .select('id,order_number,status,total,created_at,items')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setOrdersLoaded(true)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const { error } = await updateProfile({ full_name: profileForm.full_name, phone: profileForm.phone })
    setSaving(false)
    if (error) toast.error('Failed to update profile')
    else toast.success('Profile updated!')
  }

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Passwords do not match'); return }
    if (passwordForm.new.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new })
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); setPasswordForm({ current: '', new: '', confirm: '' }) }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    toast.success('Signed out successfully')
  }

  const TAB_ITEMS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'orders', label: 'Order History', icon: Package },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'password', label: 'Change Password', icon: Lock },
  ]

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(24px, 4vw, 40px) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-heading)' }}>
              {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700 }}>{profile?.full_name || 'My Account'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>

          {/* Sidebar */}
          <div className="card" style={{ padding: 8 }}>
            {TAB_ITEMS.map(item => {
              const Icon = item.icon
              return (
                <button key={item.key} onClick={() => handleTabChange(item.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px',
                  background: activeTab === item.key ? 'var(--dark)' : 'none',
                  color: activeTab === item.key ? '#fff' : 'var(--text-secondary)',
                  border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', marginBottom: 2
                }}>
                  <Icon size={16} /> {item.label}
                </button>
              )
            })}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', color: '#ef4444', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="card" style={{ padding: 32 }}>
            {activeTab === 'profile' && (
              <div>
                <h2 className="heading-md" style={{ marginBottom: 24 }}>
                  <Edit3 size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                  Edit Profile
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" id="profile-name" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" id="profile-phone" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <button onClick={handleSaveProfile} className="btn btn-primary" disabled={saving} style={{ width: 'fit-content' }}>
                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="heading-md" style={{ marginBottom: 24 }}>Order History</h2>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Package size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <p>No orders yet</p>
                    <Link href="/categories" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 16 }}>{order.order_number}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(order.created_at).toLocaleDateString()} · {Array.isArray(order.items) ? order.items.length : 0} items
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span className={`badge badge-${order.status || 'pending'}`}>{(order.status || 'pending').replace(/_/g, ' ')}</span>
                          <div style={{ fontWeight: 700 }}>Rs. {order.total.toLocaleString()}</div>
                          <Link href={`/track-order?order=${order.order_number}`} className="btn btn-outline btn-sm">Track</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <MapPin size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p>Addresses are saved at checkout automatically.</p>
                <p style={{ marginTop: 8, fontSize: 13 }}>Your delivery address from your last order will be pre-filled next time.</p>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 className="heading-md" style={{ marginBottom: 24 }}>Change Password</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" id="new-password" value={passwordForm.new} onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))} placeholder="Min. 6 characters" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-input" id="confirm-password" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} />
                  </div>
                  <button onClick={handleChangePassword} className="btn btn-primary" disabled={saving} style={{ width: 'fit-content' }}>
                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 220px 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
