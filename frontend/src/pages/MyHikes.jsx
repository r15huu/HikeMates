import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

function Badge({ children, tone = "green" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tones[tone]}`}>
      {children}
    </span>
  );
}

function MyCard({ h }) {
  if (!h) return null;
  const intensityTone = h.intensity === "hard" ? "orange" : h.intensity === "medium" ? "slate" : "green";

  return (
    <div className="group rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 overflow-hidden flex flex-col h-full">
      <div className="h-28 bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start relative overflow-hidden">
        <div className="absolute inset-0 bg-forest-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Badge tone={h.visibility === "private" ? "slate" : "green"}>
          {h.visibility === "private" ? "🔒 Private" : "🌍 Public"}
        </Badge>
        <div className="text-right relative z-10">
          <div className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Event Date</div>
          <div className="text-xs font-black text-slate-900">
            {h.start_time ? new Date(h.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBD"}
          </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-2xl font-black text-slate-900 group-hover:text-forest-700 transition-colors line-clamp-1 mb-2">
          {h.title}
        </h3>
        <p className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 italic">
          <span className="not-italic opacity-100">📍</span> {h.location_name}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Badge tone={intensityTone}>{h.intensity}</Badge>
          <Badge tone="slate">{h.member_count} Members</Badge>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
          <Link
            to={`/hikes/${h.id}`}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-forest-600 transition-all active:scale-95"
          >
            Manage Trail
          </Link>
          <span className="text-[10px] font-black text-slate-400 uppercase">Organized by {h.creator_username}</span>
        </div>
      </div>
    </div>
  );
}

export default function MyHikes() {
  const nav = useNavigate();
  const [hikes, setHikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadMyHikes() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/api/hikes/my/");
      setHikes(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        nav("/login");
      } else {
        setErr("Connectivity lost. Could not retrieve your trails.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMyHikes(); }, []);

  return (
    <Layout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">Your <br />Activity.</h2>
          <p className="text-xl text-slate-500 font-medium mt-4 italic">Trails you're leading or attending.</p>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all shadow-sm" 
            to="/hikes"
          >
            Explore
          </Link>
          <Link 
            className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-bold hover:bg-forest-700 transition-all shadow-2xl shadow-forest-100" 
            to="/hikes/new"
          >
            + New Hike
          </Link>
        </div>
      </header>

      {err && (
        <div className="mb-10 p-6 rounded-[2rem] bg-red-50 border border-red-100 text-red-600 font-bold">
          {err}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-white rounded-[2.5rem] border border-slate-50 animate-pulse" />
          ))}
        </div>
      ) : hikes.length === 0 ? (
        <div className="text-center py-32 rounded-[3.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="text-8xl mb-10 opacity-20">🏔️</div>
          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">The horizon is clear.</h3>
          <p className="text-slate-500 text-lg font-medium mb-10 max-w-sm mx-auto">You haven't joined or created any adventures yet. Time to hit the trail!</p>
          <div className="flex justify-center gap-6">
            <Link className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-bold shadow-lg" to="/hikes">Browse Trails</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {hikes.map((h) => (
            <MyCard key={h.id} h={h} />
          ))}
        </div>
      )}
    </Layout>
  );
}