import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const statusStyles = {
  New: 'bg-cyan-100 text-cyan-700',
  Contacted: 'bg-violet-100 text-violet-700',
  Converted: 'bg-emerald-100 text-emerald-700',
}

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession)
        if (event === 'PASSWORD_RECOVERY') setAuthMode('reset')
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function handleAuth(e) {
    e.preventDefault()
    setAuthMessage('Please wait...')
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (result.error) return setAuthMessage(result.error.message)
    setAuthMessage(authMode === 'login'
      ? 'Welcome back, captain 🤖'
      : 'Account created. Check your email for confirmation.')
  }

  async function forgotPassword() {
    if (!email) return setAuthMessage('Enter your email first.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    setAuthMessage(error ? error.message : 'Reset link sent. Check your email.')
  }

  async function resetPassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) return setAuthMessage('Password must be at least 6 characters.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return setAuthMessage(error.message)
    setAuthMessage('Password updated successfully.')
    setNewPassword('')
    setAuthMode('login')
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#090b24] px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center gap-12">
          <section className="hidden max-w-md md:block">
            <div className="mb-5 text-7xl">🤖</div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">Ricoz AI System</p>
            <h1 className="text-6xl font-black leading-tight">Your cute robot for smarter leads.</h1>
            <p className="mt-5 text-lg text-indigo-200">Organize contacts, follow-ups and conversions in one friendly command center.</p>
            <div className="mt-8 flex gap-3 text-sm">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2">⚡ Fast</span>
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2">🧠 Smart</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2">🔒 Secure</span>
            </div>
          </section>

          <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-500 text-5xl shadow-lg">🤖</div>
              <h2 className="text-3xl font-black">RicozLeads</h2>
              <p className="mt-2 text-sm text-indigo-200">
                {authMode === 'signup' ? 'Create your robot account' : authMode === 'reset' ? 'Set a new secret password' : 'Welcome to your lead command center'}
              </p>
            </div>

            {authMode === 'reset' ? (
              <form onSubmit={resetPassword} className="space-y-4">
                <input className="w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-300" type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-3 font-bold text-slate-950">Update Password 🚀</button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <input className="w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                <input className="w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                {authMode === 'login' && <button type="button" onClick={forgotPassword} className="text-sm text-cyan-300 hover:underline">Forgot password?</button>}
                <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-3 font-black text-slate-950">{authMode === 'login' ? 'Login to System 🤖' : 'Create Account ✨'}</button>
              </form>
            )}

            {authMessage && <p className="mt-4 rounded-2xl bg-black/25 p-3 text-sm text-cyan-100">{authMessage}</p>}
            {authMode !== 'reset' && <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage('') }} className="mt-5 w-full text-sm text-fuchsia-300 hover:underline">{authMode === 'login' ? 'New user? Create account' : 'Already registered? Login'}</button>}
          </section>
        </div>
      </main>
    )
  }

  return <Dashboard session={session} logout={() => supabase.auth.signOut()} />
}

function Dashboard({ session, logout }) {
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', follow_up_date: '', notes: '' })
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')

  async function load() {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setLeads(data || [])
  }
  useEffect(() => { load() }, [])

  function change(key, value) { setForm(current => ({ ...current, [key]: value })) }
  function clear() { setForm({ full_name: '', email: '', phone: '', follow_up_date: '', notes: '' }); setEditingId(null) }

  async function save(e) {
    e.preventDefault()
    const payload = { ...form, follow_up_date: form.follow_up_date || null }
    const result = editingId
      ? await supabase.from('leads').update(payload).eq('id', editingId)
      : await supabase.from('leads').insert([{ ...payload, status: 'New' }])
    if (result.error) return setMessage(result.error.message)
    setMessage(editingId ? 'Lead updated ✨' : 'New lead added 🤖')
    clear(); load()
  }

  async function status(id, value) {
    const { error } = await supabase.from('leads').update({ status: value }).eq('id', id)
    if (error) setMessage(error.message)
    else setLeads(items => items.map(x => x.id === id ? { ...x, status: value } : x))
  }

  async function remove(id) {
    if (!confirm('Delete this lead?')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) setMessage(error.message)
    else setLeads(items => items.filter(x => x.id !== id))
  }

  const visible = leads.filter(x => {
    const text = `${x.full_name} ${x.email} ${x.phone} ${x.notes}`.toLowerCase()
    return text.includes(search.toLowerCase()) && (filter === 'All' || x.status === filter)
  })
  const count = value => leads.filter(x => x.status === value).length
  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-[#090b24] px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">🤖 Online</p><h1 className="mt-1 text-4xl font-black">RicozLeads</h1><p className="text-indigo-200">Captain: {session.user.email}</p></div>
          <button onClick={logout} className="rounded-2xl bg-gradient-to-r from-rose-400 to-fuchsia-500 px-5 py-3 font-bold text-slate-950">Logout 👋</button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Total Leads', leads.length, 'from-cyan-400/20'], ['New', count('New'), 'from-blue-400/20'], ['Contacted', count('Contacted'), 'from-violet-400/20'], ['Converted', count('Converted'), 'from-emerald-400/20']].map(([label, value, bg]) => <div key={label} className={`rounded-[1.7rem] border border-white/10 bg-gradient-to-br ${bg} to-white/5 p-5 shadow-lg`}><p className="text-indigo-200">{label}</p><p className="mt-2 text-4xl font-black">{value}</p></div>)}
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-2xl font-black">{editingId ? '🛠️ Edit Lead' : '➕ Add New Lead'}</h2>
          <form onSubmit={save} className="grid gap-3 md:grid-cols-4">
            {['full_name', 'email', 'phone', 'follow_up_date'].map(key => <input key={key} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300" type={key === 'email' ? 'email' : key === 'follow_up_date' ? 'date' : 'text'} placeholder={key.replaceAll('_', ' ')} value={form[key]} onChange={e => change(key, e.target.value)} required={key === 'full_name' || key === 'email'} />)}
            <textarea className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 md:col-span-3" rows="2" placeholder="Notes..." value={form.notes} onChange={e => change('notes', e.target.value)} />
            <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-3 font-black text-slate-950">{editingId ? 'Update Lead' : 'Save Lead'} 🚀</button>
          </form>
          {editingId && <button onClick={clear} className="mt-3 rounded-xl bg-white/10 px-4 py-2">Cancel edit</button>}
          {message && <p className="mt-4 rounded-2xl bg-black/20 p-3 text-cyan-100">{message}</p>}
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row"><input className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white placeholder:text-indigo-200" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} /><select className="rounded-2xl border border-white/10 bg-slate-900 p-3" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>New</option><option>Contacted</option><option>Converted</option></select></div>
          <h2 className="mt-6 text-2xl font-black">Your Leads 🛰️</h2>
          <div className="mt-4 space-y-3">{visible.length === 0 ? <p className="rounded-2xl bg-black/20 p-4 text-indigo-200">No leads found.</p> : visible.map(lead => { const overdue = lead.follow_up_date && lead.follow_up_date < today && lead.status !== 'Converted'; return <article key={lead.id} className={`rounded-2xl border p-4 ${overdue ? 'border-rose-400 bg-rose-500/10' : 'border-white/10 bg-black/15'}`}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h3 className="text-lg font-bold">{lead.full_name}</h3><p className="text-indigo-200">{lead.email} · {lead.phone || 'No phone'}</p>{lead.follow_up_date && <p className={overdue ? 'text-rose-300' : 'text-amber-300'}>📅 {lead.follow_up_date}{overdue ? ' · Overdue' : ''}</p>}{lead.notes && <p className="mt-1 text-sm text-indigo-200">📝 {lead.notes}</p>}</div><div className="flex flex-wrap gap-2"><select className={`rounded-xl border-0 p-2 font-bold ${statusStyles[lead.status] || statusStyles.New}`} value={lead.status || 'New'} onChange={e => status(lead.id, e.target.value)}><option>New</option><option>Contacted</option><option>Converted</option></select><button onClick={() => { setEditingId(lead.id); setForm({ full_name: lead.full_name || '', email: lead.email || '', phone: lead.phone || '', follow_up_date: lead.follow_up_date || '', notes: lead.notes || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="rounded-xl bg-amber-300 px-3 py-2 font-bold text-slate-950">Edit</button><button onClick={() => remove(lead.id)} className="rounded-xl bg-rose-400 px-3 py-2 font-bold text-slate-950">Delete</button></div></div></article> })}</div>
        </section>
      </div>
    </main>
  )
}

export default App
