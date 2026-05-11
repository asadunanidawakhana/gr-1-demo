'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Search, Loader2, MessageSquare, Clock, CheckCircle, XCircle, Send } from 'lucide-react'
import { toast } from '@/lib/toast'

interface Ticket {
  id: string; ticket_number: string; name: string; email: string;
  phone: string; subject: string; message: string; status: string;
  admin_reply: string; created_at: string;
}

export default function AdminSupportPage() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')

  useEffect(() => { if (profile?.is_admin) fetchTickets() }, [profile])

  async function fetchTickets() {
    setLoading(true)
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  const handleReply = async () => {
    if (!selectedTicket || !reply) return
    const { error } = await supabase.from('support_tickets').update({
      admin_reply: reply,
      status: 'resolved',
      replied_at: new Date().toISOString()
    }).eq('id', selectedTicket.id)

    if (error) toast.error(error.message)
    else {
      toast.success('Reply sent and ticket resolved')
      setReply('')
      setSelectedTicket(null)
      fetchTickets()
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Status updated to ${status}`); fetchTickets() }
  }

  const filtered = tickets.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.ticket_number.toLowerCase().includes(search.toLowerCase()))

  if (!profile?.is_admin) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar active="support" />

      <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Support Tickets</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 450px' : '1fr', gap: 24, alignItems: 'start' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
               <div style={{ position: 'relative', flex: 1 }}>
                 <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input value={search} onChange={e => setSearch(e.target.value)} className="form-input" placeholder="Search by name or ticket #..." style={{ paddingLeft: 36, height: 40 }} />
               </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} /></div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ticket</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Subject</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ticket => (
                    <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedTicket?.id === ticket.id ? '#f8f9ff' : 'transparent' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--gold)' }}>{ticket.ticket_number}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.name}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>{ticket.subject}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>{ticket.message}</div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: ticket.status === 'open' ? '#fee2e2' : ticket.status === 'resolved' ? '#dcfce7' : '#fef3c7', color: ticket.status === 'open' ? '#991b1b' : ticket.status === 'resolved' ? '#166534' : '#92400e' }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedTicket && (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 4 }}>TICKET #{selectedTicket.ticket_number}</div>
                  <h2 className="heading-md">{selectedTicket.subject}</h2>
                </div>
                <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><XCircle size={20} /></button>
              </div>

              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedTicket.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155' }}>{selectedTicket.message}</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="form-label">Admin Reply</label>
                <textarea className="form-input" value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response..." rows={5} style={{ marginBottom: 12 }} />
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReply} disabled={!reply}>
                  <Send size={18} /> Send Reply & Resolve
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Customer Contact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13 }}><strong>Email:</strong> {selectedTicket.email}</div>
                  <div style={{ fontSize: 13 }}><strong>Phone:</strong> {selectedTicket.phone || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
