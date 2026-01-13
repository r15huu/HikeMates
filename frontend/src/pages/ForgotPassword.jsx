import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/password-reset/", { email });
      setMsg(res.data?.detail || "If that email exists, a reset link was sent.");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Could not request reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl bg-white/80 border border-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900">Forgot password</h2>
          <p className="text-slate-600 mt-1">
            Enter your email and we’ll send a reset link (in dev it prints in the backend terminal).
          </p>

          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {err}
            </div>
          )}

          {msg && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
              {msg}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 grid gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Back to{" "}
            <Link className="font-semibold text-forest-700 hover:text-forest-800" to="/login">
              login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}