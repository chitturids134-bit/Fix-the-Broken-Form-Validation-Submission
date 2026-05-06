// ============================================================
//  TrackFlow – Bug Report Form  (FIXED VERSION)
// ============================================================

import { useState } from 'react'
import { submitBugReport } from './api'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']
const COMPONENTS = ['Authentication', 'Dashboard', 'Billing', 'API', 'Notifications', 'Settings']

const EMPTY_FORM = {
  title: '',
  severity: '',
  component: '',
  description: '',
  steps: '',
  stepsCount: '',
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [submitted, setSubmitted] = useState([])
  const [successId, setSuccessId] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev }
        delete newErrs[name]
        return newErrs
      })
    }
  }

  const validate = () => {
    const newErrs = {}
    if (!form.title.trim()) newErrs.title = 'Bug title is required.'
    if (!form.severity) newErrs.severity = 'Please select a severity level.'
    if (!form.component) newErrs.component = 'Please select an affected component.'
    if (!form.description.trim()) newErrs.description = 'A description is required.'
    
    const steps = parseInt(form.stepsCount)
    if (!form.stepsCount) {
      newErrs.stepsCount = 'Steps count is required.'
    } else if (isNaN(steps) || steps <= 0) {
      newErrs.stepsCount = 'Steps must be a positive number.'
    }

    return newErrs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessId(null)
    setServerError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const result = await submitBugReport(form)
      setSuccessId(result.id)
      setSubmitted((prev) => [result, ...prev])
      setForm(EMPTY_FORM) // Reset form on success
    } catch (err) {
      // Route structured errors to specific fields, else show general error
      if (err.field) {
        setErrors({ [err.field]: err.message })
      } else {
        setServerError(err.message || 'Something went wrong on the server.')
      }
    } finally {
      setLoading(false)
    }
  }

  const sevClass = (s) =>
    ({ Critical: 'sev-critical', High: 'sev-high', Medium: 'sev-medium', Low: 'sev-low' }[s] ?? '')

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="badge">⬡ TrackFlow Internal Tools</div>
        <h1>Report a Bug</h1>
        <p>
          You're on the <strong>QA Engineering</strong> team at <strong>TrackFlow Inc.</strong> The
          team uses this form to log bugs before sprint planning every Monday. Help your teammates
          by making sure the form works correctly.
        </p>
      </header>

      <div className="card">
        <p className="section-label">New Bug Report</p>
        <form onSubmit={handleSubmit} noValidate>

          {successId && (
            <div style={{ background: 'rgba(76,175,125,0.1)', border: '1px solid rgba(76,175,125,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#4caf7d' }}>
              ✓ Bug <strong>{successId}</strong> filed successfully!
            </div>
          )}

          {serverError && (
            <div style={{ background: 'rgba(247,95,95,0.1)', border: '1px solid rgba(247,95,95,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#f75f5f' }}>
              ⚠ {serverError}
            </div>
          )}

          <div className="form-group">
            <label>Bug Title <span className="req">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Checkout button unresponsive on mobile Safari"
              style={errors.title ? { borderColor: '#f75f5f' } : {}}
            />
            {errors.title && <span className="error-msg">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Severity <span className="req">*</span></label>
              <select 
                name="severity" 
                value={form.severity} 
                onChange={handleChange}
                style={errors.severity ? { borderColor: '#f75f5f' } : {}}
              >
                <option value="">— Select —</option>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.severity && <span className="error-msg">{errors.severity}</span>}
            </div>
            <div className="form-group">
              <label>Affected Component <span className="req">*</span></label>
              <select 
                name="component" 
                value={form.component} 
                onChange={handleChange}
                style={errors.component ? { borderColor: '#f75f5f' } : {}}
              >
                <option value="">— Select —</option>
                {COMPONENTS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.component && <span className="error-msg">{errors.component}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Description <span className="req">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what's happening and what the expected behaviour should be…"
              style={errors.description ? { borderColor: '#f75f5f' } : {}}
            />
            {errors.description && <span className="error-msg">{errors.description}</span>}
          </div>

          <hr className="divider" />

          <div className="form-row">
            <div className="form-group">
              <label>Steps to Reproduce</label>
              <textarea
                name="steps"
                value={form.steps}
                onChange={handleChange}
                style={{ minHeight: 72 }}
                placeholder="1. Go to…&#10;2. Click…&#10;3. Observe…"
              />
            </div>
            <div className="form-group">
              <label>No. of Steps <span className="req">*</span></label>
              <input
                type="number"
                name="stepsCount"
                value={form.stepsCount}
                onChange={handleChange}
                placeholder="e.g. 3"
                style={errors.stepsCount ? { borderColor: '#f75f5f' } : {}}
              />
              {errors.stepsCount && <span className="error-msg">{errors.stepsCount}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Submitting...
              </span>
            ) : (
              'Submit Bug Report'
            )}
          </button>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .error-msg { color: var(--danger); font-size: 11px; margin-top: 4px; display: block; font-weight: 500; }
          `}</style>

        </form>
      </div>

      {submitted.length > 0 && (
        <div className="submitted-list">
          <p className="section-label" style={{ marginBottom: 8 }}>Filed This Session</p>
          {submitted.map((bug, i) => (
            <div key={i} className="submitted-item shadow-sm">
              <div>
                <div className="title">{bug.title}</div>
                <div className="meta">{bug.component} · {bug.stepsCount} steps</div>
              </div>
              <span className={`severity-badge ${sevClass(bug.severity)}`}>{bug.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
