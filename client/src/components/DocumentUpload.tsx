import { useCallback, useState } from "react";

const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = "application/pdf";

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  isUploading?: boolean;
}

export function DocumentUpload({
  onUpload,
  disabled = false,
  isUploading = false,
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (file.type !== ACCEPT) return "Only PDF files are allowed.";
    if (file.size > MAX_SIZE_BYTES) return `File must be under ${MAX_SIZE_MB} MB.`;
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File | null) => {
      setError(null);
      if (!file) return;
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      onUpload(file);
    },
    [onUpload, validate]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file ?? null);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file ?? null);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <label
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition ${
          dragActive
            ? "border-primary bg-primary/10"
            : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
        } ${disabled || isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          accept={ACCEPT}
          onChange={onInputChange}
          className="sr-only"
          disabled={disabled || isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Processing document…</span>
            <span className="text-sm text-muted-foreground/80">This may take 10–30 seconds</span>
          </div>
        ) : (
          <>
            <span className="text-4xl text-primary mb-2">📄</span>
            <span className="font-medium text-foreground">Drop your PDF here or click to browse</span>
            <span className="text-sm text-muted-foreground mt-1">Max size: {MAX_SIZE_MB} MB</span>
          </>
        )}
      </label>
      {error && (
        <p
          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
