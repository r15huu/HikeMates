import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/layout";

function Badge({ children, tone = "green" }) {
  const cls =
    tone === "green"
      ? "bg-forest-100 text-forest-800 border-forest-200"
      : tone === "slate"
      ? "bg-slate-100 text-slate-800 border-slate-200"
      : "bg-orange-100 text-orange-800 border-orange-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {children}
    </span>
  );
}

function Card({ h, onJoin, onDetails, busy }) {
  const intensityTone = h.intensity === "hard" ? "orange" : h.intensity === "medium" ? "slate" : "green";
  const visTone = h.visibility === "private" ? "slate" : "green";

  return (
    <div className="group rounded-2xl bg-white/80 border border-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-forest-800 transition">
              {h.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{h.location_name}</p>
          </div>
          <Badge tone={visTone}>{h.visibility}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge tone={intensityTone}>{h.intensity}</Badge>
          <Badge tone="slate">
            members: {h.member_count}/{h.max_people}
          </Badge>
          <Badge tone="slate">by {h.creator_username}</Badge>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={onDetails}
            className="text-sm font-semibold text-forest-700 hover:text-forest-800"
          >
            View details →
          </button>

          <button
            onClick={onJoin}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition disabled:opacity-60"
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
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  async function loadHikes() {
    setErr("");
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
    setErr("");
    setJoiningId(hikeId);
    try {
      await api.post(`/api/hikes/${hikeId}/join/`);
      await loadHikes();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not join hike");
    } finally {
      setJoiningId(null);
    }
  }

  useEffect(() => {
    loadHikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Explore Hikes</h2>
          <p className="text-slate-600 mt-1">Find public hikes or request to join private groups.</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/my-hikes"
            className="px-4 py-2 rounded-xl bg-white/80 border border-white shadow-sm hover:shadow transition"
          >
            My Hikes
          </Link>

          <Link
            to="/hikes/new"
            className="px-4 py-2 rounded-xl bg-forest-600 text-white shadow hover:bg-forest-700 transition"
          >
            + Create
          </Link>
        </div>
      </div>

      {err && <p className="mt-4 text-red-600">{err}</p>}
      {loading && <p className="mt-6 text-slate-600">Loading...</p>}

      {!loading && hikes.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white/70 border border-white p-6">
          <p className="text-slate-700">
            No hikes yet. Create one from <Link className="text-forest-700 font-semibold" to="/hikes/new">Create</Link>.
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
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

      <div className="mt-10 text-sm text-slate-500">
        Tip: For private hikes, “Join” will create a join request (Step 8).
      </div>
    </Layout>
  );
}