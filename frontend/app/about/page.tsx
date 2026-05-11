import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section style={{ background: 'var(--dark)', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 700 }}>
            <span className="section-eyebrow" style={{ color: 'var(--gold)' }}>The Brand</span>
            <h1 className="display-lg" style={{ color: '#fff', marginBottom: 24 }}>Crafting Elegance, Defining Style.</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.8 }}>
              Aurangzaib Garments is more than just a fashion brand; it's a testament to the rich heritage of Pakistani craftsmanship blended with modern aesthetic sensibilities.
            </p>
          </div>
        </div>
        {/* Abstract background element */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '120%', background: 'linear-gradient(45deg, transparent, rgba(201,166,107,0.05))', borderRadius: '50%' }} />
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
               <Image src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800" alt="Our Workshop" fill style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <h2 className="heading-xl" style={{ marginBottom: 24 }}>Our Journey</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8 }}>
                <p>
                  Founded with a vision to redefine premium fashion in Pakistan, Aurangzaib Garments started as a small workshop dedicated to handcrafted excellence. Every stitch, every fabric, and every design was a labor of love.
                </p>
                <p>
                  Today, we have grown into a brand that stands for quality and sophistication. We source the finest materials from across the country to create pieces that are not just clothes, but expressions of identity.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 12 }}>
                   <div>
                     <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>10k+</div>
                     <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Happy Customers</div>
                   </div>
                   <div>
                     <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>100%</div>
                     <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Handcrafted</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Our Values</span>
            <h2 className="heading-xl">What We Stand For</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { title: 'Premium Quality', desc: 'We never compromise on the quality of our fabrics and craftsmanship.', icon: '🏆' },
              { title: 'Ethical Sourcing', desc: 'Our materials are sourced responsibly, supporting local artisans.', icon: '🤝' },
              { title: 'Customer First', desc: 'Your satisfaction is our priority, from browsing to delivery.', icon: '❤️' },
              { title: 'Innovation', desc: 'Constantly evolving our designs to stay ahead of trends.', icon: '✨' },
            ].map(val => (
              <div key={val.title} className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{val.icon}</div>
                <h3 className="heading-md" style={{ marginBottom: 12 }}>{val.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
           <h2 className="heading-xl" style={{ marginBottom: 16 }}>Experience the Collection</h2>
           <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 600, marginInline: 'auto' }}>
             Discover pieces that speak to your style and elevate your wardrobe.
           </p>
           <a href="/categories" className="btn btn-gold btn-lg">Shop Now</a>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  )
}
