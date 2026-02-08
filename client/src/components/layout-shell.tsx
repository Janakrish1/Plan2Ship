import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Plus, Rocket, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CreateProjectDialog } from "@/components/ui/create-project-dialog";

const SIDEBAR_WIDTH_EXPANDED = "w-72";
const SIDEBAR_WIDTH_COLLAPSED = "w-20";
const MAIN_PL_EXPANDED = "lg:pl-72";
const MAIN_PL_COLLAPSED = "lg:pl-20";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigation = [
    { name: "Projects", href: "/", icon: FolderKanban },
    { name: "New project", href: "/create", icon: Plus, isCreate: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar for Desktop - collapsible */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 z-50 border-r border-white/5 bg-card/30 backdrop-blur-xl transition-[width] duration-300 ease-in-out overflow-hidden",
          isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
        )}
      >
        <Link
          to="/"
          className={cn("flex items-center gap-3 shrink-0 border-b border-white/5 hover:opacity-90 transition-opacity", isSidebarCollapsed ? "p-2.5 justify-center" : "p-5")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <span className="font-display font-bold text-2xl tracking-tight text-foreground whitespace-nowrap">
              Plan<span className="text-primary">2</span>Ship
            </span>
          )}
        </Link>

        <nav className={cn("flex-1 space-y-1 mt-2", isSidebarCollapsed ? "px-2" : "px-3")}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            if (item.isCreate) {
              return (
                <CreateProjectDialog key={item.name}>
                  <button
                    type="button"
                    className={cn(
"flex w-full items-center rounded-xl transition-all duration-200 group text-left",
                    isSidebarCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5",
                      "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
                  </button>
                </CreateProjectDialog>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 group",
                  isSidebarCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((c) => !c)}
            className={cn(
              "flex items-center justify-center w-full rounded-lg py-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors",
              isSidebarCollapsed ? "px-0" : "gap-1.5 px-2"
            )}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <><PanelLeftClose className="w-5 h-5" /> <span className="text-sm font-medium">Collapse</span></>}
          </button>
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
      <main className={cn("flex-1 pt-16 lg:pt-0 min-h-screen relative transition-[padding] duration-300", isSidebarCollapsed ? MAIN_PL_COLLAPSED : MAIN_PL_EXPANDED)}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10 p-3 md:p-5 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
