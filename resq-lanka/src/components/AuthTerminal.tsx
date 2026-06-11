import React, { useState } from 'react';
import { LogIn, UserPlus, ArrowLeft, ChevronRight, Radio } from 'lucide-react';
import { User, UserRole } from '../types';
import { authApi } from '../api';

interface AuthTerminalProps {
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

export default function AuthTerminal({ onLoginSuccess, onBackToLanding }: AuthTerminalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const doLogin = async (uname: string, pass: string) => {
    const res = await authApi.login({ username: uname, password: pass });
    const user: User = {
      id: res.userId,
      fullName: res.fullName,
      username: res.username,
      email: res.email,
      role: res.role as UserRole,
    };
    onLoginSuccess(user);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      if (isLoginView) {
        await doLogin(username, password);
      } else {
        const reg = await authApi.register({ fullName, username, email, password });
        if (!reg.success) throw new Error(reg.message);
        await doLogin(username, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = () => {
    setErrorMessage('');
    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setIsLoginView(!isLoginView);
  };

  return (
    <div style={styles.page} id="auth-container">
      <div style={styles.card} id="auth-card">

        {/* ── Left panel ── */}
        <div style={styles.left}>
          <svg style={styles.topoSvg} viewBox="0 0 500 700" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="250" cy="350" rx="420" ry="420" stroke="#BFDBFE" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <ellipse cx="250" cy="350" rx="340" ry="340" stroke="#BFDBFE" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <ellipse cx="250" cy="350" rx="260" ry="260" stroke="#93C5FD" strokeWidth="1.2" fill="none" opacity="0.5"/>
            <ellipse cx="250" cy="350" rx="180" ry="180" stroke="#93C5FD" strokeWidth="1.2" fill="none" opacity="0.5"/>
            <ellipse cx="250" cy="350" rx="100" ry="100" stroke="#2563EB" strokeWidth="1" fill="none" opacity="0.35"/>
            <ellipse cx="250" cy="350" rx="40"  ry="40"  stroke="#2563EB" strokeWidth="1" fill="none" opacity="0.45"/>
            <path d="M200 180 Q250 140 300 180" stroke="#2563EB" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M170 155 Q250 100 330 155" stroke="#2563EB" strokeWidth="1.2" fill="none" opacity="0.35"/>
            <path d="M140 130 Q250 60 360 130"  stroke="#2563EB" strokeWidth="1"   fill="none" opacity="0.25"/>
          </svg>

          <button onClick={onBackToLanding} style={styles.backBtn} id="btn-back-landing">
            <ArrowLeft size={14} />
            <span>Public Center</span>
          </button>

          <div style={styles.brand}>
            <div style={styles.brandIcon}>
              <Radio size={22} color="#2563EB" />
            </div>
            <div style={styles.brandBadge}>COORDINATOR</div>
            <h1 style={styles.brandTitle}>Disaster Response<br />Command Portal</h1>
            <p style={styles.brandSub}>
              Authorised access for field coordinators and district-level operators managing active relief operations.
            </p>
          </div>

          <div style={styles.statsRow}>
            {[['Active Ops', '12'], ['Districts', '25'], ['Uptime', '99.9%']].map(([label, val]) => (
              <div key={label} style={styles.stat}>
                <span style={styles.statVal}>{val}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={styles.right}>
          <div style={styles.tabs}>
            <button
              onClick={() => isLoginView || switchView()}
              style={{ ...styles.tab, ...(isLoginView ? styles.tabActive : {}) }}
            >
              Sign In
            </button>
            <button
              onClick={() => !isLoginView || switchView()}
              style={{ ...styles.tab, ...(!isLoginView ? styles.tabActive : {}) }}
            >
              Register
            </button>
          </div>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {isLoginView ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={styles.formSub}>
              {isLoginView
                ? 'Sign in to access your coordinator dashboard'
                : 'Register as a new disaster response coordinator'}
            </p>
          </div>

          {errorMessage && (
            <div style={styles.errorBox} id="auth-error-block">
              <span style={styles.errorDot} />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleAuth} style={styles.form} id="auth-form">
            {!isLoginView && (
              <Field label="Full Name" id="full-name">
                <input
                  type="text" required placeholder="Priyantha Perera"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  style={styles.input}
                />
              </Field>
            )}

            <Field label="Username" id="username">
              <input
                type="text" required placeholder="e.g. coordinator"
                value={username} onChange={e => setUsername(e.target.value)}
                style={styles.input}
              />
            </Field>

            {!isLoginView && (
              <Field label="Email Address" id="email">
                <input
                  type="email" required placeholder="operator@disasterresponse.lk"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={styles.input}
                />
              </Field>
            )}

            <Field label="Password" id="password">
              <input
                type="password" required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={styles.input}
              />
            </Field>

            <button
              type="submit" disabled={isLoading}
              style={{ ...styles.submitBtn, ...(isLoading ? styles.submitBtnDisabled : {}) }}
            >
              {isLoginView ? (
                <><LogIn size={16} /> {isLoading ? 'Authenticating…' : 'Sign In'}</>
              ) : (
                <><UserPlus size={16} /> {isLoading ? 'Creating account…' : 'Create Account'}</>
              )}
              {!isLoading && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          </form>

          <p style={styles.switchLine}>
            {isLoginView ? "Don't have an account? " : 'Already registered? '}
            <button onClick={switchView} style={styles.switchBtn}>
              {isLoginView ? 'Register here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 60%, #E0F2FE 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    display: 'flex',
    width: '100%',
    maxWidth: 940,
    minHeight: 580,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(37,99,235,0.12), 0 0 0 1px rgba(37,99,235,0.08)',
  },

  /* Left */
  left: {
    flex: '1 1 45%',
    background: 'linear-gradient(160deg, #DBEAFE 0%, #EFF6FF 100%)',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    borderRight: '1px solid rgba(37,99,235,0.1)',
  },
  topoSvg: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '130%',
    height: '130%',
    pointerEvents: 'none',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#64748B',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(37,99,235,0.15)',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.03em',
    width: 'fit-content',
    position: 'relative',
    zIndex: 2,
  },
  brand: {
    marginTop: 'auto',
    marginBottom: 'auto',
    position: 'relative',
    zIndex: 2,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'rgba(37,99,235,0.1)',
    border: '1px solid rgba(37,99,235,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#2563EB',
    background: 'rgba(37,99,235,0.08)',
    border: '1px solid rgba(37,99,235,0.2)',
    borderRadius: 100,
    padding: '4px 12px',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1E3A5F',
    lineHeight: 1.25,
    margin: '0 0 14px',
    letterSpacing: '-0.02em',
  },
  brandSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: 280,
  },
  statsRow: {
    display: 'flex',
    gap: 0,
    marginTop: 36,
    borderTop: '1px solid rgba(37,99,235,0.12)',
    paddingTop: 24,
    position: 'relative',
    zIndex: 2,
  },
  stat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    paddingRight: 16,
    borderRight: '1px solid rgba(37,99,235,0.1)',
  },
  statVal: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1E3A5F',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: '#94A3B8',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },

  /* Right */
  right: {
    flex: '1 1 55%',
    background: '#FFFFFF',
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
  },
  tabs: {
    display: 'flex',
    gap: 4,
    background: '#F1F5F9',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
    width: 'fit-content',
  },
  tab: {
    padding: '8px 24px',
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '#94A3B8',
    letterSpacing: '0.01em',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#FFFFFF',
    color: '#1E3A5F',
    boxShadow: '0 1px 6px rgba(37,99,235,0.12)',
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1E3A5F',
    margin: '0 0 6px',
    letterSpacing: '-0.02em',
  },
  formSub: {
    fontSize: 13,
    color: '#94A3B8',
    margin: 0,
    lineHeight: 1.5,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 20,
  },
  errorDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#EF4444',
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#64748B',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    background: '#F8FAFC',
    color: '#1E3A5F',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px 20px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
    transition: 'all 0.2s',
  },
  submitBtnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },
  switchLine: {
    marginTop: 24,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#2563EB',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 13,
    padding: 0,
  },
};