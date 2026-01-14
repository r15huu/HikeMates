import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout";

export default function Home() {
  const nav = useNavigate();
  const authed = !!localStorage.getItem("access");

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 pt-24">
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/50 p-12 shadow-2xl shadow-slate-200/50">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            Find your next trail.
          </h1>
          <p className="text-slate-600 font-medium mt-4 max-w-2xl">
            Browse upcoming hikes and meet hikers nearby. You can explore without an account —
            join and create hikes when you’re ready.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => nav("/hikes")}
              className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition"
            >
              Explore Hikes
            </button>

            {!authed ? (
              <>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-2xl bg-white border border-slate-200 font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                to="/my-hikes"
                className="px-8 py-4 rounded-2xl bg-forest-600 text-white font-black shadow-xl shadow-forest-100 hover:bg-forest-700 active:scale-95 transition"
              >
                My Hikes
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}