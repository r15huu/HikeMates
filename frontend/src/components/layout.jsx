import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans text-slate-900">
      {/* Animated Mesh Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-forest-200/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-100/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="mx-auto max-w-6xl w-full px-6 py-12 md:py-20 flex-grow">
          {/* Page Entry Animation */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            {children}
          </div>
        </main>
        
        <footer className="py-12 text-center border-t border-slate-100 bg-white/20 backdrop-blur-sm">
          <div className="h-px w-16 bg-forest-200 mx-auto mb-6" />
          <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">
            Adventure Awaits • HikeMates 2026
          </p>
        </footer>
      </div>
    </div>
  );
}