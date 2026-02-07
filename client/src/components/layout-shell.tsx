import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Plus, Rocket } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CreateProjectDialog } from "@/components/ui/create-project-dialog";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Projects", href: "/", icon: FolderKanban },
    { name: "New project", href: "/create", icon: Plus, isCreate: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 border-r border-white/5 bg-card/30 backdrop-blur-xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-foreground hover:opacity-90">
            Plan<span className="text-primary">2</span>Ship
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            if (item.isCreate) {
              return (
                <CreateProjectDialog key={item.name}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                      "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                </CreateProjectDialog>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5">
            <h4 className="font-semibold text-sm mb-1 text-white">Pro Plan</h4>
            <p className="text-xs text-muted-foreground mb-3">Unlock advanced AI analysis</p>
            <button type="button" className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-semibold transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">Plan2Ship</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <span className="text-2xl">×</span>
          ) : (
            <LayoutDashboard className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-20 px-6 lg:hidden">
          <nav className="space-y-2">
            {navigation.map((item) => {
              if (item.isCreate) {
                return (
                  <CreateProjectDialog key={item.name}>
                    <button
                      type="button"
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-4 rounded-xl transition-all text-left",
                        "text-muted-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-lg">{item.name}</span>
                    </button>
                  </CreateProjectDialog>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-xl transition-all",
                    location.pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-lg">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0 min-h-screen relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
