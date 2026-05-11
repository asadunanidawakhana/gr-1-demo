'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Search, Loader2, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react'
import { toast } from '@/lib/toast'
import Image from 'next/image'

interface Banner {
  id: string; title: string; subtitle: string; cta_text: string;
  cta_link: string; image_url: string; type: 'hero' | 'promo' | 'category';
  sort_order: number; is_active: boolean;
}

export default function AdminBannersPage() {
  const { profile } = useAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Banner>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { if (profile?.is_admin) fetchBanners() }, [profile])

  async function fetchBanners() {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('type').order('sort_order')
    setBanners(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error('Title and image URL are required')
      return
    }
    const payload = {
      title: formData.title, subtitle: formData.subtitle || '',
      cta_text: formData.cta_text || '', cta_link: formData.cta_link || '',
      image_url: formData.image_url, type: formData.type || 'hero',
      sort_order: formData.sort_order || 0, is_active: formData.is_active ?? true
    }
    const { error } = editingId 
      ? await supabase.from('banners').update(payload).eq('id', editingId)
      : await supabase.from('banners').insert(payload)
    if (error) toast.error(error.message)
    else {
      toast.success(`Banner ${editingId ? 'updated' : 'added'}`)
      setEditingId(null); setIsAdding(false); fetchBanners()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `hero/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete banner?')) return
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Banner deleted'); fetchBanners() }
  }

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="banners" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Banners</h1>
          <button className="btn btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ type: 'hero', is_active: true, sort_order: 0 }) }}>
            <Plus size={18} /> Add Banner
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: (editingId || isAdding) ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, padding: 20 }}>
                {banners.map(banner => (
                  <div key={banner.id} className="card" style={{ overflow: 'hidden', border: editingId === banner.id ? '2px solid var(--gold)' : '1px solid var(--border)' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#eee' }}>
                      <Image src={banner.image_url} alt={banner.title} fill style={{ objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 8, right: 8, background: banner.is_active ? '#22c55e' : '#ef4444', width: 8, height: 8, borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                        {banner.type}
                      </div>
                    </div>
                    <div style={{ padding: 12 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{banner.title}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{banner.subtitle || 'No subtitle'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)' }}>Order: {banner.sort_order}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditingId(banner.id); setFormData(banner); setIsAdding(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(banner.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(editingId || isAdding) && (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 32 }}>
              <h2 className="heading-md" style={{ marginBottom: 20 }}>{editingId ? 'Edit Banner' : 'New Banner'}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                    <option value="hero">Hero Slider</option>
                    <option value="promo">Promo Section</option>
                    <option value="category">Category Banner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Main heading" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input className="form-input" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Secondary text" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">CTA Text</label>
                    <input className="form-input" value={formData.cta_text || ''} onChange={e => setFormData({ ...formData, cta_text: e.target.value })} placeholder="Shop Now" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CTA Link</label>
                    <input className="form-input" value={formData.cta_link || ''} onChange={e => setFormData({ ...formData, cta_link: e.target.value })} placeholder="/categories" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Image</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ position: 'relative', height: 160, width: '100%', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px dashed var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {formData.image_url ? (
                        <Image src={formData.image_url} alt="Preview" fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          <ImageIcon size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                          <p style={{ fontSize: 12 }}>No image selected</p>
                        </div>
                      )}
                      {uploading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <label className="btn btn-outline" style={{ flex: 1, cursor: 'pointer', fontSize: 13 }}>
                        {uploading ? 'Uploading...' : 'Choose File'}
                        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                      </label>
                      <input 
                        className="form-input" 
                        style={{ flex: 2 }}
                        value={formData.image_url || ''} 
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
                        placeholder="Or paste URL..." 
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                    <input type="checkbox" id="banner-active" checked={formData.is_active ?? true} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                    <label htmlFor="banner-active" style={{ fontSize: 14 }}>Active</label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Banner</button>
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
