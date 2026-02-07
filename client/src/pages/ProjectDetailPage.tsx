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
import { StageIndicator } from "../components/StageIndicator";
import type { Project, Stage1Analysis as Stage1AnalysisType } from "../types/project";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingStage, setGeneratingStage] = useState<2 | 3 | 4 | 5 | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then(setProject)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

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
    } catch (e) {
      alert(e instanceof Error ? e.message : `Stage ${stage} analysis failed`);
    } finally {
      setGeneratingStage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to projects</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          Delete project
        </Button>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {project.title || "Untitled"}
            </h1>
            <StageIndicator currentStage={project.currentStage} />
          </div>
        </div>
        {project.summary && (
          <div className="relative z-10 mt-4 rounded-lg bg-white/5 border border-white/10 p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
            <p className="text-foreground/90 text-sm">{project.summary}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <StageSection stageNumber={1} title="Strategy & Ideation" defaultOpen>
          {project.stage1Analysis ? (
            <Stage1Analysis
              project={project}
              onSave={handleSave}
              onBrainstorm={handleBrainstorm}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Stage 1 is generated when you upload a PDF. Re-upload or create a new project to run
              Stage 1.
            </p>
          )}
        </StageSection>

        <Stage2Analysis
          data={project.stage2Analysis}
          onGenerate={() => handleGenerateStage(2)}
          isGenerating={generatingStage === 2}
          projectId={id}
          metricsCharts={project.metricsCharts}
        />
        <Stage3Analysis
          data={project.stage3Analysis}
          onGenerate={() => handleGenerateStage(3)}
          isGenerating={generatingStage === 3}
          projectId={id}
          metricsCharts={project.metricsCharts}
        />
        <Stage4Analysis
          data={project.stage4Analysis}
          onGenerate={() => handleGenerateStage(4)}
          isGenerating={generatingStage === 4}
          projectId={id}
          onProjectUpdate={setProject}
        />
        <Stage5Analysis
          data={project.stage5Analysis}
          onGenerate={() => handleGenerateStage(5)}
          isGenerating={generatingStage === 5}
          projectId={id}
          metricsCharts={project.metricsCharts}
        />
      </div>
    </div>
  );
}
