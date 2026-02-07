import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentUpload } from '../components/DocumentUpload';
import { createProject } from '../services/api';

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const { id } = await createProject(file);
      navigate(`/project/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Create project</h2>
      <p className="text-gray-600 mb-6">
        Upload a product document (PDF) to run Stage 1: Product Strategy & Ideation analysis.
      </p>
      <DocumentUpload
        onUpload={handleUpload}
        isUploading={isUploading}
        disabled={isUploading}
      />
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
