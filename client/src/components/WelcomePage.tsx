import { ProjectCard } from './ProjectCard';
import { AddProjectButton } from './AddProjectButton';
import type { Project } from '../types/project';

interface WelcomePageProps {
  projects: Project[];
  onDeleteProject?: (id: string) => void;
}

export function WelcomePage({ projects, onDeleteProject }: WelcomePageProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AddProjectButton />
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
}
