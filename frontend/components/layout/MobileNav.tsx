'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingBag, Package, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Shop', icon: LayoutGrid },
  { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: true },
  { href: '/track-order', label: 'Orders', icon: Package },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="mobile-nav" style={{ display: 'none' }} id="mobile-bottom-nav">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link key={item.href} href={item.href} className={`mobile-nav-item${active ? ' active' : ''}`} style={{ position: 'relative' }}>
            <span style={{ position: 'relative' }}>
              <Icon />
              {item.badge && totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: 'var(--gold)', color: '#fff',
                  width: 16, height: 16, borderRadius: '50%',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {totalItems}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        )
      })}
      <style>{`
        @media (max-width: 768px) {
          #mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
