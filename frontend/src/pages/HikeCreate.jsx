import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

export default function HikeCreate() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location_name: "",
    start_time: "",
    end_time: "",
    intensity: "easy",
    max_people: 10,
    visibility: "public",
    items_to_carry: "",
    itinerary: "",
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        max_people: Number(form.max_people),
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      };

      await api.post("/api/hikes/", payload);
      nav("/hikes");
    } catch (e2) {
      const errorData = e2?.response?.data;
      const message = errorData?.detail || (errorData ? JSON.stringify(errorData) : "Failed to create hike");
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-white/50 px-6 py-4 outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all font-bold text-slate-900 placeholder:text-slate-300";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
              Host a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-emerald-500">New Trail.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium mt-4 italic">Lead the way for the community.</p>
          </div>
          <Link
            to="/hikes"
            className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm self-start"
          >
            Cancel
          </Link>
        </header>

        {err && (
          <div className="mb-10 p-6 rounded-[2rem] bg-red-50 border border-red-100 text-red-700 font-bold flex items-center gap-4 animate-in zoom-in duration-300">
            <span className="text-2xl">⚠️</span> {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-12 pb-24">
          {/* Section: Basics */}
          <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/50 shadow-xl shadow-slate-200/40">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-forest-600 mb-10 flex items-center gap-4">
               <span className="h-px w-8 bg-forest-200" /> 1. The Foundation
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className={labelClass}>Hike Title</label>
                <input 
                  className={inputClass} 
                  placeholder="e.g. Blue Hills Sunrise Expedition"
                  value={form.title} 
                  onChange={e => update("title", e.target.value)} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Meeting Point</label>
                  <input 
                    className={inputClass} 
                    placeholder="Trailhead address..." 
                    value={form.location_name} 
                    onChange={e => update("location_name", e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className={labelClass}>Difficulty Level</label>
                  <select 
                    className={inputClass + " appearance-none"} 
                    value={form.intensity} 
                    onChange={e => update("intensity", e.target.value)}
                  >
                    <option value="easy">Easy Stroll</option>
                    <option value="medium">Moderate Trek</option>
                    <option value="hard">Hard Climb</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Logistics */}
          <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/50 shadow-xl shadow-slate-200/40">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-forest-600 mb-10 flex items-center gap-4">
               <span className="h-px w-8 bg-forest-200" /> 2. Time & Access
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className={labelClass}>Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  className={inputClass} 
                  value={form.start_time} 
                  onChange={e => update("start_time", e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className={labelClass}>Est. Return (Optional)</label>
                <input 
                  type="datetime-local" 
                  className={inputClass} 
                  value={form.end_time} 
                  onChange={e => update("end_time", e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Maximum Group Size</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  min={1} 
                  value={form.max_people} 
                  onChange={e => update("max_people", e.target.value)} 
                />
              </div>
              <div>
                <label className={labelClass}>Privacy Setting</label>
                <select 
                  className={inputClass + " appearance-none"} 
                  value={form.visibility} 
                  onChange={e => update("visibility", e.target.value)}
                >
                  <option value="public">🌍 Public (Discoverable)</option>
                  <option value="private">🔒 Private (By Approval)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Details */}
          <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/50 shadow-xl shadow-slate-200/40">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-forest-600 mb-10 flex items-center gap-4">
               <span className="h-px w-8 bg-forest-200" /> 3. The Details
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className={labelClass}>The Adventure Story</label>
                <textarea 
                  className={inputClass + " min-h-[160px] leading-relaxed"} 
                  placeholder="Describe the views, the challenge, and the excitement..."
                  value={form.description} 
                  onChange={e => update("description", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Required Gear</label>
                <textarea 
                  className={inputClass + " min-h-[100px]"} 
                  placeholder="Hiking boots, 2L water, sunscreen..."
                  value={form.items_to_carry} 
                  onChange={e => update("items_to_carry", e.target.value)}
                />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-7 rounded-[2.5rem] bg-slate-900 text-white font-black text-2xl shadow-2xl shadow-slate-300 hover:bg-forest-900 hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Publishing Trail..." : "Launch This Expedition"}
          </button>
        </form>
      </div>
    </Layout>
  );
}