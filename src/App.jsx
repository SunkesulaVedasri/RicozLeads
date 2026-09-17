import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import "./index.css";

const statusStyles = {
  New: 'status-new',
  Contacted: 'status-contacted',
  Converted: 'status-converted',
}

const landingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Start organizing your customer leads.',
    features: [
      'Up to 50 leads',
      'Lead search and filters',
      'Follow-up tracking',
      'Basic dashboard',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For growing businesses that need more control.',
    features: [
      'Unlimited leads',
      'Conversion analytics',
      'Export lead data',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Business',
    price: '$29',
    period: 'per month',
    description: 'For teams managing a larger sales pipeline.',
    features: [
      'Everything in Pro',
      'Team member access',
      'Advanced reports',
      'Lead automation',
    ],
  },
]

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  follow_up_date: '',
  notes: '',
}

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authMessage, setAuthMessage] = useState('')
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
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

    const result =
      authMode === 'login'
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
          })

    if (result.error) {
      setAuthMessage(result.error.message)
      return
    }

    setAuthMessage(
      authMode === 'login'
        ? 'Welcome back to your dashboard.'
        : 'Account created successfully. Please check your email for confirmation.'
    )
  }

  async function forgotPassword() {
    if (!email) {
      setAuthMessage('Please enter your email address first.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })

    setAuthMessage(
      error
        ? error.message
        : 'Password reset link sent. Please check your email.'
    )
  }

  async function resetPassword(event) {
    event.preventDefault()

    if (newPassword.length < 6) {
      setAuthMessage('Password must be at least 6 characters.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setAuthMessage(error.message)
      return
    }

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
    return (
      <main className="landing-page">
        <div className="page-container">
          <header className="top-nav">
            <div className="brand-box">
              <div className="brand-robot">🤖</div>

              <div>
                <h1>RicozLeads</h1>
                <p>Smart Lead Management</p>
              </div>
            </div>

            <div className="nav-actions">
              <a href="#plans">Pricing</a>

              <button
                className="secondary-button"
                onClick={() => openAuth('login')}
              >
                Login
              </button>
            </div>
          </header>

          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">Smart lead management made simple</span>

              <h2>
                Turn every lead into a
                <span> business opportunity.</span>
              </h2>

              <p>
                RicozLeads helps you organize customer leads, track follow-ups,
                manage conversations, and monitor conversions in one simple
                dashboard.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-button"
                  onClick={() => openAuth('signup')}
                >
                  Start for Free
                </button>

                <button
                  className="secondary-button large-button"
                  onClick={() => openAuth('login')}
                >
                  I already have an account
                </button>
              </div>

              <div className="feature-pills">
                <span>Fast</span>
                <span>Smart</span>
                <span>Secure</span>
              </div>
            </div>

            <div className="preview-card">
              <div className="preview-header">
                <div>
                  <small>Live Preview</small>
                  <h3>Lead Dashboard</h3>
                </div>

                <span className="online-badge">Online</span>
              </div>

              <div className="preview-stats">
                <div>
                  <p>Total Leads</p>
                  <strong>248</strong>
                  <small>Growing every month</small>
                </div>

                <div>
                  <p>Converted</p>
                  <strong>64</strong>
                  <small>Great progress</small>
                </div>
              </div>

              <div className="preview-leads">
                <div className="preview-leads-title">
                  <strong>Recent Leads</strong>
                  <span>Live preview</span>
                </div>

                {[
                  ['Arjun Kumar', 'New'],
                  ['Sneha Reddy', 'Contacted'],
                  ['Rahul Sharma', 'Converted'],
                ].map(([name, status]) => (
                  <div className="preview-lead" key={name}>
                    <div className="avatar">{name.charAt(0)}</div>

                    <div>
                      <strong>{name}</strong>
                      <small>Customer lead</small>
                    </div>

                    <span className={statusStyles[status]}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="why-section">
            <span className="eyebrow">Why RicozLeads?</span>

            <h2>Everything you need to manage leads better</h2>

            <p>
              Stop losing potential customers in spreadsheets, notebooks, and
              scattered messages.
            </p>

            <div className="why-grid">
              {[
                ['📋', 'Organize Leads', 'Keep all customer details in one clean place.'],
                ['📅', 'Never Miss Follow-ups', 'Track follow-up dates easily.'],
                ['📈', 'Track Conversions', 'Move leads from New to Converted.'],
                ['🔐', 'Secure Access', 'Use your personal account securely.'],
              ].map(([icon, title, text]) => (
                <div className="info-card" key={title}>
                  <div className="info-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="plans" className="plans-section">
            <span className="eyebrow">Simple pricing</span>

            <h2>Plans that grow with your business</h2>

            <p>Start free today. Upgrade whenever your business needs more power.</p>

            <div className="plans-grid">
              {landingPlans.map((plan) => (
                <article
                  className={`plan-card ${plan.featured ? 'featured-plan' : ''}`}
                  key={plan.name}
                >
                  {plan.featured && <span className="popular-tag">Most popular</span>}

                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>

                  <div className="plan-price">
                    {plan.price}
                    <small>{plan.period}</small>
                  </div>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>

                  <button
                    className="primary-button full-button"
                    onClick={() => openAuth('signup')}
                  >
                    {plan.name === 'Free' ? 'Start for Free' : `Choose ${plan.name}`}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <footer className="footer">
            © {new Date().getFullYear()} RicozLeads. Built for smarter growth.
          </footer>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="auth-page">
        <div className="auth-layout">
          <section className="auth-intro">
            <div className="big-robot">🤖</div>
            <span className="eyebrow">Rico AI System</span>
            <h1>Your smart assistant for better lead management.</h1>
            <p>
              Organize contacts, follow-ups, and conversions in one friendly
              command center.
            </p>
          </section>

          <section className="auth-card">
            <button
              className="back-button"
              onClick={() => {
                setShowLanding(true)
                setAuthMessage('')
              }}
            >
              ← Back to RicozLeads
            </button>

            <div className="auth-logo">🤖</div>
            <h2>RicozLeads</h2>

            <p className="auth-subtitle">
              {authMode === 'signup'
                ? 'Create your account'
                : authMode === 'reset'
                  ? 'Set a new password'
                  : 'Welcome to your lead dashboard'}
            </p>

            {authMode === 'reset' ? (
              <form onSubmit={resetPassword} className="auth-form">
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={6}
                />

                <button className="primary-button full-button">
                  Update Password
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="auth-form">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />

                {authMode === 'login' && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={forgotPassword}
                  >
                    Forgot password?
                  </button>
                )}

                <button className="primary-button full-button">
                  {authMode === 'login' ? 'Login to Dashboard' : 'Create Account'}
                </button>
              </form>
            )}

            {authMessage && <p className="auth-message">{authMessage}</p>}

            {authMode !== 'reset' && (
              <button
                className="switch-auth"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  setAuthMessage('')
                }}
              >
                {authMode === 'login'
                  ? 'New user? Create an account'
                  : 'Already registered? Login'}
              </button>
            )}
          </section>
        </div>
      </main>
    )
  }

  return (
    <Dashboard
      session={session}
      logout={() => supabase.auth.signOut()}
    />
  )
}

function FlyingHelpRobot() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hi! I am Rico AI. How can I help you today?',
    },
  ])

  const quickQuestions = [
    'How do I add a lead?',
    'How do I update a lead status?',
    'What is a follow-up date?',
    'How can I track conversions?',
  ]

  function getBotAnswer(text) {
    const value = text.toLowerCase()

    if (value.includes('add') || value.includes('create') || value.includes('new lead')) {
      return 'To add a lead, fill the Full Name and Email fields, then click Save Lead.'
    }

    if (
      value.includes('status') ||
      value.includes('contacted') ||
      value.includes('converted')
    ) {
      return 'You can update a lead status using the dropdown inside each lead card.'
    }

    if (
      value.includes('follow') ||
      value.includes('date') ||
      value.includes('reminder')
    ) {
      return 'A follow-up date is the date when you plan to contact the customer again.'
    }

    if (
      value.includes('conversion') ||
      value.includes('analytics') ||
      value.includes('track')
    ) {
      return 'Your dashboard calculates total leads, converted leads, conversion rate, and overdue follow-ups.'
    }

    if (value.includes('search') || value.includes('filter')) {
      return 'Use the search box to find leads by name, email, phone number, or notes.'
    }

    if (value.includes('edit') || value.includes('update')) {
      return 'Click Edit on any lead card, update the details, and click Update Lead.'
    }

    if (value.includes('delete') || value.includes('remove')) {
      return 'Click Delete on a lead card and confirm the action.'
    }

    if (value.includes('logout') || value.includes('sign out')) {
      return 'Click the Logout button in the top-right corner.'
    }

    return 'I can help with adding leads, statuses, follow-ups, searching, conversions, and dashboard usage.'
  }

  function askQuestion(text) {
    const cleanText = text.trim()

    if (!cleanText) return

    setMessages((current) => [
      ...current,
      {
        from: 'user',
        text: cleanText,
      },
      {
        from: 'bot',
        text: getBotAnswer(cleanText),
      },
    ])

    setQuestion('')
  }

  return (
    <div className="flying-robot-wrapper">
      {open && (
        <div className="robot-chat-window">
          <div className="robot-chat-header">
            <div>
              <strong>Rico AI Assistant</strong>
              <small>Your smart support robot</small>
            </div>

            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="robot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`robot-message-row ${
                  message.from === 'user' ? 'user-row' : ''
                }`}
              >
                <div
                  className={`robot-message ${
                    message.from === 'user' ? 'user-message' : ''
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="robot-chat-bottom">
            <div className="quick-questions">
              {quickQuestions.map((item) => (
                <button key={item} onClick={() => askQuestion(item)}>
                  {item}
                </button>
              ))}
            </div>

            <form
              className="robot-input-row"
              onSubmit={(event) => {
                event.preventDefault()
                askQuestion(question)
              }}
            >
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask Rico AI..."
              />

              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}

      <button
        className="flying-robot-button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open Rico AI help"
      >
        <span className="robot-online-dot" />
        <span className="robot-emoji">🤖</span>
        <span className="robot-tooltip">Need help?</span>
      </button>
    </div>
  )
}

function Dashboard({ session, logout }) {
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('Free')
  const [showPricing, setShowPricing] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Up to 50 leads',
        'Basic lead management',
        'Search and filter leads',
        'Follow-up date tracking',
      ],
    },
    {
      name: 'Pro',
      price: '$9',
      description: 'For growing businesses',
      features: [
        'Unlimited leads',
        'Advanced lead management',
        'Conversion analytics',
        'Priority support',
        'Export lead data',
      ],
    },
    {
      name: 'Business',
      price: '$29',
      description: 'For teams and professionals',
      features: [
        'Everything in Pro',
        'Team member access',
        'Advanced reports',
        'Lead automation',
        'Dedicated support',
      ],
    },
  ]

  async function load() {
    setLoading(true)

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setLeads(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function change(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function clear() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function save(event) {
    event.preventDefault()
    setMessage('Saving lead...')

    const payload = {
      ...form,
      follow_up_date: form.follow_up_date || null,
    }

    const result = editingId
      ? await supabase
          .from('leads')
          .update(payload)
          .eq('id', editingId)
      : await supabase.from('leads').insert([
          {
            ...payload,
            status: 'New',
          },
        ])

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage(editingId ? 'Lead updated successfully.' : 'New lead added successfully.')
    clear()
    await load()
  }

  async function updateStatus(id, value) {
    const { error } = await supabase
      .from('leads')
      .update({ status: value })
      .eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setLeads((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: value } : item
      )
    )
  }

  async function remove(id) {
    if (!window.confirm('Delete this lead?')) return

    const { error } = await supabase.from('leads').delete().eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setLeads((items) => items.filter((item) => item.id !== id))
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const count = (value) =>
    leads.filter((lead) => lead.status === value).length

  const overdueCount = leads.filter((lead) => {
    return (
      lead.follow_up_date &&
      lead.follow_up_date < today &&
      lead.status !== 'Converted'
    )
  }).length

  const dueTodayCount = leads.filter((lead) => {
    return (
      lead.follow_up_date === today &&
      lead.status !== 'Converted'
    )
  }).length

  const convertedCount = count('Converted')

  const conversionRate =
    leads.length === 0
      ? 0
      : Math.round((convertedCount / leads.length) * 100)

  const visible = useMemo(() => {
    return leads.filter((lead) => {
      const text = `
        ${lead.full_name}
        ${lead.email}
        ${lead.phone}
        ${lead.notes}
      `.toLowerCase()

      return (
        text.includes(search.toLowerCase()) &&
        (filter === 'All' || lead.status === filter)
      )
    })
  }, [leads, search, filter])

  return (
    <main className="dashboard-page">
      <div className="page-container">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">Online Command Center</span>
            <h1>Welcome back</h1>
            <p>Manage your customer leads from one simple dashboard.</p>
            <strong className="user-email">{session.user.email}</strong>
            <span className="current-plan">Current Plan: {selectedPlan}</span>
          </div>

          <div className="dashboard-actions">
            <button
              className="primary-button"
              onClick={() => setShowPricing((current) => !current)}
            >
              {showPricing ? 'Hide Premium Plans' : 'Upgrade to Premium'}
            </button>

            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {showPricing && (
          <section className="premium-section">
            <span className="eyebrow">Premium Options</span>
            <h2>Choose the right plan for your business</h2>

            <div className="plans-grid">
              {plans.map((plan) => (
                <article className="plan-card" key={plan.name}>
                  <h3>{plan.name}</h3>
                  <div className="plan-price">{plan.price}</div>
                  <p>{plan.description}</p>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>

                  <button
                    className="primary-button full-button"
                    disabled={selectedPlan === plan.name}
                    onClick={() => {
                      setSelectedPlan(plan.name)
                      setMessage(
                        plan.name === 'Free'
                          ? 'You are currently using the Free plan.'
                          : `${plan.name} plan selected. Payment integration can be connected next.`
                      )
                    }}
                  >
                    {selectedPlan === plan.name ? 'Current Plan' : `Choose ${plan.name}`}
                  </button>
                </article>
              ))}
            </div>

            <p className="payment-note">
              Payment is not connected yet. Plan selection is currently a frontend preview.
            </p>
          </section>
        )}

        <section className="stats-grid">
          {[
            ['Total Leads', leads.length, '👥'],
            ['New Leads', count('New'), '✨'],
            ['Contacted', count('Contacted'), '📞'],
            ['Converted', convertedCount, '🎯'],
            ['Conversion Rate', `${conversionRate}%`, '📈'],
            ['Overdue', overdueCount, '⚠️'],
          ].map(([label, value, icon]) => (
            <div className="stat-card" key={label}>
              <div className="stat-top">
                <span>{label}</span>
                <strong>{icon}</strong>
              </div>
              <h2>{value}</h2>
            </div>
          ))}
        </section>

        {(overdueCount > 0 || dueTodayCount > 0) && (
          <section className="alerts-grid">
            {dueTodayCount > 0 && (
              <div className="alert today-alert">
                You have {dueTodayCount} follow-up{dueTodayCount > 1 ? 's' : ''} due today.
              </div>
            )}

            {overdueCount > 0 && (
              <div className="alert overdue-alert">
                You have {overdueCount} overdue lead{overdueCount > 1 ? 's' : ''}.
              </div>
            )}
          </section>
        )}

        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Lead Management</span>
              <h2>{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
            </div>

            {editingId && (
              <button className="secondary-button" onClick={clear}>
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={save} className="lead-form">
            <input
              type="text"
              placeholder="Full name"
              value={form.full_name}
              onChange={(event) => change('full_name', event.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => change('email', event.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Phone number"
              value={form.phone}
              onChange={(event) => change('phone', event.target.value)}
            />

            <input
              type="date"
              value={form.follow_up_date}
              onChange={(event) => change('follow_up_date', event.target.value)}
            />

            <textarea
              rows="2"
              placeholder="Notes about this lead..."
              value={form.notes}
              onChange={(event) => change('notes', event.target.value)}
            />

            <button className="primary-button">
              {editingId ? 'Update Lead' : 'Save Lead'}
            </button>
          </form>

          {message && <p className="dashboard-message">{message}</p>}
        </section>

        <section className="dashboard-card">
          <div className="search-row">
            <input
              placeholder="Search leads by name, email, or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Converted</option>
            </select>
          </div>

          <div className="section-heading">
            <div>
              <span className="eyebrow">Customer Pipeline</span>
              <h2>Your Leads</h2>
            </div>

            <span className="result-count">{visible.length} results</span>
          </div>

          {loading ? (
            <div className="empty-state">Loading your leads...</div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛰️</div>
              <h3>No leads found</h3>
              <p>Add your first lead to start building your customer pipeline.</p>
            </div>
          ) : (
            <div className="leads-list">
              {visible.map((lead) => {
                const overdue =
                  lead.follow_up_date &&
                  lead.follow_up_date < today &&
                  lead.status !== 'Converted'

                return (
                  <article
                    className={`lead-card ${overdue ? 'overdue-lead' : ''}`}
                    key={lead.id}
                  >
                    <div className="lead-details">
                      <div className="lead-avatar">
                        {lead.full_name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <h3>{lead.full_name}</h3>
                        <p>{lead.email}</p>
                        <p>{lead.phone || 'No phone number'}</p>

                        {lead.follow_up_date && (
                          <p className={overdue ? 'overdue-text' : 'followup-text'}>
                            Follow-up: {lead.follow_up_date}
                            {overdue ? ' · Overdue' : ''}
                          </p>
                        )}

                        {lead.notes && <p>Notes: {lead.notes}</p>}
                      </div>
                    </div>

                    <div className="lead-actions">
                      <select
                        className={statusStyles[lead.status] || statusStyles.New}
                        value={lead.status || 'New'}
                        onChange={(event) =>
                          updateStatus(lead.id, event.target.value)
                        }
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Converted</option>
                      </select>

                      <button
                        className="edit-button"
                        onClick={() => editLead(lead)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => remove(lead.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <FlyingHelpRobot />
    </main>
  )
}

export default App