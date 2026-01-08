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
      setErr(JSON.stringify(e2?.response?.data) || "Failed to create hike");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Create a Hike</h2>
            <p className="text-slate-600 mt-1">Host a hike and invite others to join.</p>
          </div>

          <Link
            to="/hikes"
            className="px-4 py-2 rounded-xl bg-white/80 border border-white shadow-sm hover:shadow transition"
          >
            Back
          </Link>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 rounded-2xl bg-white/80 border border-white shadow-sm p-6 grid gap-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Blue Hills Sunrise Hike"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-slate-700">Location name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Blue Hills Reservation"
              value={form.location_name}
              onChange={(e) => update("location_name", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Easy sunrise hike, bring water."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Start time</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => update("start_time", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">End time (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => update("end_time", e.target.value)}
              />
            </div>
          </div>

          {/* Intensity + Visibility + Max */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Intensity</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                value={form.intensity}
                onChange={(e) => update("intensity", e.target.value)}
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Visibility</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                value={form.visibility}
                onChange={(e) => update("visibility", e.target.value)}
              >
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Max people</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
                type="number"
                min={1}
                value={form.max_people}
                onChange={(e) => update("max_people", e.target.value)}
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="text-sm font-medium text-slate-700">Items to carry</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Water, jacket, flashlight"
              value={form.items_to_carry}
              onChange={(e) => update("items_to_carry", e.target.value)}
              rows={2}
            />
          </div>

          {/* Itinerary */}
          <div>
            <label className="text-sm font-medium text-slate-700">Itinerary</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-forest-200"
              placeholder="Meet 6:15, start 6:30, return 9:00"
              value={form.itinerary}
              onChange={(e) => update("itinerary", e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create hike"}
          </button>
        </form>
      </div>
    </Layout>
  );
}