import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 via-white to-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}