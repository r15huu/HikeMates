import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 ${
        active
          ? "bg-forest-600 text-white shadow-lg shadow-forest-200 scale-105"
          : "text-slate-600 hover:text-forest-700 hover:bg-white/50"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Simple auth check (token presence)
  const authed = !!localStorage.getItem("access");

  // Dropdown (desktop)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Scroll styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const closeMenus = () => {
    setIsOpen(false);
    setMenuOpen(false);
  };

  const go = (path) => {
    closeMenus();
    nav(path);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    go("/login");
  };

  // initials (no useMemo)
  const u = localStorage.getItem("username") || "";
  const parts = u.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || "";
  const initials = (a + b).toUpperCase();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-500 ${
        scrolled ? "pt-3" : "pt-6"
      }`}
    >
      <nav
        className={`mx-auto max-w-5xl rounded-[2.5rem] border transition-all duration-500 ${
          scrolled
            ? "border-white/40 bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={authed ? "/hikes" : "/"}
            onClick={closeMenus}
            className="flex items-center gap-3 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:rotate-6 transition-transform">
              H
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              HikeMates
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {!authed ? (
              <>
                {!isAuthPage && (
                  <button
                    onClick={() => go("/login")}
                    className="px-5 py-2 rounded-2xl text-sm font-bold text-slate-600 hover:text-forest-700 hover:bg-white/50 transition"
                  >
                    Explore
                  </button>
                )}

                <div className="w-px h-6 bg-slate-200 mx-3" />

                <NavLink to="/login" onClick={closeMenus}>
                  Login
                </NavLink>

                <Link
                  to="/register"
                  onClick={closeMenus}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/hikes" onClick={closeMenus}>
                  Explore
                </NavLink>
                <NavLink to="/my-hikes" onClick={closeMenus}>
                  My Hikes
                </NavLink>
                <NavLink to="/hikes/new" onClick={closeMenus}>
                  Create
                </NavLink>

                <div className="w-px h-6 bg-slate-200 mx-3" />

                {/* Profile dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-11 px-3 rounded-2xl bg-white/60 border border-slate-200 hover:bg-white transition flex items-center gap-3 shadow-sm"
                  >
                    <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                      {initials}
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      Account
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition ${
                        menuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/60 overflow-hidden">
                      <button
                        onClick={() => go("/me")}
                        className="w-full text-left px-4 py-3 font-bold text-slate-700 hover:bg-white"
                      >
                        Profile
                      </button>
                      <div className="h-px bg-slate-100" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 font-black text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden p-2 text-slate-900 hover:bg-white/50 rounded-xl transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d={
                  isOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 border-t border-slate-100 flex flex-col gap-3 bg-white/90 backdrop-blur-lg rounded-b-[2.5rem]">
            {!authed ? (
              <>
                <button
                  onClick={() => go("/login")}
                  className="w-full py-4 rounded-2xl font-bold text-slate-700 bg-white/60 border border-slate-200"
                >
                  Login
                </button>
                <button
                  onClick={() => go("/register")}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => go("/hikes")}
                  className="text-left px-5 py-3 rounded-2xl font-bold hover:bg-white/60"
                >
                  Explore
                </button>
                <button
                  onClick={() => go("/my-hikes")}
                  className="text-left px-5 py-3 rounded-2xl font-bold hover:bg-white/60"
                >
                  My Hikes
                </button>
                <button
                  onClick={() => go("/hikes/new")}
                  className="text-left px-5 py-3 rounded-2xl font-bold hover:bg-white/60"
                >
                  Create
                </button>
                <button
                  onClick={() => go("/me")}
                  className="text-left px-5 py-3 rounded-2xl font-bold hover:bg-white/60"
                >
                  Profile
                </button>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  onClick={logout}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}