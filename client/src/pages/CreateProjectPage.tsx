import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.div
      className="max-w-2xl mx-auto space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-display font-bold text-white mb-1">Create project</h1>
        <p className="text-muted-foreground text-sm">
          Upload a product document (PDF) to run Stage 1: Product Strategy & Ideation analysis.
        </p>
      </motion.div>
      <motion.div
        className="glass-panel rounded-xl p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <DocumentUpload
          onUpload={handleUpload}
          isUploading={isUploading}
          disabled={isUploading}
        />
      </motion.div>
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}
