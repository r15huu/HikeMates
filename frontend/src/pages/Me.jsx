import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

export default function Me() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setErr("");
      setLoading(true);
      try {
        const res = await api.get("/api/auth/me/");
        setMe(res.data);
      } catch {
        nav("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [nav]);

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    nav("/login");
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
            <p className="text-slate-600 mt-1">Your account info and quick links.</p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/hikes"
            className="px-4 py-2 rounded-xl bg-white/80 border border-white shadow-sm hover:shadow transition"
          >
            All Hikes
          </Link>

          <Link
            to="/my-hikes"
            className="px-4 py-2 rounded-xl bg-white/80 border border-white shadow-sm hover:shadow transition"
          >
            My Hikes
          </Link>

          <Link
            to="/hikes/new"
            className="px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition"
          >
            + Create Hike
          </Link>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {err}
          </div>
        )}

        {loading && <p className="mt-6 text-slate-600">Loading...</p>}

        {!loading && me && (
          <div className="mt-6 rounded-2xl bg-white/80 border border-white shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Username</div>
                <div className="text-lg font-semibold text-slate-900">{me.username}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-sm font-medium text-slate-800">{me.email}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Public profile</div>
                <div className="text-sm font-semibold text-slate-900">
                  {me.is_public ? "Yes" : "No"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Bio</div>
                <div className="text-sm text-slate-800">{me.bio || "—"}</div>
              </div>
            </div>

            {/* Debug JSON (optional) */}
            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-semibold text-forest-700">
                View raw JSON (debug)
              </summary>
              <pre className="mt-3 text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-auto">
                {JSON.stringify(me, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </Layout>
  );
}