'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Tag, Image, Library, Layers, Users, ShoppingBag, Ticket, LogOut, ExternalLink } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/catalogs', label: 'Catalogs', icon: Library },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/support', label: 'Support Tickets', icon: Ticket },
]

export default function AdminSidebar({ active }: { active: string }) {
  const pathname = usePathname()
  const { signOut, profile } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>
          Aurangzaib
          <span style={{ display: 'block', fontSize: 10, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.2em', marginTop: -2 }}>Admin Panel</span>
        </div>
      </div>

      {/* Admin Info */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Signed in as</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{profile?.full_name || 'Admin'}</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        {NAV.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={`admin-sidebar-item${isActive ? ' active' : ''}`}>
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' }}>
        <Link href="/" target="_blank" className="admin-sidebar-item">
          <ExternalLink size={18} /> View Store
        </Link>
        <button onClick={handleSignOut} className="admin-sidebar-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: 'rgba(255,100,100,0.8)' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
