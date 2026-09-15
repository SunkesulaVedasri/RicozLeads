import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const statusStyles = {
  New: 'bg-cyan-100 text-cyan-700',
  Contacted: 'bg-violet-100 text-violet-700',
  Converted: 'bg-emerald-100 text-emerald-700',
}

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

    if (authMode === 'login') {
      setAuthMessage('Welcome back to your dashboard.')
    } else {
      setAuthMessage(
        'Account created successfully. Please check your email for confirmation.'
      )
    }
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
      <main className="min-h-screen overflow-hidden bg-[#090b24] px-4 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-500 text-3xl shadow-lg">
                🤖
              </div>

              <div>
                <h1 className="text-2xl font-black">RicozLeads</h1>

                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  Smart Lead Management
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuth('login')}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
            >
              Login
            </button>
          </header>

          <section className="grid min-h-[78vh] items-center gap-12 py-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
                Smart lead management made simple
              </div>

              <h2 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
                Turn every lead into a
                <span className="block bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
                  business opportunity.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-indigo-200">
                RicozLeads helps you organize customer leads, track follow-ups,
                manage conversations, and monitor conversions in one simple
                dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => openAuth('signup')}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-4 font-black text-slate-950 shadow-lg transition hover:scale-[1.02]"
                >
                  Start for Free
                </button>

                <button
                  onClick={() => openAuth('login')}
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold transition hover:bg-white/15"
                >
                  I already have an account
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-cyan-200">
                  Fast
                </span>

                <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-fuchsia-200">
                  Smart
                </span>

                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-emerald-200">
                  Secure
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                      Live Preview
                    </p>

                    <h3 className="mt-1 text-2xl font-black">
                      Lead Dashboard
                    </h3>
                  </div>

                  <div className="rounded-xl bg-emerald-400/20 px-3 py-2 text-sm text-emerald-300">
                    Online
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-indigo-200">Total Leads</p>
                    <p className="mt-2 text-3xl font-black">248</p>
                    <p className="mt-1 text-xs text-cyan-300">
                      Growing every month
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm text-indigo-200">Converted</p>
                    <p className="mt-2 text-3xl font-black">64</p>
                    <p className="mt-1 text-xs text-emerald-300">
                      Great progress
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">Recent Leads</p>
                    <span className="text-xs text-cyan-300">
                      Live preview
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      ['Arjun Kumar', 'New'],
                      ['Sneha Reddy', 'Contacted'],
                      ['Rahul Sharma', 'Converted'],
                    ].map(([name, status]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-fuchsia-500 text-sm font-black text-slate-950">
                            {name.charAt(0)}
                          </div>

                          <div>
                            <p className="text-sm font-bold">{name}</p>
                            <p className="text-xs text-indigo-200">
                              Customer lead
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${statusStyles[status]}`}
                        >
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-white/10 py-14">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                Why RicozLeads?
              </p>

              <h3 className="mt-3 text-3xl font-black sm:text-4xl">
                Everything you need to manage leads better
              </h3>

              <p className="mx-auto mt-4 max-w-2xl text-indigo-200">
                Stop losing potential customers in spreadsheets, notebooks,
                and scattered messages.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: '📋',
                  title: 'Organize Leads',
                  text: 'Keep all customer details in one clean and easy-to-use place.',
                },
                {
                  icon: '📅',
                  title: 'Never Miss Follow-ups',
                  text: 'Track follow-up dates and identify overdue leads quickly.',
                },
                {
                  icon: '📈',
                  title: 'Track Conversions',
                  text: 'Move leads from New to Contacted and Converted with ease.',
                },
                {
                  icon: '🔐',
                  title: 'Secure Access',
                  text: 'Use your personal account to access your lead dashboard.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.7rem] border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur-xl"
                >
                  <div className="text-4xl">{item.icon}</div>

                  <h4 className="mt-4 text-xl font-black">{item.title}</h4>

                  <p className="mt-3 text-sm leading-6 text-indigo-200">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-400/10 to-fuchsia-500/10 p-8 text-center">
            <h3 className="text-3xl font-black">
              Ready to make your sales process smarter?
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-indigo-200">
              Create your RicozLeads account and start managing your leads
              more efficiently.
            </p>

            <button
              onClick={() => openAuth('signup')}
              className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-7 py-3 font-black text-slate-950"
            >
              Create My Account
            </button>
          </section>

          <footer className="py-8 text-center text-sm text-indigo-300">
            © {new Date().getFullYear()} RicozLeads. Built for smarter growth.
          </footer>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#090b24] px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center gap-12">
          <section className="hidden max-w-md md:block">
            <div className="mb-5 text-7xl">🤖</div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Rico AI System
            </p>

            <h1 className="text-6xl font-black leading-tight">
              Your smart assistant for better lead management.
            </h1>

            <p className="mt-5 text-lg text-indigo-200">
              Organize contacts, follow-ups, and conversions in one friendly
              command center.
            </p>
          </section>

          <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => {
                setShowLanding(true)
                setAuthMessage('')
              }}
              className="mb-5 text-sm text-cyan-300 hover:underline"
            >
              ← Back to RicozLeads
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-500 text-5xl shadow-lg">
                🤖
              </div>

              <h2 className="text-3xl font-black">RicozLeads</h2>

              <p className="mt-2 text-sm text-indigo-200">
                {authMode === 'signup'
                  ? 'Create your account'
                  : authMode === 'reset'
                    ? 'Set a new password'
                    : 'Welcome to your lead dashboard'}
              </p>
            </div>

            {authMode === 'reset' ? (
              <form onSubmit={resetPassword} className="space-y-4">
                <input
                  className="w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-300"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={6}
                />

                <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-3 font-bold text-slate-950">
                  Update Password
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <input
                  className="w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                <input
                  className="w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
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
                    onClick={forgotPassword}
                    className="text-sm text-cyan-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}

                <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-3 font-black text-slate-950">
                  {authMode === 'login'
                    ? 'Login to Dashboard'
                    : 'Create Account'}
                </button>
              </form>
            )}

            {authMessage && (
              <p className="mt-4 rounded-2xl bg-black/25 p-3 text-sm text-cyan-100">
                {authMessage}
              </p>
            )}

            {authMode !== 'reset' && (
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  setAuthMessage('')
                }}
                className="mt-5 w-full text-sm text-fuchsia-300 hover:underline"
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

    if (
      value.includes('add') ||
      value.includes('create') ||
      value.includes('new lead')
    ) {
      return 'To add a lead, complete the Full Name and Email fields. You can also add a phone number, follow-up date, and notes. Then click Save Lead.'
    }

    if (
      value.includes('status') ||
      value.includes('contacted') ||
      value.includes('converted')
    ) {
      return 'You can update a lead status from the dropdown inside each lead card. Available statuses are New, Contacted, and Converted.'
    }

    if (
      value.includes('follow') ||
      value.includes('date') ||
      value.includes('reminder')
    ) {
      return 'A follow-up date is the date when you plan to contact the customer again. Overdue follow-ups are highlighted automatically.'
    }

    if (
      value.includes('conversion') ||
      value.includes('analytics') ||
      value.includes('track')
    ) {
      return 'Your dashboard automatically calculates total leads, converted leads, conversion rate, and overdue follow-ups.'
    }

    if (value.includes('search') || value.includes('filter')) {
      return 'Use the search box to find leads by name, email, phone number, or notes. You can also filter leads by status.'
    }

    if (value.includes('edit') || value.includes('update')) {
      return 'Click the Edit button on any lead card. Update the details and click Update Lead to save your changes.'
    }

    if (value.includes('delete') || value.includes('remove')) {
      return 'Click the Delete button on a lead card. Confirm the action to permanently remove that lead.'
    }

    if (value.includes('logout') || value.includes('sign out')) {
      return 'Click the Logout button in the top-right corner of your dashboard to sign out securely.'
    }

    if (value.includes('premium') || value.includes('plan') || value.includes('price')) {
      return 'Open the Premium Options section from the Upgrade to Premium button. You can compare Free, Pro, and Business plans there.'
    }

    return 'I can help you with adding leads, updating statuses, managing follow-ups, searching leads, tracking conversions, premium plans, and using your dashboard.'
  }

  function askQuestion(text) {
    const cleanText = text.trim()

    if (!cleanText) {
      return
    }

    const answer = getBotAnswer(cleanText)

    setMessages((current) => [
      ...current,
      {
        from: 'user',
        text: cleanText,
      },
      {
        from: 'bot',
        text: answer,
      },
    ])

    setQuestion('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[1.7rem] border border-cyan-300/30 bg-[#111536] shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-4 text-slate-950">
            <div>
              <p className="font-black">Rico AI Assistant</p>

              <p className="text-xs font-bold opacity-80">
                Your smart support robot
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-black/20 px-3 py-1 text-lg font-black"
              aria-label="Close help assistant"
            >
              ×
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.from === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.from === 'user'
                      ? 'bg-cyan-300 text-slate-950'
                      : 'bg-white/10 text-indigo-100'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickQuestions.map((item) => (
                <button
                  key={item}
                  onClick={() => askQuestion(item)}
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200 transition hover:bg-cyan-300/20"
                >
                  {item}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                askQuestion(question)
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask Rico AI..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 p-2 text-sm text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
              />

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 font-black text-slate-950"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="group relative ml-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-200/50 bg-gradient-to-br from-cyan-300 via-blue-400 to-fuchsia-500 text-4xl shadow-[0_0_35px_rgba(34,211,238,0.65)] transition hover:scale-110"
        aria-label="Open Rico AI help"
      >
        <span className="absolute -right-1 -top-2 h-4 w-4 animate-ping rounded-full bg-emerald-300" />

        <span className="animate-bounce">🤖</span>

        <span className="pointer-events-none absolute bottom-[-2.5rem] right-0 whitespace-nowrap rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs font-bold text-cyan-200 opacity-0 transition group-hover:opacity-100">
          Need help?
        </span>
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
      button: 'Current Plan',
      style: 'border-white/10 bg-white/5',
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
      button: 'Choose Pro',
      style: 'border-cyan-300/50 bg-cyan-400/10',
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
      button: 'Choose Business',
      style: 'border-fuchsia-300/50 bg-fuchsia-400/10',
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

    setMessage(
      editingId
        ? 'Lead updated successfully.'
        : 'New lead added successfully.'
    )

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
    if (!window.confirm('Delete this lead?')) {
      return
    }

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

  function choosePlan(planName) {
    setSelectedPlan(planName)
    setMessage(
      planName === 'Free'
        ? 'You are currently using the Free plan.'
        : `${planName} plan selected. Payment integration can be connected next.`
    )
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

  const convertedCount = count('Converted')

  const conversionRate =
    leads.length === 0
      ? 0
      : Math.round((convertedCount / leads.length) * 100)

  const dueTodayCount = leads.filter((lead) => {
    return (
      lead.follow_up_date === today &&
      lead.status !== 'Converted'
    )
  }).length

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
    <main className="min-h-screen bg-[#090b24] px-4 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                Online Command Center
              </p>

              <h1 className="mt-2 text-4xl font-black">
                Welcome back
              </h1>

              <p className="mt-2 text-indigo-200">
                Manage your customer leads from one simple dashboard.
              </p>

              <p className="mt-1 text-sm text-cyan-300">
                {session.user.email}
              </p>

              <div className="mt-3 inline-flex rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1 text-xs font-bold text-fuchsia-200">
                Current Plan: {selectedPlan}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowPricing((current) => !current)}
                className="rounded-2xl bg-gradient-to-r from-cyan-300 to-fuchsia-500 px-5 py-3 font-black text-slate-950 transition hover:scale-[1.02]"
              >
                {showPricing ? 'Hide Premium Plans' : 'Upgrade to Premium'}
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-gradient-to-r from-rose-400 to-fuchsia-500 px-5 py-3 font-bold text-slate-950"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {showPricing && (
          <section className="mb-6 rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 via-white/5 to-fuchsia-500/10 p-6 shadow-xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                Premium Options
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Choose the right plan for your business
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-indigo-200">
                Upgrade your workspace with more leads, better analytics, and
                powerful business features.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-[1.7rem] border p-6 shadow-lg ${plan.style}`}
                >
                  {plan.name === 'Pro' && (
                    <div className="absolute right-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
                      Popular
                    </div>
                  )}

                  <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                    {plan.name}
                  </p>

                  <h3 className="mt-3 text-4xl font-black">
                    {plan.price}
                    <span className="text-sm font-normal text-indigo-200">
                      {plan.name === 'Free' ? '' : ' / month'}
                    </span>
                  </h3>

                  <p className="mt-2 text-sm text-indigo-200">
                    {plan.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2 text-sm text-indigo-100"
                      >
                        <span className="text-emerald-300">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => choosePlan(plan.name)}
                    disabled={selectedPlan === plan.name}
                    className={`mt-7 w-full rounded-2xl p-3 font-black transition ${
                      selectedPlan === plan.name
                        ? 'cursor-not-allowed bg-white/10 text-indigo-300'
                        : 'bg-gradient-to-r from-cyan-300 to-fuchsia-500 text-slate-950 hover:scale-[1.02]'
                    }`}
                  >
                    {selectedPlan === plan.name
                      ? 'Current Plan'
                      : plan.button}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              Payment is not connected yet. Plan selection is currently a
              frontend preview. Connect Stripe or another payment provider
              to activate real subscriptions.
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'Total Leads',
              value: leads.length,
              icon: '👥',
              style: 'from-cyan-400/25',
            },
            {
              label: 'New Leads',
              value: count('New'),
              icon: '✨',
              style: 'from-blue-400/25',
            },
            {
              label: 'Contacted',
              value: count('Contacted'),
              icon: '📞',
              style: 'from-violet-400/25',
            },
            {
              label: 'Converted',
              value: convertedCount,
              icon: '🎯',
              style: 'from-emerald-400/25',
            },
            {
              label: 'Conversion Rate',
              value: `${conversionRate}%`,
              icon: '📈',
              style: 'from-fuchsia-400/25',
            },
            {
              label: 'Overdue',
              value: overdueCount,
              icon: '⚠️',
              style: 'from-rose-400/25',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-[1.7rem] border border-white/10 bg-gradient-to-br ${card.style} to-white/5 p-5 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <p className="text-indigo-200">{card.label}</p>

                <span className="text-2xl">{card.icon}</span>
              </div>

              <p className="mt-3 text-4xl font-black">{card.value}</p>
            </div>
          ))}
        </section>

        {(overdueCount > 0 || dueTodayCount > 0) && (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {dueTodayCount > 0 && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-200">
                You have {dueTodayCount} follow-up
                {dueTodayCount > 1 ? 's' : ''} due today.
              </div>
            )}

            {overdueCount > 0 && (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-200">
                You have {overdueCount} overdue lead
                {overdueCount > 1 ? 's' : ''}.
              </div>
            )}
          </section>
        )}

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                Lead Management
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {editingId ? 'Edit Lead' : 'Add New Lead'}
              </h2>
            </div>

            {editingId && (
              <button
                onClick={clear}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={save} className="grid gap-3 md:grid-cols-4">
            <input
              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
              type="text"
              placeholder="Full name"
              value={form.full_name}
              onChange={(event) => change('full_name', event.target.value)}
              required
            />

            <input
              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => change('email', event.target.value)}
              required
            />

            <input
              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
              type="text"
              placeholder="Phone number"
              value={form.phone}
              onChange={(event) => change('phone', event.target.value)}
            />

            <input
              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-300"
              type="date"
              value={form.follow_up_date}
              onChange={(event) =>
                change('follow_up_date', event.target.value)
              }
            />

            <textarea
              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300 md:col-span-3"
              rows="2"
              placeholder="Notes about this lead..."
              value={form.notes}
              onChange={(event) => change('notes', event.target.value)}
            />

            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-3 font-black text-slate-950 transition hover:scale-[1.02]"
            >
              {editingId ? 'Update Lead' : 'Save Lead'}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-2xl bg-black/25 p-3 text-sm text-cyan-100">
              {message}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-cyan-300"
              placeholder="Search leads by name, email, or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="rounded-2xl border border-white/10 bg-slate-900 p-3"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Converted</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-300">Customer Pipeline</p>

              <h2 className="text-2xl font-black">Your Leads</h2>
            </div>

            <span className="rounded-full bg-white/10 px-3 py-2 text-sm text-indigo-200">
              {visible.length} results
            </span>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl bg-black/20 p-6 text-center text-indigo-200">
              Loading your leads...
            </div>
          ) : visible.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center">
              <div className="text-5xl">🛰️</div>

              <h3 className="mt-3 text-xl font-black">No leads found</h3>

              <p className="mt-2 text-indigo-200">
                Add your first lead to start building your customer pipeline.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {visible.map((lead) => {
                const overdue =
                  lead.follow_up_date &&
                  lead.follow_up_date < today &&
                  lead.status !== 'Converted'

                return (
                  <article
                    key={lead.id}
                    className={`rounded-2xl border p-4 transition hover:scale-[1.005] ${
                      overdue
                        ? 'border-rose-400 bg-rose-500/10'
                        : 'border-white/10 bg-black/15'
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-500 text-lg font-black text-slate-950">
                          {lead.full_name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">
                            {lead.full_name}
                          </h3>

                          <p className="text-sm text-indigo-200">
                            {lead.email}
                          </p>

                          <p className="text-sm text-indigo-200">
                            {lead.phone || 'No phone number'}
                          </p>

                          {lead.follow_up_date && (
                            <p
                              className={
                                overdue
                                  ? 'mt-1 text-sm text-rose-300'
                                  : 'mt-1 text-sm text-amber-300'
                              }
                            >
                              Follow-up: {lead.follow_up_date}
                              {overdue ? ' · Overdue' : ''}
                            </p>
                          )}

                          {lead.notes && (
                            <p className="mt-1 text-sm text-indigo-200">
                              Notes: {lead.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <select
                          className={`rounded-xl border-0 p-2 font-bold ${
                            statusStyles[lead.status] || statusStyles.New
                          }`}
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
                          onClick={() => editLead(lead)}
                          className="rounded-xl bg-amber-300 px-3 py-2 font-bold text-slate-950"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => remove(lead.id)}
                          className="rounded-xl bg-rose-400 px-3 py-2 font-bold text-slate-950"
                        >
                          Delete
                        </button>
                      </div>
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