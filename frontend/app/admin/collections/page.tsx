'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Search, Loader2, Edit2, Trash2, Check, X, Star } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Collection {
  id: string; title: string; slug: string; description: string;
  image_url: string; is_featured: boolean; is_active: boolean; sort_order: number;
}

export default function AdminCollectionsPage() {
  const { profile } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Collection>>({})
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (profile?.is_admin) fetchCollections()
  }, [profile])

  async function fetchCollections() {
    setLoading(true)
    const { data } = await supabase.from('collections').select('*').order('sort_order')
    setCollections(data || [])
    setLoading(false)
  }

  const handleEdit = (col: Collection) => {
    setEditingId(col.id)
    setFormData(col)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error('Title and slug are required')
      return
    }

    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || '',
      image_url: formData.image_url || '',
      is_featured: formData.is_featured ?? false,
      is_active: formData.is_active ?? true,
      sort_order: formData.sort_order || 0
    }

    const { error } = editingId 
      ? await supabase.from('collections').update(payload).eq('id', editingId)
      : await supabase.from('collections').insert(payload)

    if (error) toast.error(error.message)
    else {
      toast.success(`Collection ${editingId ? 'updated' : 'added'} successfully`)
      setEditingId(null)
      setIsAdding(false)
      fetchCollections()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Collection deleted')
      fetchCollections()
    }
  }

  const filtered = collections.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="collections" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Collections</h1>
          <button className="btn btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ is_active: true, is_featured: false, sort_order: 0 }) }}>
            <Plus size={18} /> New Collection
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: (editingId || isAdding) ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
               <div style={{ position: 'relative', flex: 1 }}>
                 <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input value={search} onChange={e => setSearch(e.target.value)} className="form-input" placeholder="Search collections..." style={{ paddingLeft: 36, height: 40 }} />
               </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Title</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Featured</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(col => (
                    <tr key={col.id} style={{ borderBottom: '1px solid var(--border)', background: editingId === col.id ? '#fff9f0' : 'transparent' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{col.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{col.slug}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {col.is_featured && <Star size={14} fill="var(--gold)" color="var(--gold)" style={{ marginInline: 'auto' }} />}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: col.is_active ? '#dcfce7' : '#fee2e2', color: col.is_active ? '#166534' : '#991b1b' }}>
                          {col.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(col)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {(editingId || isAdding) && (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 32 }}>
              <h2 className="heading-md" style={{ marginBottom: 20 }}>{editingId ? 'Edit Collection' : 'New Collection'}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Summer Sale" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-input" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="summer-sale" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description..." rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                </div>
                
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="col-featured" checked={formData.is_featured ?? false} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                    <label htmlFor="col-featured" style={{ fontSize: 14 }}>Featured</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="col-active" checked={formData.is_active ?? true} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                    <label htmlFor="col-active" style={{ fontSize: 14 }}>Active</label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Collection</button>
                  <button className="btn btn-outline" onClick={() => { setIsAdding(false); setEditingId(null) }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
