'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import Link from 'next/link'
import { Loader2, MessageSquare, Mail, Phone, ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days across Pakistan. Express delivery is available in major cities within 24–48 hours.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for items in original condition with tags attached. Contact support to initiate a return.' },
  { q: 'Do you offer Cash on Delivery?', a: 'Yes! We exclusively offer Cash on Delivery (COD) across all of Pakistan for a secure, hassle-free shopping experience.' },
  { q: 'How do I track my order?', a: 'Visit our Track Order page and enter your order number (e.g., AG-20260511-12345) to see real-time status updates.' },
  { q: 'Are your products authentic?', a: 'All our products are 100% authentic and directly sourced. We maintain strict quality checks on every item.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placement. Contact us immediately via support or WhatsApp.' },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('support_tickets').insert({
      name: form.name, email: form.email, phone: form.phone,
      subject: form.subject, message: form.message,
      status: 'open'
    })
    setLoading(false)
    if (error) { toast.error('Failed to submit ticket. Please try again.'); return }
    setSent(true)
    toast.success('Support ticket submitted!')
  }

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--dark)', padding: 'clamp(32px, 5vw, 56px) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-eyebrow">We're here to help</div>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800 }}>Customer Support</h1>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>

          {/* Contact Form */}
          <div>
            <h2 className="heading-lg" style={{ marginBottom: 24 }}>
              <MessageSquare size={24} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle', color: 'var(--gold)' }} />
              Submit a Ticket
            </h2>

            {sent ? (
              <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: 8, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#065f46', marginBottom: 8 }}>Ticket Submitted!</h3>
                <p style={{ color: '#047857', fontSize: 14 }}>We'll respond to your email within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }} style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-input" id="support-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" id="support-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="03001234567" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" id="support-email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input className="form-input" id="support-subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Order issue, return request, etc." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-input" id="support-message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={5} style={{ resize: 'vertical' }} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>

          {/* FAQ + Contact Info */}
          <div>
            <h2 className="heading-lg" style={{ marginBottom: 24 }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: openFaq === i ? 'var(--bg-primary)' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{faq.q}</span>
                    <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-muted)', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 16px 14px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="card" style={{ padding: 24 }}>
              <h3 className="heading-md" style={{ marginBottom: 20 }}>Contact Us Directly</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href="mailto:support@aurangzaib.com" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} color="var(--gold)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Email</div>
                    <div style={{ fontWeight: 500 }}>support@aurangzaib.com</div>
                  </div>
                </a>
                <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={18} color="var(--gold)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>WhatsApp</div>
                    <div style={{ fontWeight: 500 }}>+92 300 123 4567</div>
                  </div>
                </a>
              </div>
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                🕒 Support hours: Mon–Sat, 10:00 AM – 8:00 PM PKT
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
