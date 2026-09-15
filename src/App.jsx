import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [authMode, setAuthMode] = useState('login')
  const [authMessage, setAuthMessage] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession)

      if (event === 'PASSWORD_RECOVERY') {
        setIsResetting(true)
        setAuthMode('reset')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleAuth(event) {
    event.preventDefault()
    setAuthMessage('Please wait...')

    if (!email || !password) {
      setAuthMessage('Please enter email and password.')
      return
    }

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthMessage(error.message)
        return
      }

      setAuthMessage('Login successful!')
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setAuthMessage(error.message)
        return
      }

      setAuthMessage(
        'Account created. Please check your email for confirmation.'
      )
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setAuthMessage('Please enter your email first.')
      return
    }

    setAuthMessage('Sending password reset link...')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setAuthMessage(error.message)
      return
    }

    setAuthMessage(
      'Password reset link sent. Please check your email.'
    )
  }

  async function handleResetPassword(event) {
    event.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      setAuthMessage('Password must be at least 6 characters.')
      return
    }

    setAuthMessage('Updating password...')

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setAuthMessage(error.message)
      return
    }

    setAuthMessage('Password updated successfully. Please login again.')
    setNewPassword('')
    setIsResetting(false)
    setAuthMode('login')

    await supabase.auth.signOut()
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-900">
            RicozLeads
          </h1>

          <p className="mt-2 text-slate-500">
            {authMode === 'signup'
              ? 'Create your RicozLeads account'
              : authMode === 'reset'
                ? 'Create a new password'
                : 'Login to manage your leads'}
          </p>

          {authMode === 'reset' ? (
            <form
              onSubmit={handleResetPassword}
              className="mt-6 space-y-4"
            >
              <input
                className="w-full rounded-lg border p-3"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />

              <button
                className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                Update Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="mt-6 space-y-4">
              <input
                className="w-full rounded-lg border p-3"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="w-full rounded-lg border p-3"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              {authMode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
                type="submit"
              >
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>
          )}

          {authMessage && (
            <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
              {authMessage}
            </p>
          )}

          {authMode !== 'reset' && (
            <button
              className="mt-4 w-full text-sm text-blue-600 hover:underline"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
                setAuthMessage('')
              }}
            >
              {authMode === 'login'
                ? 'Create a new account'
                : 'Already have an account? Login'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return <LeadsDashboard session={session} logout={logout} />
}

function LeadsDashboard({ session, logout }) {
  const [leads, setLeads] = useState([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [notes, setNotes] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [message, setMessage] = useState('')

  async function loadLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`Error: ${error.message}`)
      return
    }

    setLeads(data || [])
  }

  useEffect(() => {
    loadLeads()
  }, [])

  async function saveLead(event) {
    event.preventDefault()

    const leadData = {
      full_name: name,
      email,
      phone,
      follow_up_date: followUpDate || null,
      notes,
    }

    if (editingId) {
      const { error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', editingId)

      if (error) {
        setMessage(`Error: ${error.message}`)
        return
      }

      setMessage('Lead updated successfully!')
    } else {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            ...leadData,
            status: 'New',
          },
        ])

      if (error) {
        setMessage(`Error: ${error.message}`)
        return
      }

      setMessage('Lead saved successfully!')
    }

    clearForm()
    loadLeads()
  }

  function editLead(lead) {
    setEditingId(lead.id)
    setName(lead.full_name || '')
    setEmail(lead.email || '')
    setPhone(lead.phone || '')
    setFollowUpDate(lead.follow_up_date || '')
    setNotes(lead.notes || '')
    setMessage('Editing selected lead...')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function clearForm() {
    setEditingId(null)
    setName('')
    setEmail('')
    setPhone('')
    setFollowUpDate('')
    setNotes('')
  }

  async function updateStatus(leadId, newStatus) {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)

    if (error) {
      setMessage(`Error: ${error.message}`)
      return
    }

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: newStatus }
          : lead
      )
    )

    setMessage('Status updated!')
  }

  async function deleteLead(leadId) {
    if (!window.confirm('Delete this lead?')) return

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)

    if (error) {
      setMessage(`Error: ${error.message}`)
      return
    }

    setLeads((currentLeads) =>
      currentLeads.filter((lead) => lead.id !== leadId)
    )

    setMessage('Lead deleted successfully!')
  }

  const filteredLeads = leads.filter((lead) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      lead.full_name?.toLowerCase().includes(searchText) ||
      lead.email?.toLowerCase().includes(searchText) ||
      lead.phone?.toLowerCase().includes(searchText) ||
      lead.notes?.toLowerCase().includes(searchText)

    const matchesStatus =
      statusFilter === 'All' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalLeads = leads.length

  const newLeads = leads.filter(
    (lead) => lead.status === 'New'
  ).length

  const contactedLeads = leads.filter(
    (lead) => lead.status === 'Contacted'
  ).length

  const convertedLeads = leads.filter(
    (lead) => lead.status === 'Converted'
  ).length

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                RicozLeads
              </h1>

              <p className="mt-2 text-slate-500">
                Logged in as: {session.user.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-blue-100 p-5">
              <p className="text-sm text-blue-700">Total Leads</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">
                {totalLeads}
              </p>
            </div>

            <div className="rounded-xl bg-yellow-100 p-5">
              <p className="text-sm text-yellow-700">New</p>
              <p className="mt-2 text-3xl font-bold text-yellow-900">
                {newLeads}
              </p>
            </div>

            <div className="rounded-xl bg-purple-100 p-5">
              <p className="text-sm text-purple-700">Contacted</p>
              <p className="mt-2 text-3xl font-bold text-purple-900">
                {contactedLeads}
              </p>
            </div>

            <div className="rounded-xl bg-green-100 p-5">
              <p className="text-sm text-green-700">Converted</p>
              <p className="mt-2 text-3xl font-bold text-green-900">
                {convertedLeads}
              </p>
            </div>
          </div>

          <form
            onSubmit={saveLead}
            className="mt-8 grid gap-3 md:grid-cols-4"
          >
            <input
              className="rounded-lg border p-3"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className="rounded-lg border p-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="rounded-lg border p-3"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="rounded-lg border p-3"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />

            <textarea
              className="rounded-lg border p-3 md:col-span-3"
              placeholder="Notes about this lead..."
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              className="rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
              type="submit"
            >
              {editingId ? 'Update Lead' : 'Save Lead'}
            </button>
          </form>

          {editingId && (
            <button
              onClick={clearForm}
              className="mt-3 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}

          {message && (
            <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="w-full rounded-lg border p-3"
              placeholder="Search by name, email, phone or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="rounded-lg border p-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Saved Leads
          </h2>

          <div className="mt-6 space-y-3">
            {filteredLeads.length === 0 ? (
              <p className="rounded-lg bg-slate-100 p-4 text-slate-600">
                No leads found.
              </p>
            ) : (
              filteredLeads.map((lead) => {
                const isOverdue =
                  lead.follow_up_date &&
                  lead.follow_up_date < today &&
                  lead.status !== 'Converted'

                return (
                  <div
                    key={lead.id}
                    className={`flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between ${
                      isOverdue
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {lead.full_name}
                      </p>

                      <p className="text-sm text-slate-600">
                        {lead.email}
                      </p>

                      <p className="text-sm text-slate-600">
                        {lead.phone || 'No phone'}
                      </p>

                      {lead.follow_up_date && (
                        <p
                          className={`mt-2 text-sm font-semibold ${
                            isOverdue
                              ? 'text-red-600'
                              : 'text-orange-600'
                          }`}
                        >
                          Follow-up: {lead.follow_up_date}
                          {isOverdue && ' - Overdue'}
                        </p>
                      )}

                      {lead.notes && (
                        <p className="mt-1 text-sm text-slate-500">
                          Notes: {lead.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <select
                        className="rounded-lg border p-2"
                        value={lead.status || 'New'}
                        onChange={(e) =>
                          updateStatus(lead.id, e.target.value)
                        }
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                      </select>

                      <button
                        onClick={() => editLead(lead)}
                        className="rounded-lg bg-yellow-500 px-3 py-2 font-semibold text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App