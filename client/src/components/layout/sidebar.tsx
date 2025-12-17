import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  AlertTriangle,
  Users,
  MapPin,
  Trophy,
  Database,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Visão Geral",
    path: "/",
    icon: LayoutDashboard
  },
  {
    title: "Upload & Processamento",
    path: "/upload",
    icon: Upload
  },
  {
    title: "SLA de Performance",
    path: "/sla-performance",
    icon: TrendingUp
  },
  {
    title: "Atrasos & Exceções",
    path: "/atrasos",
    icon: AlertTriangle
  },
  {
    title: "Vendedores",
    path: "/vendedores",
    icon: Users
  },
  {
    title: "Zonas & CEPs",
    path: "/zonas",
    icon: MapPin
  },
  {
    title: "Rankings",
    path: "/rankings",
    icon: Trophy
  },
  {
    title: "Base Consolidada",
    path: "/base-consolidada",
    icon: Database
  },
  {
    title: "Histórico & Comparativos",
    path: "/historico",
    icon: History
  }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col" data-testid="sidebar">
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    "hover-elevate active-elevate-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80"
                  )}
                  data-testid={`link-nav-${item.path.replace("/", "") || "home"}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60">
          <p>Versão 1.0.0</p>
          <p className="mt-1">Mercado Livre Operations</p>
        </div>
      </div>
    </aside>
  );
}
