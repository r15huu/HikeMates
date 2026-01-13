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
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ h, onJoin, onDetails, busy }) {
  const intensityTone = h.intensity === "hard" ? "orange" : h.intensity === "medium" ? "slate" : "green";
  
  return (
    <div className="group bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/50 p-2 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
      <div className="bg-slate-50/50 rounded-[2rem] p-8 h-full flex flex-col relative overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-forest-100/20 rounded-full blur-2xl group-hover:bg-forest-200/40 transition-colors" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <Badge tone={h.visibility === "private" ? "slate" : "green"}>{h.visibility}</Badge>
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Availability</span>
            <span className="text-xs font-bold text-slate-900">{h.member_count}/{h.max_people} spots</span>
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
            disabled={busy}
            className="flex-1 py-4 rounded-2xl bg-forest-600 text-white font-bold hover:bg-forest-700 transition-all active:scale-95 shadow-lg shadow-forest-200 disabled:opacity-50"
          >
            {busy ? "..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HikesList() {
  const nav = useNavigate();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  async function loadHikes() {
    setLoading(true);
    try {
      const res = await api.get("/api/hikes/");
      setHikes(res.data);
    } catch {
      nav("/login");
    } finally {
      setLoading(false);
    }
  }

  async function joinHike(hikeId) {
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

  useEffect(() => { loadHikes(); }, []);

  return (
    <Layout>
      <div className="text-center mb-24 relative">
        <div className="inline-block px-4 py-2 mb-8 rounded-full bg-forest-50 border border-forest-100 text-forest-700 text-[10px] font-black uppercase tracking-[0.2em] animate-bounce shadow-sm">
          🌲 Discovery Mode Active
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
          Find Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-emerald-500">Next Adventure.</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-500 text-xl font-medium leading-relaxed">
          The ultimate platform for outdoor enthusiasts. Explore hidden trails, meet hikers, and conquer summits together.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] rounded-[2.5rem] bg-white animate-pulse shadow-sm border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {hikes.map((h) => (
            <Card
              key={h.id}
              h={h}
              busy={joiningId === h.id}
              onJoin={() => joinHike(h.id)}
              onDetails={() => nav(`/hikes/${h.id}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}