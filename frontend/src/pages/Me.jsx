import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

export default function Me() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3.5rem] bg-gradient-to-br from-forest-500 to-emerald-700 flex items-center justify-center text-6xl font-black text-white shadow-2xl shadow-forest-200 group-hover:rotate-3 transition-transform">
              {me?.username?.[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-white border-8 border-slate-50 flex items-center justify-center shadow-xl text-2xl">
              🌲
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-3">
              Howdy, {me?.username}!
            </h2>
            <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-xs">
              {me?.email} • EXPLORER SINCE 2026
            </p>
          </div>
          
          <button 
            onClick={logout}
            className="md:ml-auto px-10 py-5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 shadow-sm"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-64 bg-white rounded-[3rem] animate-pulse" />
            <div className="h-64 bg-white rounded-[3rem] animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Bio Card */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-12 border border-white/50 shadow-xl shadow-slate-200/30">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-forest-600 mb-8 flex items-center gap-4">
                  <span className="h-px w-8 bg-forest-200" /> About You
                </h3>
                <p className="text-slate-600 leading-relaxed font-bold text-2xl italic">
                  "{me?.bio || "No trail bio yet. Your adventures speak for themselves."}"
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm text-center group">
                  <div className="text-5xl font-black text-forest-600 mb-2 group-hover:scale-110 transition-transform">✓</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Active</div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm text-center group">
                  <div className="text-5xl font-black text-slate-900 mb-2 group-hover:scale-110 transition-transform">0</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peaks Conquered</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              <Link to="/hikes/new" className="block p-10 rounded-[3rem] bg-forest-600 text-white shadow-2xl shadow-forest-200 hover:translate-y-[-4px] transition-all group overflow-hidden relative">
                <div className="relative z-10">
                  <span className="block text-3xl font-black mb-2 leading-none">Host Hike →</span>
                  <span className="text-forest-100 font-bold text-sm opacity-80 uppercase tracking-widest">Lead a new group</span>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              </Link>
              
              <Link to="/my-hikes" className="block p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                <span className="block text-3xl font-black text-slate-900 mb-2 leading-none group-hover:text-forest-600 transition-colors">Schedule</span>
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Review your trails</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}