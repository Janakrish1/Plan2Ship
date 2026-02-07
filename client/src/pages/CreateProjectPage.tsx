import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentUpload } from "../components/DocumentUpload";
import { createProject } from "../services/api";

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
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Create project</h1>
        <p className="text-muted-foreground">
          Upload a product document (PDF) to run Stage 1: Product Strategy & Ideation analysis.
        </p>
      </div>
      <div className="glass-panel rounded-2xl p-8">
        <DocumentUpload
          onUpload={handleUpload}
          isUploading={isUploading}
          disabled={isUploading}
        />
      </div>
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
