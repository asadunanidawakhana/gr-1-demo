'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Admin credentials: hakeemrazq@gmail.com / asad123
// Note: Create this user via Supabase Dashboard > Auth > Add User, then run:
// UPDATE profiles SET is_admin = TRUE WHERE id = '<user-uuid>';

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: form.email, 
        password: form.password 
      })
      
      if (authError || !data?.user) { 
        setError(authError?.message || 'Invalid credentials'); 
        setLoading(false); 
        return 
      }

      // Verify admin status
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single()

      // SELF-HEALING: If profile is missing but user is master email, create it
      if (profileError && profileError.code === 'PGRST116' && form.email === 'hakeemrazq@gmail.com') {
        console.log('Master admin profile missing. Healing...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: 'Master Admin',
            is_admin: true
          })
          .select('is_admin')
          .single()
        
        if (!createError) {
          profileData = newProfile
          profileError = null
        }
      }

      if (profileError) {
        console.error('Detailed Profile Error:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details
        })
        await supabase.auth.signOut()
        setError(`Database Error (${profileError.code}): Your profile record could not be found. Please contact support.`)
        setLoading(false)
        return
      }

      if (!profileData?.is_admin) {
        await supabase.auth.signOut()
        setError('Access denied. This account does not have admin privileges.')
        setLoading(false)
        return
      }

      toast.success('Welcome to Admin Panel')
      router.push('/admin')
    } catch (err) {
      setError('A connection error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050505' }}>
      {/* Left Panel - Brand Story */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }} className="admin-login-left">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(201,166,107,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(201,166,107,0.08) 0%, transparent 50%)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 440 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 56, fontWeight: 800, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', marginBottom: 8 }}>Aurangzaib</h2>
          <div style={{ color: 'var(--gold)', fontSize: 16, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>Master Dashboard</div>
          <div style={{ width: 60, height: 2, background: 'var(--gold)', margin: '40px auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, lineHeight: 1.6, fontWeight: 300, fontStyle: 'italic' }}>
            "Where heritage meets modern management."
          </p>
        </div>
      </div>

      {/* Login Form Panel */}
      <div style={{ width: '100%', maxWidth: 540, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Admin Login</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Enter your credentials to access the command center.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '16px', color: '#fca5a5', fontSize: 14, marginBottom: 32, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <AlertCircle size={18} />
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Corporate Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                placeholder="admin@aurangzaib.com" 
                required 
                style={{ background: '#111', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', height: 52 }} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Security Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPw ? 'text' : 'password'} 
                  className="form-input" 
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  placeholder="••••••••" 
                  required 
                  style={{ background: '#111', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', height: 52 }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-gold" 
              disabled={loading} 
              style={{ height: 52, marginTop: 12, borderRadius: 8, fontSize: 15, fontWeight: 700 }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Loader2 size={20} className="animate-spin" /> Verifying...
                </div>
              ) : 'Authenticate Access'}
            </button>
          </form>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
              &copy; 2026 Aurangzaib Garments Private Limited.
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .admin-login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}

