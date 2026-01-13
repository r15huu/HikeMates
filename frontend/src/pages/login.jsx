import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Layout from '../components/layout';

const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post("/api/auth/token/", {
        username: email, // backend expects username
        password: password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      nav("/hikes");
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white/50 px-5 py-4 outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all font-bold text-slate-900 placeholder:text-slate-300";

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 p-10 shadow-2xl shadow-slate-200/50">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-forest-500 to-emerald-600 text-white shadow-xl shadow-forest-100 mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-4.514A9.01 9.01 0 0012 21a9.003 9.003 0 008.354-5.646M11 10a9 9 0 108.941 2.897m.001 0l3 3m-3-3l-3 3"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome Back.</h2>
            <p className="text-slate-500 font-medium mt-2">The trails are waiting for you.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">
                Username / Email
              </label>
              <input
                type="text"
                placeholder="testuser1"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* NEW: Forgot password link */}
              <div className="mt-3 text-right pr-1">
                <Link
                  to="/forgot-password"
                  className="text-sm font-extrabold text-forest-600 hover:text-forest-700 underline decoration-forest-200 underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-lg shadow-2xl shadow-slate-300 hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verifying Trailhead...' : 'Sign In to HikeMates'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-bold">
              New to the community?{" "}
              <Link
                to="/register"
                className="text-forest-600 hover:text-forest-700 underline decoration-forest-200 underline-offset-4"
              >
                Join now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;