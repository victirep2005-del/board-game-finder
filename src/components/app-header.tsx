import { Link } from "@tanstack/react-router";
import { Gamepad2, Library, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader() {
  return (
    <header className="border-b border-white/15 bg-slate-950/90 text-foreground backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">BoardGameFinder</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" icon={<MapPin className="h-4 w-4" />} label="Buscar" />
          <NavLink to="/catalogo" icon={<Library className="h-4 w-4" />} label="Catálogo" />
          <NavLink to="/ubicaciones" icon={<MapPin className="h-4 w-4" />} label="Ubicaciones" />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to as any}
      activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors",
        "hover:bg-white/10 hover:text-white",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
