'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import SearchModal from '@/components/ui/SearchModal'

const CATEGORIES = [
  { label: 'Men Wear', href: '/categories?cat=men-wear' },
  { label: 'Women Wear', href: '/categories?cat=women-wear' },
  { label: 'Jeans', href: '/categories?cat=jeans' },
  { label: 'Hoodies', href: '/categories?cat=hoodies' },
  { label: 'T-Shirts', href: '/categories?cat=t-shirts' },
  { label: 'Shirts', href: '/categories?cat=shirts' },
  { label: 'Jackets', href: '/categories?cat=jackets' },
  { label: 'Shoes', href: '/categories?cat=shoes' },
  { label: 'Watches', href: '/categories?cat=watches' },
  { label: 'Accessories', href: '/categories?cat=accessories' },
  { label: 'Kids Wear', href: '/categories?cat=kids-wear' },
  { label: 'Winter Collection', href: '/categories?cat=winter-collection' },
  { label: 'Summer Collection', href: '/categories?cat=summer-collection' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          height: 'var(--nav-height)',
          transition: 'all 0.3s ease',
          ...(scrolled
            ? { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(234,234,234,0.7)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }
            : { background: '#fff', borderBottom: '1px solid var(--border)' })
        }}
      >
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dark)' }}>
              Aurangzaib
              <span style={{ color: 'var(--gold)', display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.25em', marginTop: -2 }}>Garments</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }} className="hidden-mobile">
            <NavLink href="/" label="Home" active={pathname === '/'} />

            {/* Categories Mega Menu */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 14px', background: 'none', border: 'none',
                fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
                cursor: 'pointer', letterSpacing: '0.02em',
                fontFamily: 'var(--font-body)', borderRadius: 4,
                transition: 'color 0.2s'
              }}>
                Categories <ChevronDown size={14} />
              </button>

              {megaMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  paddingTop: 8, zIndex: 50, animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{
                    background: '#fff', border: '1px solid var(--border)',
                    borderRadius: 8, boxShadow: 'var(--shadow-lg)', padding: '16px 20px',
                    width: 480, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4
                  }}>
                    {CATEGORIES.map(cat => (
                      <Link key={cat.href} href={cat.href} style={{
                        padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)',
                        textDecoration: 'none', borderRadius: 4, transition: 'all 0.15s',
                        fontWeight: 500, whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--gold)'; (e.target as HTMLElement).style.background = '#faf9f7'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-secondary)'; (e.target as HTMLElement).style.background = 'transparent'; }}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/collections" label="Collections" active={pathname === '/collections'} />
            <NavLink href="/categories?sort=best_seller" label="Best Sales" active={false} />
            <NavLink href="/track-order" label="Track Order" active={pathname === '/track-order'} />
            <NavLink href="/support" label="Support" active={pathname === '/support'} />
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{ padding: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: 8, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link href="/cart" style={{ position: 'relative', padding: 10, color: 'var(--text-primary)', borderRadius: 8, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'var(--gold)', color: '#fff',
                  width: 18, height: 18, borderRadius: '50%',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div style={{ position: 'relative' }} className="hidden-mobile">
                <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', textDecoration: 'none', color: 'var(--text-primary)', borderRadius: 8, background: 'var(--bg-primary)', fontSize: 13, fontWeight: 500 }}>
                  <User size={16} />
                  <span>{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                </Link>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm hidden-mobile" style={{ marginLeft: 4 }}>
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'none', borderRadius: 8 }}
              className="mobile-menu-btn"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setMobileOpen(false)}>
          <div
            style={{
              position: 'absolute', top: 0, right: 0,
              width: 'min(320px, 85vw)', height: '100%',
              background: '#fff', padding: '80px 24px 100px',
              overflowY: 'auto',
              animation: 'fadeInRight 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MobileNavLink href="/" label="Home" />
              <div style={{ padding: '12px 0 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Categories</div>
              {CATEGORIES.map(cat => (
                <MobileNavLink key={cat.href} href={cat.href} label={cat.label} small />
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }} />
              <MobileNavLink href="/collections" label="Collections" />
              <MobileNavLink href="/categories?sort=best_seller" label="Best Sales" />
              <MobileNavLink href="/track-order" label="Track Order" />
              <MobileNavLink href="/support" label="Support" />
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }} />
              {user ? (
                <>
                  <MobileNavLink href="/profile" label="My Profile" />
                  <button onClick={() => { signOut(); setMobileOpen(false) }} style={{ textAlign: 'left', padding: '12px 0', background: 'none', border: 'none', fontSize: 15, color: '#ef4444', cursor: 'pointer', fontWeight: 500 }}>Sign Out</button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setMobileOpen(false)}>Sign In</Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 'var(--nav-height)' }} />

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{
      padding: '8px 14px', fontSize: 14, fontWeight: active ? 600 : 500,
      color: active ? 'var(--gold)' : 'var(--text-primary)',
      textDecoration: 'none', borderRadius: 4, transition: 'color 0.2s',
      letterSpacing: '0.02em'
    }}>
      {label}
    </Link>
  )
}

function MobileNavLink({ href, label, small }: { href: string; label: string; small?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'block', padding: small ? '9px 12px' : '12px 0',
      fontSize: small ? 14 : 16, fontWeight: 500,
      color: 'var(--text-primary)', textDecoration: 'none',
      borderRadius: small ? 4 : 0, transition: 'color 0.2s'
    }}>
      {label}
    </Link>
  )
}
