
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import './index.css'

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  follow_up_date: '',
  notes: '',
}

const navItems = [
  ['overview', '⌂', 'Overview'],
  ['leads', '◉', 'Leads'],
  ['followups', '◷', 'Follow-ups'],
  ['analytics', '◒', 'Analytics'],
  ['documents', '▤', 'Documents'],
  ['invoices', '▣', 'Invoices'],
  ['team', '♙', 'Team'],
  ['ai', '✦', 'Rico AI'],
]

const statuses = ['New', 'Contacted', 'Converted']

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authMessage, setAuthMessage] = useState('')
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession)
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('reset')
        setShowLanding(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleAuth(event) {
    event.preventDefault()
    setAuthMessage('Please wait...')
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (result.error) return setAuthMessage(result.error.message)
    setAuthMessage(authMode === 'login'
      ? 'Welcome back! Loading your workspace...'
      : 'Account created. Check your email for confirmation.')
  }

  async function forgotPassword() {
    if (!email) return setAuthMessage('Enter your email address first.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })
    setAuthMessage(error ? error.message : 'Password reset link sent. Check your email.')
  }

  async function resetPassword(event) {
    event.preventDefault()
    if (newPassword.length < 6) return setAuthMessage('Password must be at least 6 characters.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return setAuthMessage(error.message)
    setAuthMessage('Password updated successfully.')
    setNewPassword('')
    setAuthMode('login')
    setShowLanding(false)
    await supabase.auth.signOut()
  }

  function openAuth(mode) {
    setAuthMode(mode)
    setShowLanding(false)
    setAuthMessage('')
  }

  if (!session && showLanding && authMode !== 'reset') {
    return <Landing openAuth={openAuth} />
  }

  if (!session) {
    return (
      <main className="auth-page">
        <div className="auth-layout">
          <section className="auth-intro">
            <div className="brand-mark large">🤖</div>
            <span className="eyebrow">Rico AI command center</span>
            <h1>Turn every lead into a clear next action.</h1>
            <p>RicozLeads brings leads, follow-ups, analytics and AI guidance into one workspace.</p>
            <div className="auth-benefits">
              <span>✓ Smart pipeline</span>
              <span>✓ Follow-up alerts</span>
              <span>✓ AI insights</span>
            </div>
          </section>

          <section className="auth-card">
            <button className="back-link" onClick={() => { setShowLanding(true); setAuthMessage('') }}>← Back to RicozLeads</button>
            <div className="auth-logo">🤖</div>
            <h2>{authMode === 'signup' ? 'Create your workspace' : authMode === 'reset' ? 'Set a new password' : 'Welcome back'}</h2>
            <p className="muted">{authMode === 'signup' ? 'Start managing your leads in minutes.' : 'Sign in to your smart sales workspace.'}</p>

            {authMode === 'reset' ? (
              <form className="auth-form" onSubmit={resetPassword}>
                <label>New password<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required /></label>
                <button className="primary-button wide">Update Password</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleAuth}>
                <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
                <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required /></label>
                {authMode === 'login' && <button type="button" className="text-button" onClick={forgotPassword}>Forgot password?</button>}
                <button className="primary-button wide">{authMode === 'login' ? 'Open My Workspace →' : 'Create Workspace →'}</button>
              </form>
            )}

            {authMessage && <div className="auth-message">{authMessage}</div>}
            {authMode !== 'reset' && (
              <button className="switch-auth" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage('') }}>
                {authMode === 'login' ? 'New here? Create an account' : 'Already registered? Login'}
              </button>
            )}
          </section>
        </div>
      </main>
    )
  }

  return <Dashboard session={session} logout={() => supabase.auth.signOut()} />
}

function Landing({ openAuth }) {
  return (
    <main className="landing-page">
      <div className="landing-shell">
        <header className="landing-nav">
          <div className="brand">
            <div className="brand-mark">🤖</div>
            <div><strong>RicozLeads</strong><small>SMART LEAD MANAGEMENT</small></div>
          </div>
          <div className="landing-actions">
            <a href="#features">Features</a><a href="#plans">Pricing</a>
            <button className="secondary-button" onClick={() => openAuth('login')}>Login</button>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">AI-powered sales workspace</span>
            <h1>Know your next move.<br /><span>Grow every lead.</span></h1>
            <p>RicozLeads combines a clean CRM, smart follow-ups, pipeline analytics and a helpful AI assistant in one simple workspace.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => openAuth('signup')}>Start for Free →</button>
              <button className="secondary-button large" onClick={() => openAuth('login')}>I already have an account</button>
            </div>
            <div className="hero-proof"><span>● No credit card</span><span>● Fast setup</span><span>● Built for growing teams</span></div>
          </div>

          <div className="hero-preview">
            <div className="preview-window">
              <div className="window-top"><span>RicozLeads</span><span className="live-pill">● LIVE</span></div>
              <div className="preview-greeting">Good morning 👋</div>
              <div className="preview-ai"><span>🤖</span><div><strong>Rico's Daily Brief</strong><p>3 leads need attention today. Start with your overdue follow-ups.</p></div></div>
              <div className="preview-metrics">
                <div><small>Total leads</small><strong>248</strong><em>+18%</em></div>
                <div><small>Conversion</small><strong>26%</strong><em>+7%</em></div>
                <div><small>Follow-ups</small><strong>12</strong><em>Today</em></div>
              </div>
              <div className="preview-pipeline"><small>PIPELINE PULSE</small><div><b>New</b><span style={{width:'78%'}}></span><strong>124</strong></div><div><b>Contacted</b><span style={{width:'54%'}}></span><strong>76</strong></div><div><b>Converted</b><span style={{width:'28%'}}></span><strong>48</strong></div></div>
            </div>
          </div>
        </section>

        <section id="features" className="feature-section">
          <div className="section-title"><span className="eyebrow">More than a lead list</span><h2>A workspace that thinks in next steps.</h2></div>
          <div className="feature-grid">
            {[
              ['✦','Rico AI Daily Brief','Get a quick summary of overdue leads, today’s follow-ups and pipeline movement.'],
              ['🎯','Priority Radar','Spot leads that deserve attention using follow-up timing, status and notes.'],
              ['◒','Pipeline Pulse','See New → Contacted → Converted movement without opening another tool.'],
              ['⚡','Quick Actions','Add a lead, jump to follow-ups, filter converted leads or open AI in one click.'],
              ['📁','Workspace Hub','Keep documents, invoices and team actions visible from one sidebar.'],
              ['🔔','Action Alerts','Turn overdue follow-ups into visible tasks instead of forgotten dates.'],
            ].map(([icon,title,text]) => <article className="feature-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section id="plans" className="pricing-section">
          <div className="section-title"><span className="eyebrow">Simple pricing</span><h2>Start small. Scale when ready.</h2></div>
          <div className="pricing-grid">
            {[
              ['Free','$0','50 leads','Lead management','Follow-up tracking','Basic analytics'],
              ['Pro','$9','Unlimited leads','AI insights','Advanced analytics','Export-ready data'],
              ['Business','$29','Everything in Pro','Team workspace','Automation-ready','Priority support'],
            ].map((plan,i) => <article className={`pricing-card ${i===1?'featured':''}`} key={plan[0]}><span className="plan-label">{i===1?'MOST POPULAR':'PLAN'}</span><h3>{plan[0]}</h3><strong>{plan[1]}<small>/month</small></strong><ul>{plan.slice(2).map(x=><li key={x}>✓ {x}</li>)}</ul><button className="primary-button wide" onClick={() => openAuth('signup')}>{plan[0]==='Free'?'Start Free':`Choose ${plan[0]}`}</button></article>)}
          </div>
        </section>
      </div>
    </main>
  )
}

function Dashboard({ session, logout }) {
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState('overview')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('ricoz_onboarding_done') !== 'yes')
  const [mobileNav, setMobileNav] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function change(key, value) { setForm(current => ({ ...current, [key]: value })) }
  function clear() { setForm(emptyForm); setEditingId(null) }

  async function save(event) {
    event.preventDefault()
    setMessage('Saving lead...')
    const payload = { ...form, follow_up_date: form.follow_up_date || null }
    const result = editingId
      ? await supabase.from('leads').update(payload).eq('id', editingId)
      : await supabase.from('leads').insert([{ ...payload, status: 'New' }])
    if (result.error) return setMessage(result.error.message)
    setMessage(editingId ? 'Lead updated successfully.' : 'New lead added successfully.')
    clear()
    await load()
  }

  async function updateStatus(id, value) {
    const { error } = await supabase.from('leads').update({ status: value }).eq('id', id)
    if (error) return setMessage(error.message)
    setLeads(items => items.map(item => item.id === id ? { ...item, status: value } : item))
  }

  async function remove(id) {
    if (!window.confirm('Delete this lead?')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) return setMessage(error.message)
    setLeads(items => items.filter(item => item.id !== id))
    setMessage('Lead deleted successfully.')
  }

  function editLead(lead) {
    setEditingId(lead.id)
    setForm({
      full_name: lead.full_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      follow_up_date: lead.follow_up_date || '',
      notes: lead.notes || '',
    })
    setView('leads')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const count = value => leads.filter(lead => lead.status === value).length
  const overdue = leads.filter(l => l.follow_up_date && l.follow_up_date < today && l.status !== 'Converted')
  const dueToday = leads.filter(l => l.follow_up_date === today && l.status !== 'Converted')
  const converted = count('Converted')
  const conversionRate = leads.length ? Math.round((converted / leads.length) * 100) : 0

  const visible = useMemo(() => leads.filter(lead => {
    const text = `${lead.full_name} ${lead.email} ${lead.phone} ${lead.notes}`.toLowerCase()
    return text.includes(search.toLowerCase()) && (filter === 'All' || lead.status === filter)
  }), [leads, search, filter])

  const priorityLeads = [...leads].sort((a,b) => {
    const score = item => (item.follow_up_date && item.follow_up_date < today ? 40 : 0) + (item.follow_up_date === today ? 30 : 0) + (item.status === 'New' ? 15 : 0)
    return score(b) - score(a)
  }).slice(0,4)

  function navigate(item) {
    setView(item)
    setMobileNav(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="side-brand"><div className="brand-mark">🤖</div><div><strong>RicozLeads</strong><small>SMART CRM</small></div></div>
        <div className="workspace-switch"><span className="workspace-avatar">R</span><div><small>WORKSPACE</small><strong>My Business</strong></div><span>⌄</span></div>
        <nav>
          <small className="nav-caption">WORKSPACE</small>
          {navItems.map(([id,icon,label]) => <button key={id} className={view===id?'active':''} onClick={() => navigate(id)}><span>{icon}</span>{label}{id==='followups' && overdue.length > 0 && <b>{overdue.length}</b>}</button>)}
          <small className="nav-caption">SYSTEM</small>
          <button className={view==='settings'?'active':''} onClick={() => navigate('settings')}><span>⚙</span>Settings</button>
          <button onClick={logout}><span>↪</span>Logout</button>
        </nav>
        <div className="sidebar-ai"><span>✦</span><div><strong>Rico AI</strong><small>Ready to help</small></div><button onClick={() => setAiOpen(true)}>→</button></div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(v=>!v)}>☰</button>
          <div className="page-heading"><span className="eyebrow">RICOZ WORKSPACE</span><h1>{navItems.find(x=>x[0]===view)?.[2] || 'Settings'}</h1></div>
          <div className="top-actions">
            <div className="global-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads, notes..." /></div>
            <button className="icon-button" onClick={() => setAiOpen(true)}>✦</button>
            <button className="icon-button" onClick={() => setView('followups')}>♧</button>
            <div className="profile-chip"><span>{(session.user.email || 'U').charAt(0).toUpperCase()}</span><div><strong>{session.user.email?.split('@')[0]}</strong><small>Online</small></div></div>
          </div>
        </header>

        <main className="content">
          {view === 'overview' && <Overview leads={leads} converted={converted} conversionRate={conversionRate} overdue={overdue} dueToday={dueToday} priorityLeads={priorityLeads} navigate={navigate} setAiOpen={setAiOpen} />}
          {view === 'leads' && <LeadsView visible={visible} loading={loading} form={form} editingId={editingId} filter={filter} setFilter={setFilter} change={change} save={save} clear={clear} editLead={editLead} updateStatus={updateStatus} remove={remove} message={message} />}
          {view === 'followups' && <FollowupsView leads={leads} today={today} overdue={overdue} dueToday={dueToday} editLead={editLead} />}
          {view === 'analytics' && <AnalyticsView leads={leads} converted={converted} conversionRate={conversionRate} count={count} />}
          {view === 'documents' && <ModuleView icon="📁" title="Documents Hub" text="Keep proposals, brochures and customer files organized beside your sales pipeline." items={['Proposal templates','Product brochures','Customer documents','Shared team files']} />}
          {view === 'invoices' && <ModuleView icon="₹" title="Invoices & Payments" text="Keep revenue conversations connected to your leads. Payment integration can be added next." items={['Create invoice','Pending payments','Paid invoices','Revenue summary']} />}
          {view === 'team' && <ModuleView icon="♙" title="Team Workspace" text="A team-ready area for assigning leads, sharing notes and monitoring activity." items={['Team members','Lead assignment','Activity feed','Roles & permissions']} />}
          {view === 'ai' && <AIView leads={leads} overdue={overdue} dueToday={dueToday} conversionRate={conversionRate} setAiOpen={setAiOpen} />}
          {view === 'settings' && <ModuleView icon="⚙" title="Workspace Settings" text="Configure your RicozLeads workspace, notifications and future integrations." items={['Workspace profile','Notification preferences','Security','Integrations']} />}
        </main>
      </div>

      <button className="floating-ai" onClick={() => setAiOpen(true)}><span>✦</span><small>Ask Rico</small></button>
      {aiOpen && <RicoAI leads={leads} overdue={overdue} dueToday={dueToday} onClose={() => setAiOpen(false)} />}
      {showOnboarding && <Onboarding leads={leads} onClose={() => { localStorage.setItem('ricoz_onboarding_done','yes'); setShowOnboarding(false) }} navigate={navigate} />}
    </div>
  )
}

function Overview({ leads, converted, conversionRate, overdue, dueToday, priorityLeads, navigate, setAiOpen }) {
  const newCount = leads.filter(l=>l.status==='New').length
  const contacted = leads.filter(l=>l.status==='Contacted').length
  return (
    <div className="dashboard-content">
      <section className="welcome-banner">
        <div><span className="eyebrow">TODAY'S COMMAND CENTER</span><h2>Good morning 👋</h2><p>Here’s what needs your attention. Rico has already scanned your pipeline.</p></div>
        <div className="banner-actions"><button className="secondary-button" onClick={() => setAiOpen(true)}>✦ Ask Rico</button><button className="primary-button" onClick={() => navigate('leads')}>+ Add Lead</button></div>
      </section>

      <section className="ai-brief">
        <div className="ai-avatar">🤖</div><div className="ai-brief-copy"><span className="eyebrow">RICO AI · DAILY BRIEF</span><h3>Your pipeline has {overdue.length + dueToday.length} action{overdue.length + dueToday.length === 1?'':'s'} waiting.</h3><p>{overdue.length ? `${overdue.length} overdue follow-up${overdue.length>1?'s':''} should be reviewed first. ` : ''}{dueToday.length ? `${dueToday.length} follow-up${dueToday.length>1?'s':''} are due today. ` : ''}{!overdue.length&&!dueToday.length ? 'No urgent follow-ups right now. Keep building momentum.' : ''}</p></div><button onClick={() => navigate('followups')}>View priorities →</button>
      </section>

      <section className="metric-grid">
        <Metric label="Total Leads" value={leads.length} icon="◉" hint="All active records" />
        <Metric label="New Leads" value={newCount} icon="✦" hint="Waiting for first contact" />
        <Metric label="Contacted" value={contacted} icon="◷" hint="Conversations started" />
        <Metric label="Converted" value={converted} icon="✓" hint="Successful conversions" />
        <Metric label="Conversion Rate" value={`${conversionRate}%`} icon="◒" hint="Lead → customer" />
        <Metric label="Overdue" value={overdue.length} icon="!" hint="Needs attention" danger={overdue.length>0} />
      </section>

      <section className="overview-grid">
        <div className="panel pipeline-panel"><PanelHead eyebrow="PIPELINE PULSE" title="Lead journey" action="Open leads →" onClick={() => navigate('leads')} />
          {[
            ['New',newCount,'pipeline-new'],['Contacted',contacted,'pipeline-contacted'],['Converted',converted,'pipeline-converted']
          ].map(([label,value,cls]) => <div className="pipeline-row" key={label}><span>{label}</span><div className="pipeline-track"><i className={cls} style={{width:`${Math.max(6, leads.length ? value/leads.length*100 : 6)}%`}} /></div><strong>{value}</strong></div>)}
          <div className="pipeline-footer"><span>Conversion</span><strong>{conversionRate}%</strong><span>Momentum</span><strong>{converted > 0 ? 'Moving' : 'Build it'}</strong></div>
        </div>

        <div className="panel priority-panel"><PanelHead eyebrow="PRIORITY RADAR" title="Leads to watch" action="All follow-ups →" onClick={() => navigate('followups')} />
          {priorityLeads.length ? priorityLeads.map(lead => <div className="priority-row" key={lead.id}><span className="mini-avatar">{lead.full_name?.charAt(0)?.toUpperCase()}</span><div><strong>{lead.full_name}</strong><small>{lead.follow_up_date ? `Follow-up ${lead.follow_up_date}` : 'No follow-up date'}</small></div><em className={lead.status?.toLowerCase()}>{lead.status}</em></div>) : <Empty text="Add your first lead to activate the radar." />}
        </div>
      </section>

      <section className="quick-grid">
        {[
          ['+','Add a new lead','Create a customer record','leads'],
          ['◷','Plan follow-ups','Never miss the next conversation','followups'],
          ['◒','Explore analytics','Understand your pipeline','analytics'],
          ['✦','Talk to Rico','Get an AI workflow tip','ai'],
        ].map(([icon,title,text,id]) => <button key={id} className="quick-card" onClick={() => id==='ai'?setAiOpen(true):navigate(id)}><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div><b>→</b></button>)}
      </section>
    </div>
  )
}

function Metric({label,value,icon,hint,danger}) {
  return <div className={`metric-card ${danger?'danger':''}`}><div className="metric-top"><span>{icon}</span><small>{label}</small></div><strong>{value}</strong><p>{hint}</p></div>
}

function PanelHead({eyebrow,title,action,onClick}) {
  return <div className="panel-head"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div>{action&&<button onClick={onClick}>{action}</button>}</div>
}

function LeadsView({visible,loading,form,editingId,filter,setFilter,change,save,clear,editLead,updateStatus,remove,message}) {
  return <div className="dashboard-content">
    <section className="page-intro"><div><span className="eyebrow">CUSTOMER PIPELINE</span><h2>Leads</h2><p>Capture, qualify and move every customer opportunity forward.</p></div><button className="primary-button" onClick={() => document.getElementById('lead-form')?.scrollIntoView({behavior:'smooth'})}>+ New Lead</button></section>
    <section className="lead-layout">
      <div className="panel form-panel" id="lead-form"><PanelHead eyebrow={editingId?'EDIT RECORD':'QUICK CAPTURE'} title={editingId?'Update lead':'Add a lead'} action={editingId?'Cancel':null} onClick={clear}/><form onSubmit={save} className="lead-form-grid">
        <label>Full name<input value={form.full_name} onChange={e=>change('full_name',e.target.value)} placeholder="e.g. Ananya Rao" required /></label>
        <label>Email<input type="email" value={form.email} onChange={e=>change('email',e.target.value)} placeholder="customer@email.com" required /></label>
        <label>Phone<input value={form.phone} onChange={e=>change('phone',e.target.value)} placeholder="+91..." /></label>
        <label>Follow-up<input type="date" value={form.follow_up_date} onChange={e=>change('follow_up_date',e.target.value)} /></label>
        <label className="full">Notes<textarea rows="4" value={form.notes} onChange={e=>change('notes',e.target.value)} placeholder="Context, requirements, conversation notes..." /></label>
        <div className="form-buttons"><button className="primary-button">{editingId?'Update Lead':'Save Lead'}</button>{editingId&&<button type="button" className="secondary-button" onClick={clear}>Cancel</button>}</div>
      </form>{message&&<div className="inline-message">{message}</div>}</div>

      <div className="panel lead-list-panel"><div className="list-toolbar"><div><span className="eyebrow">RECORDS</span><h3>{visible.length} leads</h3></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
      {loading?<Empty text="Loading your leads..." />:visible.length===0?<Empty icon="🛰️" text="No leads match your current filter." />:<div className="lead-list">{visible.map(lead=><LeadRow key={lead.id} lead={lead} editLead={editLead} updateStatus={updateStatus} remove={remove}/>)}</div>}</div>
    </section>
  </div>
}

function LeadRow({lead,editLead,updateStatus,remove}) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = lead.follow_up_date && lead.follow_up_date < today && lead.status !== 'Converted'
  return <article className={`lead-row ${isOverdue?'overdue':''}`}><span className="lead-avatar">{lead.full_name?.charAt(0)?.toUpperCase()}</span><div className="lead-main"><strong>{lead.full_name}</strong><small>{lead.email} · {lead.phone || 'No phone'}</small>{lead.notes&&<p>{lead.notes}</p>}<small className={isOverdue?'danger-text':''}>{lead.follow_up_date ? `Follow-up: ${lead.follow_up_date}${isOverdue?' · OVERDUE':''}` : 'No follow-up scheduled'}</small></div><div className="lead-controls"><select className={`status-select ${lead.status?.toLowerCase()}`} value={lead.status||'New'} onChange={e=>updateStatus(lead.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select><button onClick={()=>editLead(lead)}>Edit</button><button className="delete-link" onClick={()=>remove(lead.id)}>Delete</button></div></article>
}

function FollowupsView({leads,today,overdue,dueToday,editLead}) {
  const upcoming = leads.filter(l => l.follow_up_date && l.follow_up_date > today && l.status !== 'Converted').sort((a,b)=>a.follow_up_date.localeCompare(b.follow_up_date))
  return <div className="dashboard-content"><section className="page-intro"><div><span className="eyebrow">ACTION CENTER</span><h2>Follow-ups</h2><p>One place for today, overdue and upcoming conversations.</p></div></section><div className="followup-stats"><Metric label="Overdue" value={overdue.length} icon="!" hint="Act first" danger={overdue.length>0}/><Metric label="Due Today" value={dueToday.length} icon="◷" hint="Today's calls"/><Metric label="Upcoming" value={upcoming.length} icon="→" hint="Scheduled next"/></div><section className="panel"><PanelHead eyebrow="FOLLOW-UP QUEUE" title="Action list" /><div className="followup-list">{[...overdue.map(l=>({...l,bucket:'Overdue'})),...dueToday.map(l=>({...l,bucket:'Today'})),...upcoming.map(l=>({...l,bucket:'Upcoming'}))].map(l=><div className={`followup-row ${l.bucket.toLowerCase()}`} key={`${l.bucket}-${l.id}`}><span className="followup-date"><b>{l.follow_up_date?.slice(8,10)}</b><small>{l.follow_up_date?.slice(5,7)}</small></span><div><strong>{l.full_name}</strong><p>{l.email} · {l.notes || 'Follow up with this lead.'}</p></div><em>{l.bucket}</em><button onClick={()=>editLead(l)}>Open lead →</button></div>)}{!overdue.length&&!dueToday.length&&!upcoming.length&&<Empty icon="◷" text="No scheduled follow-ups yet."/>}</div></section></div>
}

function AnalyticsView({leads,converted,conversionRate,count}) {
  const total = Math.max(leads.length,1)
  return <div className="dashboard-content"><section className="page-intro"><div><span className="eyebrow">PERFORMANCE</span><h2>Analytics</h2><p>A clear view of pipeline health using the leads already in your workspace.</p></div></section><div className="analytics-grid"><div className="panel big-chart"><PanelHead eyebrow="PIPELINE" title="Conversion flow"/><div className="funnel"><div style={{width:'100%'}}><span>All leads</span><b>{leads.length}</b></div><div style={{width:`${Math.max(20,count('Contacted')/total*100)}%`}}><span>Contacted</span><b>{count('Contacted')}</b></div><div style={{width:`${Math.max(12,converted/total*100)}%`}}><span>Converted</span><b>{converted}</b></div></div></div><div className="panel"><PanelHead eyebrow="HEALTH" title="Pipeline snapshot"/><div className="health-list"><div><span>Conversion rate</span><strong>{conversionRate}%</strong></div><div><span>New leads</span><strong>{count('New')}</strong></div><div><span>Contacted</span><strong>{count('Contacted')}</strong></div><div><span>Converted</span><strong>{converted}</strong></div></div></div></div><div className="panel insight-panel"><div className="ai-avatar">✦</div><div><span className="eyebrow">RICO AI INSIGHT</span><h3>{leads.length ? `Your current conversion rate is ${conversionRate}%.` : 'Add a few leads to unlock pipeline insights.'}</h3><p>{converted ? 'Keep following up with active conversations while protecting time for new leads.' : 'Your next useful milestone is getting new leads into the Contacted stage.'}</p></div></div></div>
}

function AIView({leads,overdue,dueToday,conversionRate,setAiOpen}) {
  return <div className="dashboard-content"><section className="page-intro"><div><span className="eyebrow">RICO INTELLIGENCE</span><h2>Rico AI Center</h2><p>Your workspace assistant for prioritization, summaries and next-step ideas.</p></div><button className="primary-button" onClick={()=>setAiOpen(true)}>Open Rico →</button></section><div className="ai-center-grid"><div className="ai-hero-card"><div className="ai-orb">🤖</div><span className="eyebrow">TODAY'S BRIEF</span><h3>{overdue.length ? `You have ${overdue.length} overdue lead${overdue.length>1?'s':''}.` : 'Your pipeline is clear.'}</h3><p>{dueToday.length ? `${dueToday.length} follow-ups are due today. ` : ''}Current conversion rate: {conversionRate}%.</p><button className="primary-button" onClick={()=>setAiOpen(true)}>Ask Rico anything</button></div><div className="panel"><PanelHead eyebrow="SUGGESTIONS" title="What Rico can help with"/>{['Which leads should I contact first?','Explain my conversion rate','How do I manage follow-ups?','What should I do with a new lead?'].map(x=><button className="suggestion" key={x} onClick={()=>setAiOpen(true)}>✦ {x}<b>→</b></button>)}</div></div></div>
}

function ModuleView({icon,title,text,items}) {
  return <div className="dashboard-content"><section className="module-hero"><span>{icon}</span><div><span className="eyebrow">RICOZ WORKSPACE MODULE</span><h2>{title}</h2><p>{text}</p></div></section><div className="module-grid">{items.map((x,i)=><article className="module-card" key={x}><span>{['＋','◒','✓','✦'][i%4]}</span><h3>{x}</h3><p>Ready for your workspace data and future integrations.</p><button>Open →</button></article>)}</div></div>
}

function Empty({icon='◌',text}) { return <div className="empty-state"><span>{icon}</span><strong>{text}</strong></div> }

function Onboarding({leads,onClose,navigate}) {
  const [step,setStep]=useState(0)
  const steps = [['✓','Account ready','Your RicozLeads workspace is active.'],['＋','Add your first lead','Create a customer record and start your pipeline.'],['◷','Schedule a follow-up','Give every promising lead a next action.'],['✦','Meet Rico AI','Ask Rico to summarize your pipeline anytime.']]
  const progress = Math.round(((step+1)/steps.length)*100)
  return <div className="modal-backdrop"><div className="onboarding-modal"><button className="modal-close" onClick={onClose}>×</button><div className="onboarding-art"><div className="ai-orb">🤖</div><span className="eyebrow">RICO AI ONBOARDING</span><h2>Welcome to your command center.</h2><p>Let's turn your workspace into a simple daily sales routine.</p><div className="setup-progress"><span>Workspace setup</span><b>{progress}%</b><i><em style={{width:`${progress}%`}}/></i></div></div><div className="setup-list">{steps.map(([icon,title,text],i)=><button key={title} className={i===step?'current':i<step?'done':''} onClick={()=>setStep(i)}><span>{i<step?'✓':icon}</span><div><strong>{title}</strong><small>{text}</small></div>{i===step&&<b>●</b>}</button>)}<div className="onboarding-actions"><button className="secondary-button" onClick={onClose}>Skip for now</button><button className="primary-button" onClick={()=>{if(step<steps.length-1)setStep(step+1);else{onClose();navigate('leads')}}}>{step<steps.length-1?'Next →':'Open My Workspace →'}</button></div></div></div></div>
}

function RicoAI({leads,overdue,dueToday,onClose}) {
  const [question,setQuestion]=useState('')
  const [messages,setMessages]=useState([{from:'bot',text:`Hi! I'm Rico. You have ${leads.length} leads, ${overdue.length} overdue and ${dueToday.length} due today. What would you like to know?`}])
  function answer(text) {
    const v=text.toLowerCase()
    if(v.includes('priority')||v.includes('first')) return overdue.length ? `Start with your ${overdue.length} overdue follow-up${overdue.length>1?'s':''}. They are the clearest immediate actions.` : 'Start with New leads that have a follow-up date today or tomorrow.'
    if(v.includes('conversion')||v.includes('analytics')) return `You currently have ${leads.filter(l=>l.status==='Converted').length} converted leads out of ${leads.length}, a ${leads.length?Math.round(leads.filter(l=>l.status==='Converted').length/leads.length*100):0}% conversion rate.`
    if(v.includes('follow')) return `${dueToday.length} follow-up${dueToday.length===1?' is':'s are'} due today and ${overdue.length} ${overdue.length===1?'is':'are'} overdue. Open Follow-ups to work through them.`
    if(v.includes('add')||v.includes('lead')) return 'Open Leads → New Lead. Add the customer name and email, then set a follow-up date so the lead gets a next action.'
    if(v.includes('status')) return 'Use each lead card status menu to move a record between New, Contacted and Converted.'
    return 'I can help with priorities, conversions, follow-ups, lead creation and statuses. Try asking: “Which leads should I contact first?”'
  }
  function ask(text=question) {
    const clean=text.trim(); if(!clean)return
    setMessages(m=>[...m,{from:'user',text:clean},{from:'bot',text:answer(clean)}]);setQuestion('')
  }
  return <div className="ai-drawer-backdrop"><aside className="ai-drawer"><header><div><span className="ai-status">● ONLINE</span><h3>Rico AI</h3><small>Your sales co-pilot</small></div><button onClick={onClose}>×</button></header><div className="ai-stats"><div><b>{leads.length}</b><small>Leads</small></div><div><b>{overdue.length}</b><small>Overdue</small></div><div><b>{dueToday.length}</b><small>Today</small></div></div><div className="ai-messages">{messages.map((m,i)=><div key={i} className={`ai-msg ${m.from}`}>{m.text}</div>)}</div><div className="ai-quick">{['Which leads first?','Explain conversion','Follow-up status'].map(x=><button key={x} onClick={()=>ask(x)}>{x}</button>)}</div><form className="ai-input" onSubmit={e=>{e.preventDefault();ask()}}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask Rico anything..." /><button>→</button></form></aside></div>
}

export default App
