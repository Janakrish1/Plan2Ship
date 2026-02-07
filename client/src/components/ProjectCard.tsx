import { Link } from 'react-router-dom';
import type { Project } from '../types/project';
import { StageIndicator } from './StageIndicator';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const date = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(project.id);
  };

  return (
    <Link
      to={`/project/${project.id}`}
      className="relative block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          title="Delete project"
          aria-label="Delete project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      <div className="flex flex-col gap-3">
        {project.thumbnail ? (
          <div
            className="h-24 rounded-lg bg-gray-100 bg-cover bg-center"
            style={{ backgroundImage: `url(${project.thumbnail})` }}
          />
        ) : (
          <div className="h-24 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 text-4xl font-bold">
            {project.title?.charAt(0) ?? 'P'}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 truncate">{project.title || 'Untitled'}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{date}</p>
        </div>
        <StageIndicator currentStage={project.currentStage} />
      </div>
    </Link>
  );
}
