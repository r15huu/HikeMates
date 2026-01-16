import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/layout";
import { api } from "../lib/api";
import heroImg from "../assets/hero.jpg";

function normalizeTrails(raw) {
  const list = Array.isArray(raw) ? raw : raw?.elements || [];
  // Keep only things that actually have a name
  const named = list.filter((t) => {
    const name = t?.tags?.name || t?.name;
    return typeof name === "string" && name.trim().length > 0;
  });

  // Optional: de-dup by name
  const seen = new Set();
  const deduped = [];
  for (const t of named) {
    const name = (t?.tags?.name || t?.name || "").trim().toLowerCase();
    if (!name) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    deduped.push(t);
  }

  return deduped;
}

function TrailCard({ t }) {
  const name = (t?.tags?.name || t?.name || "").trim();

  const kind =
    t?.tags?.route === "hiking"
      ? "Hiking"
      : t?.tags?.highway
      ? t.tags.highway
      : t?.type || null;

  const lat =
    typeof t?.lat === "number"
      ? t.lat
      : typeof t?.center?.lat === "number"
      ? t.center.lat
      : null;

  const lon =
    typeof t?.lon === "number"
      ? t.lon
      : typeof t?.center?.lon === "number"
      ? t.center.lon
      : null;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[1.75rem] border border-white/60 p-6 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {name}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {kind ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600">
                {kind}
              </span>
            ) : null}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-forest-50 border border-forest-100 text-forest-700">
              Trail
            </span>
          </div>
        </div>

        {typeof lat === "number" && typeof lon === "number" ? (
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
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const authed = !!localStorage.getItem("access");

  const [q, setQ] = useState("Cambridge, MA");
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
      const geo = await api.get(
        `/api/trails/geocode/?q=${encodeURIComponent(query)}`
      );
      const first = Array.isArray(geo.data) ? geo.data[0] : null;

      if (!first?.lat || !first?.lon) {
        setErr(
          "Could not find that place. Try a different city or add country/state."
        );
        return;
      }

      const lat = Number(first.lat);
      const lon = Number(first.lon);

      const meta = {
        display_name: first.display_name,
        lat,
        lon,
        radius,
        query,
      };

      setPickedPlace(meta);

      const res = await api.get(
        `/api/trails/search/?lat=${lat}&lon=${lon}&radius=${radius}`
      );

      const cleaned = normalizeTrails(res.data);

      if (!cleaned.length) {
        setErr(
          "No named trails found for that area. Try a bigger radius (or a different location)."
        );
        return;
      }

      setTrails(cleaned);

      // ✅ Save last search for ExploreTrails page
      sessionStorage.setItem("trails:last:meta", JSON.stringify(meta));
      sessionStorage.setItem("trails:last:list", JSON.stringify(cleaned));
    } catch (e) {
      setErr(
        e?.response?.data?.detail || "Trail search failed. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  const quickCities = ["Needham", "Cambridge, MA", "Brookline, MA", "Blue Hills"];

  return (
    <Layout>
      {/* FULL-BLEED HERO */}
      <section className="pt-24">
        <div className="w-full">
          <div className="relative w-full overflow-hidden rounded-none md:rounded-[2.75rem] md:mx-6 border-y md:border border-white/50 shadow-2xl shadow-slate-200/50">
            <div className="absolute inset-0">
              <img
                src={heroImg}
                alt="HikeMates hero"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.25em] backdrop-blur">
                🌲 Discover trails • Meet hikers • Plan weekends
              </div>

              <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight text-white leading-[0.95]">
                Find your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-forest-200">
                  outside.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-white/85 text-lg md:text-xl font-semibold leading-relaxed">
                Search real trails around you (OpenStreetMap) + join scheduled
                community hikes on HikeMates. Browse as a guest — log in when
                you’re ready to join and create.
              </p>

              <div className="mt-10 max-w-4xl rounded-[2.5rem] bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl shadow-black/15 p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
                      Search trails near
                    </label>
                    <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4">
                      <span className="text-slate-500">🔎</span>
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="e.g., Boston, MA"
                        className="w-full py-4 font-bold text-slate-900 outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-56">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-700 mb-2">
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
                    className="w-full lg:w-auto px-10 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? "Searching..." : "Find Trails"}
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => nav("/hikes")}
                    className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
                  >
                    Explore Hikes
                  </button>

                  {!authed ? (
                    <>
                      <Link
                        to="/login"
                        className="px-8 py-3 rounded-2xl bg-white border border-slate-200 font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="px-8 py-3 rounded-2xl bg-forest-600 text-white font-black shadow-lg shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/my-hikes"
                      className="px-8 py-3 rounded-2xl bg-forest-600 text-white font-black shadow-lg shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
                    >
                      My Hikes
                    </Link>
                  )}

                  {/* ✅ Show "View all trails" only after a search */}
                  {trails.length ? (
                    <button
                      onClick={() => nav("/trails")}
                      className="px-8 py-3 rounded-2xl bg-white border border-slate-200 font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition"
                    >
                      View all trails →
                    </button>
                  ) : null}
                </div>

                {pickedPlace ? (
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Showing trails near:{" "}
                    <span className="text-slate-900 font-black">
                      {pickedPlace.display_name}
                    </span>
                  </p>
                ) : null}

                {err ? (
                  <div className="mt-5 px-5 py-4 rounded-2xl bg-white border border-orange-100 text-orange-700 font-bold">
                    {err}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local favorites + only show 3 trails on Home */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Local favorites near you
            </h2>
            <p className="mt-2 text-slate-600 font-semibold">
              One click searches (no account needed).
            </p>
          </div>

          <button
            onClick={() => nav("/trails")}
            className="hidden md:inline-flex px-6 py-3 rounded-2xl bg-white border border-slate-200 font-black text-slate-900 hover:bg-slate-50 active:scale-95 transition"
          >
            Explore Trails →
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {quickCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setQ(city);
                setTimeout(findTrails, 0);
              }}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition"
            >
              {city}
            </button>
          ))}
        </div>

        {trails.length ? (
          <>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {trails.slice(0, 3).map((t, idx) => (
                <TrailCard key={t?.id || `${t?.type}-${idx}`} t={t} />
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={() => nav("/trails")}
                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
              >
                View all trails from this search →
              </button>
            </div>
          </>
        ) : null}
      </section>
    </Layout>
  );
}