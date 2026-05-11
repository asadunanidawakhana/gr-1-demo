'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Search, Loader2, Edit2, Trash2, Check, X } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !profile?.is_admin) {
      router.push('/admin/login')
    }
  }, [profile, authLoading, router])

  useEffect(() => {
    if (profile?.is_admin) fetchCategories()
  }, [profile])

  async function fetchCategories() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setFormData(cat)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      return
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      image_url: formData.image_url || '',
      description: formData.description || '',
      sort_order: formData.sort_order || 0,
      is_active: formData.is_active ?? true
    }

    const { error } = editingId 
      ? await supabase.from('categories').update(payload).eq('id', editingId)
      : await supabase.from('categories').insert(payload)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Category ${editingId ? 'updated' : 'added'} successfully`)
      setEditingId(null)
      setIsAdding(false)
      fetchCategories()
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `categories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products') // Using products bucket for categories too, or I can add a categories bucket in SQL
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      toast.success('Category image uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Error uploading')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Category deleted')
      fetchCategories()
    }
  }

  const filtered = categories.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()))

  if (authLoading || (loading && categories.length === 0)) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--gold)' }} />
      </div>
    )
  }

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="categories" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Categories</h1>
          <button className="btn btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ is_active: true, sort_order: 0 }) }}>
            <Plus size={18} /> Add Category
          </button>
        </div>

        {/* List & Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: (editingId || isAdding) ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
               <div style={{ position: 'relative', flex: 1 }}>
                 <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input value={search} onChange={e => setSearch(e.target.value)} className="form-input" placeholder="Search categories..." style={{ paddingLeft: 36, height: 40 }} />
               </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Slug</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Order</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)', background: editingId === cat.id ? '#fff9f0' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{cat.name || 'Unnamed Category'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{cat.slug}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{cat.sort_order}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: cat.is_active ? '#dcfce7' : '#fee2e2', color: cat.is_active ? '#166534' : '#991b1b' }}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(cat)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(cat.id)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
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
              <h2 className="heading-md" style={{ marginBottom: 20 }}>{editingId ? 'Edit Category' : 'New Category'}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Men Wear" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-input" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. men-wear" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Image
                    <label style={{ color: 'var(--gold)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                  </label>
                  <input className="form-input" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Sort Order</label>
                  <input type="number" className="form-input" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="cat-active" checked={formData.is_active ?? true} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  <label htmlFor="cat-active" style={{ fontSize: 14 }}>Active</label>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                    <Check size={18} /> Save
                  </button>
                  <button className="btn btn-outline" onClick={() => { setIsAdding(false); setEditingId(null) }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
