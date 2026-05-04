import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  onFile,
  loading,
}: {
  onFile: (file: File) => void;
  loading?: boolean;
}) {
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <motion.label
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={cn(
        "group relative flex h-72 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-all",
        drag
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]",
        loading && "pointer-events-none opacity-70",
      )}
    >
      <input
        type="file"
        className="hidden"
        accept=".pdf,.docx"
        disabled={loading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-warm shadow-glow">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-background" strokeWidth={2.5} />
        ) : (
          <Upload className="h-8 w-8 text-background" strokeWidth={2.5} />
        )}
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold">
          {loading ? "Analyzing your resume…" : "Drop your resume here"}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {loading ? "Parsing + scoring with AI" : "PDF or DOCX • Max 10MB"}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        <span>Your file stays in this session — never stored on our servers.</span>
      </div>
    </motion.label>
  );
}
