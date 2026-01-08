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
      // 1) create user
      await api.post("/api/auth/register/", form);

      // 2) login immediately after signup
      const res = await api.post("/api/auth/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      nav("/hikes"); // nicer flow than /me
    } catch (e2) {
      setErr(e2?.response?.data?.detail || JSON.stringify(e2?.response?.data) || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl bg-white/80 border border-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="text-slate-600 mt-1">Join hikes, meet people, and plan trails together.</p>

          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 grid gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                placeholder="testuser2"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Confirm password</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                placeholder="••••••••"
                type="password"
                value={form.password2}
                onChange={(e) => update("password2", e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-forest-700 hover:text-forest-800" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}