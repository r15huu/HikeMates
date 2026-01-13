import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  const uid = useMemo(() => params.get("uid") || "", [params]);
  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const missingLinkData = !uid || !token;

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (newPassword !== newPassword2) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
        new_password2: newPassword2,
      });

      setMsg(res.data?.detail || "Password reset successful. Redirecting to login...");
      setTimeout(() => nav("/login"), 900);
    } catch (e2) {
      const data = e2?.response?.data;
      setErr(
        data?.token ||
          data?.uid ||
          data?.detail ||
          (typeof data === "string" ? data : JSON.stringify(data)) ||
          "Reset failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl bg-white/80 border border-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900">Reset password</h2>
          <p className="text-slate-600 mt-1">Choose a new password for your account.</p>

          {missingLinkData && (
            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-900">
              This reset link is missing info. Please request a new reset link from{" "}
              <Link className="font-semibold underline" to="/forgot-password">
                Forgot password
              </Link>
              .
            </div>
          )}

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
              <label className="text-sm font-medium text-slate-700">New password</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={missingLinkData}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                type="password"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                autoComplete="new-password"
                required
                disabled={missingLinkData}
              />
            </div>

            <button
              type="submit"
              disabled={loading || missingLinkData}
              className="mt-2 px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
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