import { Link, useLocation, useNavigate } from "react-router-dom";

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={
        "px-3 py-2 rounded-lg text-sm font-medium transition " +
        (active
          ? "bg-forest-600 text-white shadow"
          : "text-slate-700 hover:bg-white/60 hover:text-slate-900")
      }
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const nav = useNavigate();

  return (
    <div className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/hikes" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-forest-600 text-white grid place-items-center font-bold shadow">
            H
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-slate-900">HikeMates</div>
            <div className="text-xs text-slate-500">Find your next trail</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/hikes">Explore</NavLink>
          <NavLink to="/my-hikes">My Hikes</NavLink>
          <NavLink to="/hikes/new">Create</NavLink>
          <NavLink to="/me">Profile</NavLink>

          <button
            className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              nav("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}