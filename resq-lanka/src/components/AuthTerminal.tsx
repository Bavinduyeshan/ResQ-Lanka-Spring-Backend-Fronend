import React, { useState } from 'react';
import { LogIn, UserPlus, KeyRound, ArrowLeft, Shield } from 'lucide-react';
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

  // authApi.login saves the JWT token to localStorage automatically
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
        // Auto-login after successful registration
        await doLogin(username, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (uname: string, pass: string, label: string) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await doLogin(uname, pass);
    } catch (err: any) {
      setErrorMessage(`${label} login failed. Ensure the account is seeded on the backend.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="max-w-md mx-auto px-4 py-16" id="auth-container">
        <button
            onClick={onBackToLanding}
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors uppercase border border-slate-200 bg-white px-3 py-1.5 rounded-lg font-medium cursor-pointer"
            id="btn-back-landing"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Center
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 relative overflow-hidden" id="auth-card">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-sky-500"></div>

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
              <KeyRound className="w-6 h-6" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-sans text-slate-800" id="auth-title">
              {isLoginView ? 'Coordinator Login' : 'Register Operator'}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              {isLoginView
                  ? 'Access local disaster command panels'
                  : 'Sign up to register resource capacities'}
            </p>
          </div>

          {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800" id="auth-error-block">
                {errorMessage}
              </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4" id="auth-form">
            {!isLoginView && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                      type="text"
                      required
                      placeholder="Priyantha Perera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white"
                  />
                </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Username</label>
              <input
                  type="text"
                  required
                  placeholder="e.g. admin or coordinator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white"
              />
            </div>

            {!isLoginView && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                      type="email"
                      required
                      placeholder="operator@disasterresponse.lk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white"
                  />
                </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Password</label>
              <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white"
              />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-6 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoginView ? (
                  <><LogIn className="w-4 h-4" /> {isLoading ? 'Authenticating...' : 'Sign In Terminal'}</>
              ) : (
                  <><UserPlus className="w-4 h-4" /> {isLoading ? 'Creating Account...' : 'Register as Coordinator'}</>
              )}
            </button>
          </form>

          {/* Quick logins for evaluators */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-xs text-slate-400 font-medium uppercase tracking-wider mb-3 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" /> Educator Fast-Track Portals
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                  onClick={() => quickLogin('admin', 'Admin@1234', 'Admin')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  id="btn-fast-admin"
              >
                Sign In Admin (Seeded)
              </button>
              <button
                  onClick={() => quickLogin('coordinator', 'Admin@1234', 'Coordinator')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  id="btn-fast-coordinator"
              >
                Sign In Coordinator
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs">
            <button
                onClick={() => { setErrorMessage(''); setIsLoginView(!isLoginView); }}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              {isLoginView ? 'Create new operator credentials' : 'Already registered? Log in here'}
            </button>
          </div>
        </div>
      </div>
  );
}