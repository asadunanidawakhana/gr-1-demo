'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Search, Loader2, Shield, User, Mail, Calendar } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Profile {
  id: string; full_name: string; email: string; is_admin: boolean;
  phone: string; created_at: string;
}

export default function AdminUsersPage() {
  const { profile: currentUser } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { if (currentUser?.is_admin) fetchUsers() }, [currentUser])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const toggleAdmin = async (user: Profile) => {
    if (user.id === currentUser?.id) {
      toast.error("You can't remove your own admin status")
      return
    }
    const { error } = await supabase.from('profiles').update({ is_admin: !user.is_admin }).eq('id', user.id)
    if (error) toast.error(error.message)
    else {
      toast.success(`${user.full_name} is now ${!user.is_admin ? 'an Admin' : 'a User'}`)
      fetchUsers()
    }
  }

  const filtered = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))

  if (!currentUser?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="users" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Users & Staff</h1>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
             <div style={{ position: 'relative', flex: 1 }}>
               <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input value={search} onChange={e => setSearch(e.target.value)} className="form-input" placeholder="Search by name or email..." style={{ paddingLeft: 36, height: 40 }} />
             </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Joined</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.is_admin ? 'var(--gold)' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.is_admin ? '#fff' : 'var(--text-muted)' }}>
                          {user.is_admin ? <Shield size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.full_name || 'No Name'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><Mail size={14} color="var(--text-muted)" /> {user.email}</div>
                      {user.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.phone}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => toggleAdmin(user)} className={`btn ${user.is_admin ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 12px', fontSize: 12, height: 28 }}>
                        {user.is_admin ? 'Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
