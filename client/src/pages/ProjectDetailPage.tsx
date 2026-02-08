import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getProject,
  updateProject,
  brainstorm,
  deleteProject,
  runStageAnalysis,
} from "../services/api";
import { Stage1Analysis } from "../components/Stage1Analysis";
import { Stage2Analysis } from "../components/Stage2Analysis";
import { Stage3Analysis } from "../components/Stage3Analysis";
import { Stage4Analysis } from "../components/Stage4Analysis";
import { Stage5Analysis } from "../components/Stage5Analysis";
import { StageSection } from "../components/StageSection";
import { StageStepperNav } from "../components/StageStepperNav";
import { WebGLBackground } from "../components/WebGLBackground";
import type { Project, Stage1Analysis as Stage1AnalysisType } from "../types/project";
import { ArrowLeft, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingStage, setGeneratingStage] = useState<2 | 3 | 4 | 5 | null>(null);
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then(setProject)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (project?.currentStage && activeStage > project.currentStage) {
      setActiveStage(project.currentStage);
    }
  }, [project?.currentStage]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject(id);
      navigate("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete project");
    }
  };

  const handleSave = async (data: {
    title: string;
    stage1Analysis: Stage1AnalysisType;
  }) => {
    if (!id) return;
    const updated = await updateProject(id, data);
    setProject(updated);
  };

  const handleBrainstorm = async (additionalContext?: string) => {
    if (!id || !project) return;
    const { updatedProject } = await brainstorm(id, {
      stage: 1,
      additionalContext,
    });
    setProject(updatedProject);
  };

  const handleGenerateStage = async (stage: 2 | 3 | 4 | 5) => {
    if (!id) return;
    setGeneratingStage(stage);
    try {
      const updated = await runStageAnalysis(id, stage);
      setProject(updated);
      setActiveStage(stage);
    } catch (e) {
      alert(e instanceof Error ? e.message : `Stage ${stage} analysis failed`);
    } finally {
      setGeneratingStage(null);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-[300px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive">
        {error ?? "Project not found"}
        <Link to="/" className="block mt-2 text-primary hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="relative min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <WebGLBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-4">
        <motion.div
          className="flex items-center justify-between py-1.5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to projects</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            Delete project
          </Button>
        </motion.div>

        <motion.div
          className="relative overflow-hidden mb-3 rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 to-card/40 shadow-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-glow-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                <Rocket className="w-3.5 h-3.5" />
                Stage {project.currentStage ?? 1} of 5
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground text-xs">
                <Sparkles className="w-3 h-3" />
                Plan2Ship
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-white drop-shadow-sm">
              {project.title || "Untitled"}
            </h1>
            {project.summary && (
              <p className="text-foreground/80 text-sm mt-2 line-clamp-3 leading-relaxed">
                {project.summary}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
            <StageStepperNav
            currentStage={project.currentStage}
            activeStage={activeStage}
            onStageChange={setActiveStage}
          />
        </motion.div>

        <div className="mt-3 min-h-[240px]">
          <AnimatePresence mode="wait">
            {activeStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="rounded-xl overflow-hidden bg-card/40 border border-white/10"
              >
                <StageSection stageNumber={1} title="Strategy & Ideation" defaultOpen>
                  {project.stage1Analysis ? (
                    <Stage1Analysis
                      project={project}
                      onSave={handleSave}
                      onBrainstorm={handleBrainstorm}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm p-3">
                      Stage 1 is generated when you upload a PDF. Re-upload or create a new project to run Stage 1.
                    </p>
                  )}
                </StageSection>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Stage2Analysis
                  sectionId="stage-2"
                  data={project.stage2Analysis}
                  onGenerate={() => handleGenerateStage(2)}
                  isGenerating={generatingStage === 2}
                  projectId={id}
                  metricsCharts={project.metricsCharts}
                />
              </motion.div>
            )}

            {activeStage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Stage3Analysis
                  sectionId="stage-3"
                  data={project.stage3Analysis}
                  onGenerate={() => handleGenerateStage(3)}
                  isGenerating={generatingStage === 3}
                  projectId={id}
                  metricsCharts={project.metricsCharts}
                />
              </motion.div>
            )}

            {activeStage === 4 && (
              <motion.div
                key="stage-4"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Stage4Analysis
                  sectionId="stage-4"
                  data={project.stage4Analysis}
                  onGenerate={() => handleGenerateStage(4)}
                  isGenerating={generatingStage === 4}
                  projectId={id}
                  onProjectUpdate={setProject}
                />
              </motion.div>
            )}

            {activeStage === 5 && (
              <motion.div
                key="stage-5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Stage5Analysis
                  sectionId="stage-5"
                  data={project.stage5Analysis}
                  onGenerate={() => handleGenerateStage(5)}
                  isGenerating={generatingStage === 5}
                  projectId={id}
                  metricsCharts={project.metricsCharts}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
