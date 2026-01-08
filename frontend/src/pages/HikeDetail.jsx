import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (hike?.is_admin) loadJoinRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hike?.is_admin]);

  async function joinOrRequest() {
    if (!hike) return;
    setErr("");
    setBusy(true);

    try {
      // We don't need the response body; just do the action then refresh state
      await api.post(`/api/hikes/${id}/join/`);
      await loadHike();

      // If you're admin, refresh requests too
      if (hike.is_admin) {
        await loadJoinRequests();
      }
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not join/request.");
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
    } catch (e) {
      setErr(e?.response?.data?.detail || "Could not approve request.");
    } finally {
      setBusy(false);
    }
  }

  function joinButtonText() {
    if (!hike) return "Join";
    if (hike.is_member) return "Joined";
    if (hike.visibility === "public") return "Join";
    if (hike.join_request_status === "pending") return "Requested (Pending)";
    if (hike.join_request_status === "approved") return "Approved";
    if (hike.join_request_status === "rejected") return "Rejected";
    return "Request to Join";
  }

  const joinDisabled =
    !hike ||
    busy ||
    hike.is_member ||
    hike.join_request_status === "pending" ||
    hike.join_request_status === "rejected";

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Hike Details</h2>
        <Link to="/hikes">Back</Link>
      </div>

      {err && <p style={{ color: "red" }}>{err}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !hike && <p>Hike not found.</p>}

      {hike && (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10, marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>{hike.title}</h3>

          <p style={{ color: "#555" }}>
            {hike.location_name} • {hike.intensity} • {hike.visibility}
          </p>

          <p>
            <strong>Created by:</strong> {hike.creator_username}
          </p>

          <p>
            <strong>Members:</strong> {hike.member_count}/{hike.max_people}
          </p>

          {hike.description && (
            <p>
              <strong>Description:</strong> {hike.description}
            </p>
          )}

          {hike.items_to_carry && (
            <p>
              <strong>Items:</strong> {hike.items_to_carry}
            </p>
          )}

          {hike.itinerary && (
            <p>
              <strong>Itinerary:</strong> {hike.itinerary}
            </p>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={joinOrRequest} disabled={joinDisabled}>
              {busy ? "Working..." : joinButtonText()}
            </button>

            {hike.is_admin && <span>(You are admin)</span>}
          </div>
        </div>
      )}

      {hike?.is_admin && (
        <div style={{ marginTop: 18 }}>
          <h3>Join Requests</h3>

          {requests.length === 0 ? (
            <p>No requests yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {requests.map((r) => (
                <div key={r.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{r.user_username}</strong>
                    <span>{r.status}</span>
                  </div>

                  {r.status === "pending" && (
                    <button
                      style={{ marginTop: 8 }}
                      onClick={() => approveRequest(r.id)}
                      disabled={busy}
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}