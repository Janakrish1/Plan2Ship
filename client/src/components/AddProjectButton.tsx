import { Link } from 'react-router-dom';

export function AddProjectButton() {
  return (
    <Link
      to="/create"
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/50 p-8 min-h-[200px] text-primary-600 hover:border-primary-500 hover:bg-primary-100/50 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <span className="text-4xl mb-2" aria-hidden>
        +
      </span>
      <span className="font-medium">Add Project</span>
      <span className="text-sm text-primary-500 mt-1">Upload a PDF to get started</span>
    </Link>
  );
}
