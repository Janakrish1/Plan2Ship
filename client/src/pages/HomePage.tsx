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
    <motion.div
      className="flex flex-col gap-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex flex-col gap-0.5">
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-2xl md:text-3xl font-display font-bold text-white"
          >
            Your projects
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-muted-foreground text-sm"
          >
            Manage and track your product lifecycle.
          </motion.p>
        </div>
        <motion.div
          className="flex items-center gap-2 flex-1 sm:flex-initial sm:max-w-xs"
          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="relative flex-1 min-w-0 group/search">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover/search:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card/40 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
          <CreateProjectDialog>
            <Button className="bg-primary hover:bg-primary/90 active:scale-[0.98] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/25 shrink-0 transition-transform duration-150 hover:scale-[1.02]">
              New
            </Button>
          </CreateProjectDialog>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CreateProjectDialog>
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
              transition={{ duration: 0.35, delay: 0.08 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className="glass-card rounded-xl p-4 min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-primary/40 cursor-pointer group animate-border-glow"
            >
              <span className="text-3xl text-muted-foreground group-hover:text-primary mb-1 transition-transform duration-200 group-hover:scale-125">+</span>
              <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground">Add Project</span>
              <span className="text-xs text-muted-foreground/80 mt-0.5">Upload a PDF</span>
            </motion.div>
          </CreateProjectDialog>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-4 h-36 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-white/5" />
                  <Skeleton className="h-3 w-full bg-white/5" />
                </div>
                <Skeleton className="h-6 w-1/4 bg-white/5" />
              </motion.div>
            ))
          ) : (
            filteredProjects.map((project, i) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-card rounded-xl p-4 group cursor-pointer h-full flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="flex justify-between items-start mb-2">
                    <motion.div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors" whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}>
                      <Rocket className="w-4 h-4" />
                    </motion.div>
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
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title || "Untitled"}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">
                    {project.summary || "No summary available."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto border-t border-white/5 pt-2">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 text-muted-foreground text-sm col-span-full"
          >
            No projects match your search.
          </motion.div>
        )}
    </motion.div>
  );
}
