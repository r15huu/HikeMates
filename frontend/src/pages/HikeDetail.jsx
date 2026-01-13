import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

export default function HikeDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [hike, setHike] = useState(null);
  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function loadHike() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/api/hikes/${id}/`);
      setHike(res.data);
    } catch {
      nav("/login");
    } finally {
      setLoading(false);
    }
  }

  async function loadJoinRequests() {
    try {
      const res = await api.get(`/api/hikes/${id}/join_requests/`);
      setRequests(res.data);
    } catch {
      setRequests([]);
    }
  }

  useEffect(() => {
    loadHike();
  }, [id]);

  useEffect(() => {
    if (hike?.is_admin) loadJoinRequests();
  }, [hike?.is_admin]);

  async function joinOrRequest() {
    if (!hike) return;
    setErr("");
    setBusy(true);

    try {
      await api.post(`/api/hikes/${id}/join/`);
      await loadHike();
      if (hike.is_admin) await loadJoinRequests();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function approveRequest(requestId) {
    setErr("");
    setBusy(true);
    try {
      await api.post(`/api/hikes/${id}/approve_request/`, { request_id: requestId });
      await loadJoinRequests();
      await loadHike();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not approve.");
    } finally {
      setBusy(false);
    }
  }

  function getButtonStyles() {
    if (hike?.is_member) return "bg-slate-100 text-slate-400 cursor-default";
    if (hike?.join_request_status === "pending") return "bg-orange-50 text-orange-600 border border-orange-100 cursor-default";
    return "bg-forest-600 text-white hover:bg-forest-700 shadow-2xl shadow-forest-100 active:scale-95";
  }

  function joinButtonText() {
    if (!hike) return "Join";
    if (hike.is_member) return "Joined ✓";
    if (hike.visibility === "public") return "Join This Trail";
    if (hike.join_request_status === "pending") return "Request Pending...";
    if (hike.join_request_status === "rejected") return "Request Rejected";
    return "Request to Join";
  }

  const joinDisabled = !hike || busy || hike.is_member || hike.join_request_status === "pending" || hike.join_request_status === "rejected";

  return (
    <Layout>
      <div className="flex items-center gap-3 text-sm font-bold text-slate-400 mb-10 ml-2">
        <Link to="/hikes" className="hover:text-forest-600 transition-colors uppercase tracking-widest">Trails</Link>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900 uppercase tracking-widest">{hike?.title || "Loading..."}</span>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="h-16 w-2/3 bg-white rounded-3xl animate-pulse" />
          <div className="h-96 bg-white rounded-[3rem] animate-pulse shadow-sm" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info Section */}
          <div className="lg:col-span-2 space-y-12">
            <header>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                {hike.title}
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-black text-xs">
                    {hike.creator_username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-600">Lead by {hike.creator_username}</span>
                </div>
                <div className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border ${
                  hike.intensity === 'hard' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {hike.intensity} Intensity
                </div>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Visibility', val: hike.visibility, icon: '🌍' },
                { label: 'Attendees', val: `${hike.member_count} / ${hike.max_people}`, icon: '👥' },
                { label: 'Location', val: hike.location_name, icon: '📍' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</div>
                  <div className="font-black text-slate-900 flex items-center gap-2">
                    <span className="text-lg">{stat.icon}</span> {stat.val}
                  </div>
                </div>
              ))}
            </div>

            <section className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm space-y-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="h-8 w-1 bg-forest-500 rounded-full" /> The Story
                </h3>
                <p className="text-slate-600 leading-relaxed text-xl font-medium">
                  {hike.description || "The organizers haven't shared the backstory for this trail yet."}
                </p>
              </div>

              {hike.items_to_carry && (
                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3">
                    🎒 Packing List
                  </h3>
                  <p className="text-slate-600 font-medium">{hike.items_to_carry}</p>
                </div>
              )}

              {hike.itinerary && (
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                    <span className="h-8 w-1 bg-forest-500 rounded-full" /> Itinerary
                  </h3>
                  <div className="p-8 rounded-[2.5rem] bg-forest-50/30 border border-forest-100 whitespace-pre-wrap text-slate-700 font-medium leading-loose">
                    {hike.itinerary}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="sticky top-32 bg-white rounded-[3rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-forest-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              
              <h4 className="text-2xl font-black text-slate-900 mb-8 relative z-10">Trail Registration</h4>
              
              {err && <p className="text-red-600 text-xs mb-6 font-bold bg-red-50 p-4 rounded-2xl relative z-10">{err}</p>}

              <button 
                onClick={joinOrRequest} 
                disabled={joinDisabled}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all relative z-10 ${getButtonStyles()}`}
              >
                {busy ? "Syncing..." : joinButtonText()}
              </button>

              <div className="mt-8 space-y-6 pt-6 border-t border-slate-50 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Meeting At</span>
                  <span className="text-sm font-bold text-slate-900">{hike.start_time ? new Date(hike.start_time).toLocaleString() : "TBD"}</span>
                </div>
                {hike.end_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Finish Time</span>
                    <span className="text-sm font-bold text-slate-900">{new Date(hike.end_time).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Management View */}
            {hike.is_admin && (
              <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl text-white">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <span className="text-forest-400">●</span> Join Requests
                </h3>

                {requests.length === 0 ? (
                  <p className="text-slate-400 text-sm font-bold italic opacity-60">No explorers waiting.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => (
                      <div key={r.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 group">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-black text-slate-100">{r.user_username}</span>
                          <span className="text-[10px] font-black uppercase bg-forest-600 px-2 py-0.5 rounded-full">Pending</span>
                        </div>
                        <button
                          onClick={() => approveRequest(r.id)}
                          disabled={busy}
                          className="w-full py-3 bg-white text-slate-900 text-xs font-black rounded-xl hover:bg-forest-400 hover:text-white transition-all active:scale-95"
                        >
                          Approve Explorer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}