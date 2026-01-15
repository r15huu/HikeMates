import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/layout";
import { api } from "../lib/api";

function TrailCard({ t }) {
  const name =
    t.name ||
    t.tags?.name ||
    t.tags?.ref ||
    t.tags?.route_name ||
    t.tags?.official_name ||
    t.tags?.description ||
    `Trail #${t.id ?? ""}`.trim();

  const lat = typeof t.lat === "number" ? t.lat : Number(t.center?.lat);
  const lon = typeof t.lon === "number" ? t.lon : Number(t.center?.lon);

  const lengthKm =
    typeof t.length_km === "number" ? `${t.length_km.toFixed(1)} km` : null;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 p-6 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {name}
          </h3>
          <p className="text-slate-600 font-medium mt-2">
            {t.type ? (
              <span className="inline-block mr-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600">
                {t.type}
              </span>
            ) : null}
            {lengthKm ? (
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-forest-50 border border-forest-100 text-forest-700">
                {lengthKm}
              </span>
            ) : null}
          </p>
        </div>

        {Number.isFinite(lat) && Number.isFinite(lon) ? (
          <a
            className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
            href={`https://www.google.com/maps?q=${lat},${lon}`}
            target="_blank"
            rel="noreferrer"
          >
            Map
          </a>
        ) : null}
      </div>

      {t.distance_m != null ? (
        <p className="text-slate-500 font-semibold text-sm mt-4">
          ~{Math.round(t.distance_m / 1000)} km away
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const authed = !!localStorage.getItem("access");

  const [q, setQ] = useState("Boston");
  const [radius, setRadius] = useState(5000);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pickedPlace, setPickedPlace] = useState(null);
  const [trails, setTrails] = useState([]);

  async function findTrails() {
    const query = q.trim();
    if (!query) return;

    setErr("");
    setLoading(true);
    setTrails([]);
    setPickedPlace(null);

    try {
      // 1) geocode
      const geo = await api.get(`/api/trails/geocode/?q=${encodeURIComponent(query)}`);
      const first = Array.isArray(geo.data) ? geo.data[0] : null;

      if (!first?.lat || !first?.lon) {
        setErr("Could not find that place. Try a different city or add country/state.");
        return;
      }

      const lat = Number(first.lat);
      const lon = Number(first.lon);

      setPickedPlace({
        display_name: first.display_name,
        lat,
        lon,
      });

      // 2) search trails near that lat/lon
      const res = await api.get(
        `/api/trails/search/?lat=${lat}&lon=${lon}&radius=${radius}`
      );

      // your backend might return {elements:[...]} OR directly [...]
      const list = Array.isArray(res.data) ? res.data : res.data?.elements || [];

      if (!list.length) {
        setErr("No trails found for that area (or Overpass is rate-limiting). Try a bigger radius.");
        return;
      }

      setTrails(list);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Trail search failed. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 p-12 shadow-2xl shadow-slate-200/50">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            Find your next trail.
          </h1>
          <p className="text-slate-600 font-medium mt-4 max-w-2xl">
            Browse upcoming hikes and meet hikers nearby. You can explore without an account —
            join and create hikes when you’re ready.
          </p>

          {/* Quick actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => nav("/hikes")}
              className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
            >
              Explore Hikes
            </button>

            {!authed ? (
              <>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-2xl bg-white border border-slate-200 font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                to="/my-hikes"
                className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
              >
                My Hikes
              </Link>
            )}
          </div>

          {/* Trails search (guest-friendly) */}
          <div className="mt-12 bg-slate-50/70 rounded-[2.5rem] border border-white/60 p-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2">
                  Search trails near
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g., Boston, MA"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-200"
                />
              </div>

              <div className="w-full md:w-56">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-600 mb-2">
                  Radius
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <option value={2000}>2 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={20000}>20 km</option>
                </select>
              </div>

              <button
                onClick={findTrails}
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition disabled:opacity-60"
              >
                {loading ? "Searching..." : "Find Trails"}
              </button>
            </div>

            {pickedPlace ? (
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Showing trails near:{" "}
                <span className="text-slate-900 font-black">
                  {pickedPlace.display_name}
                </span>
              </p>
            ) : null}

            {err ? (
              <div className="mt-6 px-5 py-4 rounded-2xl bg-white border border-orange-100 text-orange-700 font-bold">
                {err}
              </div>
            ) : null}

            {trails.length ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {trails.slice(0, 10).map((t, idx) => (
                  <TrailCard key={t.id || `${t.type}-${idx}`} t={t} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}