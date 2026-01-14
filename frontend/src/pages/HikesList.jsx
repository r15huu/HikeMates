import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

function Badge({ children, tone = "green" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Card({ h, onJoin, onDetails, busy, authed }) {
  const intensityTone =
    h.intensity === "hard" ? "orange" : h.intensity === "medium" ? "slate" : "green";

  const joinLabel = !authed ? "Login to Join" : busy ? "..." : "Join";

  return (
    <div className="group bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/50 p-2 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
      <div className="bg-slate-50/50 rounded-[2rem] p-8 h-full flex flex-col relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-forest-100/20 rounded-full blur-2xl group-hover:bg-forest-200/40 transition-colors" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <Badge tone={h.visibility === "private" ? "slate" : "green"}>{h.visibility}</Badge>
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              Availability
            </span>
            <span className="text-xs font-bold text-slate-900">
              {h.member_count}/{h.max_people} spots
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-forest-600 transition-colors relative z-10">
          {h.title}
        </h3>

        <p className="text-slate-500 font-medium text-sm mb-8 flex items-center gap-2 relative z-10">
          <span className="bg-white p-1.5 rounded-lg shadow-sm">📍</span> {h.location_name}
        </p>

        <div className="flex flex-wrap gap-2 mb-10 relative z-10">
          <Badge tone={intensityTone}>{h.intensity}</Badge>
          <Badge tone="slate">Host: {h.creator_username}</Badge>
        </div>

        <div className="mt-auto flex items-center gap-3 relative z-10">
          <button
            onClick={onDetails}
            className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Details
          </button>

          <button
            onClick={onJoin}
            disabled={authed ? busy : false}
            className="flex-1 py-4 rounded-2xl bg-forest-600 text-white font-bold hover:bg-forest-700 transition-all active:scale-95 shadow-lg shadow-forest-200 disabled:opacity-50"
          >
            {joinLabel}
          </button>
        </div>

        {!authed && (
          <p className="mt-4 text-xs text-slate-400 font-semibold relative z-10">
            Tip: You can browse as a guest — login is only needed to join or create hikes.
          </p>
        )}
      </div>
    </div>
  );
}

export default function HikesList() {
  const nav = useNavigate();

  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [err, setErr] = useState("");

  const authed = !!localStorage.getItem("access");

  async function loadHikes() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/hikes/");
      setHikes(res.data);
    } catch {
      // Do NOT redirect to login — guests can browse
      setErr("Could not load hikes. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  }

  async function joinHike(hikeId) {
    if (!authed) return nav("/login");

    setJoiningId(hikeId);
    try {
      await api.post(`/api/hikes/${hikeId}/join/`);
      await loadHikes();
    } catch (e) {
      alert(e?.response?.data?.detail || "Could not join hike");
    } finally {
      setJoiningId(null);
    }
  }

  function openDetails(h) {
    // Optional: if private and not authed, send to login
    if (h.visibility === "private" && !authed) return nav("/login");
    nav(`/hikes/${h.id}`);
  }

  useEffect(() => {
    loadHikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="text-center mb-16 md:mb-24 relative">
        <div className="inline-block px-4 py-2 mb-8 rounded-full bg-forest-50 border border-forest-100 text-forest-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
          🌲 Discovery Mode Active
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter mb-6 md:mb-8 leading-[0.95]">
          Find Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-emerald-500">
            Next Adventure.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
          Explore upcoming hikes as a guest. Create and join hikes when you’re ready.
        </p>

        {/* Top action bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {authed ? (
            <button
              onClick={() => nav("/hikes/new")}
              className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
            >
              + Create a Hike
            </button>
          ) : (
            <button
              onClick={() => nav("/login")}
              className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
            >
              Login to Create
            </button>
          )}

          {!authed && (
            <button
              onClick={() => nav("/register")}
              className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
            >
              Sign Up
            </button>
          )}
        </div>

        {err && (
          <div className="mt-10 max-w-xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-bold text-sm">
            {err}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[400px] rounded-[2.5rem] bg-white animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {hikes.map((h) => (
            <Card
              key={h.id}
              h={h}
              authed={authed}
              busy={joiningId === h.id}
              onJoin={() => joinHike(h.id)}
              onDetails={() => openDetails(h)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}