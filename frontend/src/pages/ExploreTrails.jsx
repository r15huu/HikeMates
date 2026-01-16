import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout";
import { api } from "../lib/api";

function normalizeTrails(raw) {
  const list = Array.isArray(raw) ? raw : raw?.elements || [];
  const named = list.filter((t) => {
    const name = t?.tags?.name || t?.name;
    return typeof name === "string" && name.trim().length > 0;
  });

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

function TrailRow({ t }) {
  const name = (t?.tags?.name || t?.name || "").trim();
  const kind =
    t?.tags?.route === "hiking"
      ? "Hiking"
      : t?.tags?.highway
      ? t.tags.highway
      : t?.type || "trail";

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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600">
              {kind}
            </span>
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

export default function ExploreTrails() {
  const lastMeta = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("trails:last:meta") || "null");
    } catch {
      return null;
    }
  }, []);

  const lastList = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("trails:last:list") || "[]");
    } catch {
      return [];
    }
  }, []);

  const [q, setQ] = useState(lastMeta?.query || "Cambridge, MA");
  const [radius, setRadius] = useState(lastMeta?.radius || 5000);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pickedPlace, setPickedPlace] = useState(lastMeta || null);
  const [trails, setTrails] = useState(Array.isArray(lastList) ? lastList : []);

  useEffect(() => {
    // If someone lands here with no stored search:
    if (!trails.length) setErr("Search a city to load trails.");
  }, []); // eslint-disable-line

  async function search() {
    const query = q.trim();
    if (!query) return;

    setErr("");
    setLoading(true);

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
        setTrails([]);
        setErr("No named trails found. Try a bigger radius or different place.");
        return;
      }

      setTrails(cleaned);

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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              Explore Trails
            </h1>
            <p className="mt-2 text-slate-600 font-semibold">
              Search any city/area and browse named trails (no login needed).
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-6 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
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

            <div className="w-full lg:w-56">
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
              onClick={search}
              disabled={loading}
              className="w-full lg:w-auto px-10 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition disabled:opacity-60"
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
            <div className="mt-5 px-5 py-4 rounded-2xl bg-white border border-orange-100 text-orange-700 font-bold">
              {err}
            </div>
          ) : null}
        </div>

        {trails.length ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {trails.map((t, idx) => (
              <TrailRow key={t?.id || `${t?.type}-${idx}`} t={t} />
            ))}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}