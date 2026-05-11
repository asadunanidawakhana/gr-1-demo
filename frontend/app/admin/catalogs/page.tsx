'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Loader2, Edit2, Trash2, Check, X, FileText, Download } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Catalog {
  id: string; title: string; season: string; year: number;
  image_url: string; pdf_url: string; is_active: boolean;
}

export default function AdminCatalogsPage() {
  const { profile } = useAuth()
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Catalog>>({})
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => { if (profile?.is_admin) fetchCatalogs() }, [profile])

  async function fetchCatalogs() {
    setLoading(true)
    const { data } = await supabase.from('catalogs').select('*').order('year', { ascending: false })
    setCatalogs(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.year) {
      toast.error('Title and Year are required')
      return
    }
    const payload = {
      title: formData.title, season: formData.season || '',
      year: formData.year, image_url: formData.image_url || '',
      pdf_url: formData.pdf_url || '', is_active: formData.is_active ?? true
    }
    const { error } = editingId 
      ? await supabase.from('catalogs').update(payload).eq('id', editingId)
      : await supabase.from('catalogs').insert(payload)
    if (error) toast.error(error.message)
    else {
      toast.success('Catalog saved')
      setEditingId(null); setIsAdding(false); fetchCatalogs()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete catalog?')) return
    const { error } = await supabase.from('catalogs').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Catalog deleted'); fetchCatalogs() }
  }

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="catalogs" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Catalogs</h1>
          <button className="btn btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ year: new Date().getFullYear(), is_active: true }) }}>
            <Plus size={18} /> Add Catalog
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: (editingId || isAdding) ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Catalog</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Season / Year</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogs.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 4, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                            <FileText size={18} />
                          </div>
                          <div style={{ fontWeight: 600 }}>{cat.title}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 13 }}>{cat.season} {cat.year}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: cat.is_active ? '#dcfce7' : '#fee2e2', color: cat.is_active ? '#166534' : '#991b1b' }}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {cat.pdf_url && <a href={cat.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}><Download size={16} /></a>}
                          <button onClick={() => { setEditingId(cat.id); setFormData(cat); setIsAdding(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {catalogs.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No catalogs found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {(editingId || isAdding) && (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 32 }}>
              <h2 className="heading-md" style={{ marginBottom: 20 }}>{editingId ? 'Edit Catalog' : 'New Catalog'}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Winter Essentials" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <input className="form-input" value={formData.season || ''} onChange={e => setFormData({ ...formData, season: e.target.value })} placeholder="Winter" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input type="number" className="form-input" value={formData.year || 2026} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input className="form-input" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">PDF Link</label>
                  <input className="form-input" value={formData.pdf_url || ''} onChange={e => setFormData({ ...formData, pdf_url: e.target.value })} placeholder="https://..." />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="cat-active" checked={formData.is_active ?? true} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  <label htmlFor="cat-active" style={{ fontSize: 14 }}>Active</label>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Catalog</button>
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
