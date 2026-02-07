import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProjects, deleteProject } from "../services/api";
import type { Project } from "../types/project";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Rocket, Clock, MoreVertical, Search, ExternalLink, Trash2 } from "lucide-react";
import { CreateProjectDialog } from "@/components/ui/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function HomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchProjects = useCallback(() => {
    listProjects()
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this project? This cannot be undone.")) return;
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Project deleted",
          description: "The project has been removed.",
        });
      } catch (err) {
        toast({
          title: "Delete failed",
          description: err instanceof Error ? err.message : "Failed to delete project",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      (p.summary && p.summary.toLowerCase().includes(search.toLowerCase()))
  );

  if (error) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Your projects
          </h1>
          <p className="text-muted-foreground">Manage and track your product lifecycle.</p>
        </div>
        <CreateProjectDialog>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-primary/25">
            New Project
          </Button>
        </CreateProjectDialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card/40 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CreateProjectDialog>
            <div className="glass-card rounded-2xl p-6 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-primary/30 cursor-pointer group">
              <span className="text-4xl text-muted-foreground group-hover:text-primary mb-2 transition-colors">+</span>
              <span className="font-medium text-muted-foreground group-hover:text-foreground">Add Project</span>
              <span className="text-sm text-muted-foreground/80 mt-1">Upload a PDF to get started</span>
            </div>
          </CreateProjectDialog>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-48 flex flex-col justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                </div>
                <Skeleton className="h-8 w-1/4 bg-white/5" />
              </div>
            ))
          ) : (
            filteredProjects.map((project, i) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-6 group cursor-pointer h-full flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-white p-1 z-10 rounded-md hover:bg-white/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          aria-label="Project options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            navigate(`/project/${project.id}`);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {project.summary || "No summary available."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto border-t border-white/5 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {project.createdAt
                          ? format(new Date(project.createdAt), "MMM d, yyyy")
                          : "Just now"}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 font-medium">
                      Stage {project.currentStage ?? 1}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>

        {!loading && filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No projects match your search.
          </div>
        )}
      </div>
    </div>
  );
}
