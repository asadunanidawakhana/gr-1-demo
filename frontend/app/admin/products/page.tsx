'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Edit, Trash2, Search, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Product {
  id: string; name: string; slug: string; description?: string; price: number; 
  compare_price?: number | null; category_id?: string | null; stock: number;
  sizes?: string[]; colors?: string[]; tags?: string[];
  is_active: boolean; is_featured: boolean; is_best_seller: boolean;
  images: string[]; categories?: { name: string }[] | null; created_at: string
}
interface Category { id: string; name: string }
interface FormData {
  name: string; slug: string; description: string; price: string; compare_price: string;
  category_id: string; stock: string; sizes: string; colors: string; tags: string;
  images: string; is_featured: boolean; is_best_seller: boolean; is_active: boolean
}

const EMPTY_FORM: FormData = {
  name: '', slug: '', description: '', price: '', compare_price: '',
  category_id: '', stock: '0', sizes: 'XS,S,M,L,XL,XXL', colors: '', tags: '',
  images: '', is_featured: false, is_best_seller: false, is_active: true
}

export default function AdminProductsPage() {
  const { profile, loading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { if (profile?.is_admin) fetchData() }, [profile])

  async function fetchData() {
    setFetching(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('id,name,slug,description,price,compare_price,category_id,stock,sizes,colors,tags,is_active,is_featured,is_best_seller,images,categories(name),created_at').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order')
    ])
    setProducts(pRes.data || [])
    setCategories(cRes.data || [])
    setFetching(false)
  }

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setModalOpen(true) }
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '', category_id: p.category_id || '', stock: String(p.stock),
      sizes: (p.sizes || []).join(','), colors: (p.colors || []).join(','), tags: (p.tags || []).join(','),
      images: (p.images || []).join('\n'), is_featured: p.is_featured,
      is_best_seller: p.is_best_seller, is_active: p.is_active
    })
    setEditingId(p.id)
    setModalOpen(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      setUploading(true)
      const newImages: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)
        
        newImages.push(publicUrl)
      }

      const currentImages = form.images.split('\n').filter(Boolean)
      setForm({ ...form, images: [...currentImages, ...newImages].join('\n') })
      toast.success(`${files.length} images uploaded`)
    } catch (error: any) {
      toast.error(error.message || 'Error uploading')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)

    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      category_id: form.category_id || null,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      is_featured: form.is_featured,
      is_best_seller: form.is_best_seller,
      is_active: form.is_active
    }

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId)
      if (error) toast.error(error.message)
      else { toast.success('Product updated!'); setModalOpen(false); fetchData() }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) toast.error(error.message)
      else { toast.success('Product created!'); setModalOpen(false); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Product deleted'); fetchData() }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="products" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Products</h1>
          <button onClick={openCreate} className="btn btn-primary">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" placeholder="Search products..."
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          {fetching ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} /></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 52, borderRadius: 6, background: '#f0ece6', overflow: 'hidden', flexShrink: 0 }}>
                          {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={18} color="var(--text-muted)" style={{ margin: '17px auto', display: 'block' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: 2 }}>{product.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{product.categories?.[0]?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>Rs. {product.price.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: product.stock === 0 ? '#ef4444' : product.stock < 5 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{product.stock}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {product.is_active && <span className="badge" style={{ background: '#d1fae5', color: '#065f46', fontSize: 10 }}>Active</span>}
                        {product.is_featured && <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontSize: 10 }}>Featured</span>}
                        {product.is_best_seller && <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: 10 }}>Best Seller</span>}
                        {!product.is_active && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', fontSize: 10 }}>Inactive</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', display: 'flex', padding: 6 }}><Edit size={16} /></button>
                        <button onClick={() => handleDelete(product.id, product.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', padding: 6 }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No products found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={e => {
                  const name = e.target.value
                  setForm(f => ({ ...f, name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))
                }} placeholder="Premium Cotton T-Shirt" />
              </div>
              <div className="form-group">
                <label className="form-label">Price (Rs.) *</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1500" />
              </div>
              <div className="form-group">
                <label className="form-label">Compare Price (Rs.)</label>
                <input className="form-input" type="number" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} placeholder="2000" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input className="form-input" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Sizes (comma-separated)</label>
                <input className="form-input" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="XS,S,M,L,XL" />
              </div>
              <div className="form-group">
                <label className="form-label">Colors (comma-separated)</label>
                <input className="form-input" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="Black,White,Navy" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} placeholder="Product description..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Images
                  <label className="text-gold" style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={14} /> {uploading ? 'Uploading...' : 'Upload from Device'}
                    <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                </label>
                <textarea 
                  className="form-input" 
                  value={form.images} 
                  onChange={e => setForm(f => ({ ...f, images: e.target.value }))} 
                  rows={4} 
                  style={{ resize: 'vertical' }} 
                  placeholder="Image URLs (one per line)&#10;Or use the upload button above" 
                />
                {form.images && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 8 }}>
                    {form.images.split('\n').filter(Boolean).map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={() => {
                            const imgs = form.images.split('\n').filter((_, idx) => idx !== i)
                            setForm({ ...form, images: imgs.join('\n') })
                          }}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="cotton, premium, summer" />
              </div>
              <div className="form-group">
                <label className="form-label">Slug (auto-generated)</label>
                <input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              {[
                { key: 'is_active', label: 'Active' },
                { key: 'is_featured', label: 'Featured' },
                { key: 'is_best_seller', label: 'Best Seller' }
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form[key as keyof FormData] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : editingId ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
