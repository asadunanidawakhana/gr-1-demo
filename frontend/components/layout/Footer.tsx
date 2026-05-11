'use client'

import Link from 'next/link'
import { Camera, MessageCircle, Video, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const year = new Date().getFullYear()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,0.7)', marginTop: 'auto' }}>
      {/* Main Footer */}
      <div className="container" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
          {/* Brand */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>
              Aurangzaib
            </h2>
            <div style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 16 }}>
              Garments
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
              Premium fashion for every occasion. Handcrafted quality, delivered across Pakistan.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[
                { href: 'https://www.facebook.com/share/1Gfd7FZFkg', icon: MessageCircle, label: 'Facebook' },
                { href: 'https://www.tiktok.com/@aurang34', icon: Video, label: 'TikTok' },
                { href: 'https://wa.me/923267603975', icon: MessageSquare, label: 'WhatsApp' },
              ].map(({ href, icon: Icon }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{
                  width: 36, height: 36, borderRadius: 6,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', transition: 'background 0.2s', textDecoration: 'none'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Shop</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Men Wear', href: '/categories?cat=men-wear' },
                { label: 'Women Wear', href: '/categories?cat=women-wear' },
                { label: 'Jeans', href: '/categories?cat=jeans' },
                { label: 'Hoodies', href: '/categories?cat=hoodies' },
                { label: 'Accessories', href: '/categories?cat=accessories' },
                { label: 'View All', href: '/categories' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-block' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Help</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Track Order', href: '/track-order' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Seasonal Catalogs', href: '/catalogs' },
                { label: 'Wishlist', href: '/wishlist' },
                { label: 'FAQ & Policy', href: '/contact#faq' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-block' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>WhatsApp</div>
                <a href="https://wa.me/923267603975" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>+92 326 7603975</a>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Email</div>
                <a href="mailto:aurangzaibshop@gmail.com" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>aurangzaibshop@gmail.com</a>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Hours</div>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Mon–Sat, 10am – 8pm PKT</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div style={{ marginTop: 56, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Our Location: SOS Children's Village Multan</span>
            <a 
              href="https://maps.app.goo.gl/63032b49e830e00d" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}
            >
              Open in Google Maps
            </a>
          </div>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.887204556403!2d71.49386347535!3d30.21175647483649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b338d10731f8f%3A0x63032b49e830e00d!2sSOS%20Children%27s%20Village%20Multan!5e0!3m2!1sen!2spk!4v1715426000000!5m2!1sen!2spk" 
            width="100%" 
            height="300" 
            style={{ border: 0, display: 'block' }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © {year} Aurangzaib Garments. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            <span>💵 Cash on Delivery</span>
            <span>🚚 Nationwide Shipping</span>
            <span>🔄 Easy Returns</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
