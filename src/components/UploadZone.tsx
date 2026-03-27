import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage } from "lucide-react";
import { useState, useCallback, useRef } from "react";

interface UploadZoneProps {
  onStartAnalysis?: (file: File) => void;
}

const UploadZone = ({ onStartAnalysis }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent, entering: boolean) => {
    e.preventDefault();
    setIsDragging(entering);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleZoneClick = () => {
    if (!file) {
      inputRef.current?.click();
    }
  };

  const handleStartAnalysis = () => {
    if (file && onStartAnalysis) {
      onStartAnalysis(file);
    }
  };

  return (
    <section id="upload" className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Upload
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Analyze Your <span className="text-gradient">MRI Scan</span>
          </h2>
        </motion.div>

        <motion.div
          className="mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept=".nii,.nii.gz,.dcm,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={handleZoneClick}
            onDragEnter={(e) => handleDrag(e, true)}
            onDragOver={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            onDrop={handleDrop}
            className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-500 ${
              isDragging
                ? "liquid-border border-transparent glow-border-strong"
                : "border-border hover:border-primary/40"
            }`}
          >
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <FileImage className="h-12 w-12 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAnalysis();
                      }}
                      className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--ring)/0.4)] hover:scale-105 active:scale-95"
                    >
                      Start Analysis
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="rounded-full border border-border px-6 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      Drop your MRI scan here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or <span className="text-primary underline">click to browse</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      NIfTI, DICOM, or PNG formats · Max 500MB
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadZone;
