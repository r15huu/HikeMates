import { useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await api.post("/api/auth/register/", form);
      const res = await api.post("/api/auth/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      nav("/hikes");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Registration failed. Check your details.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-white/50 px-5 py-4 outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all font-bold text-slate-900 placeholder:text-slate-300";

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 p-10 shadow-2xl shadow-slate-200/50">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-forest-50 text-forest-600 shadow-inner mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Create Your Explorer Profile.</h2>
            <p className="text-slate-500 font-medium mt-3">Join thousands of hikers across the globe.</p>
          </header>

          {err && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Username</label>
                <input
                  className={inputClass}
                  placeholder="hiker_pro"
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Email</label>
                <input
                  className={inputClass}
                  placeholder="name@trail.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Password</label>
                <input
                  className={inputClass}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Confirm</label>
                <input
                  className={inputClass}
                  placeholder="••••••••"
                  type="password"
                  value={form.password2}
                  onChange={(e) => update("password2", e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-5 rounded-[2rem] bg-forest-600 text-white font-black text-lg shadow-2xl shadow-forest-100 hover:bg-forest-700 hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? "Establishing Connection..." : "Begin Your Adventure"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-bold">
              Already have an account?{" "}
              <Link className="text-forest-600 hover:underline" to="/login">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}