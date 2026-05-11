'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.from('support_tickets').insert([formData])
      if (error) throw error
      
      toast.success("Message sent! We'll get back to you soon.")
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error: any) {
      toast.error(error.message || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <section style={{ background: 'var(--dark)', color: '#fff', padding: '100px 0 60px', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16 }}>Contact Us</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>Get in Touch</h1>
          <p style={{ maxWidth: 600, margin: '0 auto', color: 'rgba(255,255,255,0.6)', fontSize: 18, lineHeight: 1.6 }}>
            Have a question about our products or your order? Our team is here to help you with premium support.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60 }}>
            
            {/* Contact Info */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, marginBottom: 40 }}>Contact Information</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {[
                  { icon: Phone, title: 'Call Us', detail: '+92 326 7603975', sub: 'Mon-Sat, 9am - 6pm' },
                  { icon: Mail, title: 'Email Us', detail: 'aurangzaibshop@gmail.com', sub: '24/7 Online Support' },
                  { icon: MapPin, title: 'Visit Us', detail: 'Aurangzaib Flagship Store', sub: 'Gulberg III, Lahore, Pakistan' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 2 }}>{item.detail}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 60, padding: 32, background: 'var(--bg-secondary)', borderRadius: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Need Immediate Help?</h3>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                  Check out our FAQ or track your order directly from your account dashboard for faster resolution.
                </p>
                <button className="btn btn-outline" style={{ width: '100%' }}>View Help Center</button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card" style={{ padding: 40, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Send a Message</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+92 ..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input required className="form-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="How can we help?" />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea required className="form-input" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Type your message here..." rows={5} />
                </div>
                
                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', height: 56, fontSize: 16 }}>
                  {loading ? 'Sending...' : <><Send size={20} /> Send Message</>}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', background: '#fafafa' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px 80px' }}>
            {[
              { icon: ShieldCheck, text: 'Secure Messaging' },
              { icon: Clock, text: '24-Hour Response' },
              { icon: MessageSquare, text: 'Live Chat Support' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>
                <item.icon size={20} color="var(--gold)" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
