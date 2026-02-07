import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProject, updateProject, brainstorm, deleteProject, runStageAnalysis } from '../services/api';
import { Stage1Analysis } from '../components/Stage1Analysis';
import { Stage2Analysis } from '../components/Stage2Analysis';
import { Stage3Analysis } from '../components/Stage3Analysis';
import { Stage4Analysis } from '../components/Stage4Analysis';
import { Stage5Analysis } from '../components/Stage5Analysis';
import { StageSection } from '../components/StageSection';
import { StageIndicator } from '../components/StageIndicator';
import type { Project, Stage1Analysis as Stage1AnalysisType } from '../types/project';

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
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      navigate('/');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete project');
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
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
        {error ?? 'Project not found'}
        <Link to="/" className="block mt-2 text-primary-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap justify-between">
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          ← Back to projects
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
          title="Delete project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
          </svg>
          Delete project
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{project.title || 'Untitled'}</h1>
        <StageIndicator currentStage={project.currentStage} />
      </div>
      {project.summary && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
          <p className="text-gray-600 text-sm">{project.summary}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Stage 1: Strategy & Ideation — from PDF upload */}
        <StageSection stageNumber={1} title="Strategy & Ideation" defaultOpen>
          {project.stage1Analysis ? (
            <Stage1Analysis
              project={project}
              onSave={handleSave}
              onBrainstorm={handleBrainstorm}
            />
          ) : (
            <p className="text-gray-500 text-sm">Stage 1 is generated when you upload a PDF. Re-upload or create a new project to run Stage 1.</p>
          )}
        </StageSection>

        {/* Stages 2–5: Generate on demand */}
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
