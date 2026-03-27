import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage } from "lucide-react";
import Lenis from "lenis";
import MinimalNav from "@/components/MinimalNav";

const Upload_Page = () => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleFile = useCallback((file: File) => {
    // Store file info and navigate to results
    sessionStorage.setItem("scanFile", JSON.stringify({ name: file.name, size: file.size }));
    navigate("/results");
  }, [navigate]);

  const handleDrag = useCallback((e: React.DragEvent, entering: boolean) => {
    e.preventDefault();
    setIsDragging(entering);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MinimalNav />
      <div className="flex flex-1 items-center justify-center px-6">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Upload</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Analyze Your <span className="text-gradient">MRI Scan</span>
            </h1>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".nii,.nii.gz,.dcm,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => handleDrag(e, true)}
            onDragOver={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            onDrop={handleDrop}
            className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-500 ${
              isDragging
                ? "liquid-border border-transparent glow-border-strong"
                : "border-border hover:border-primary/40"
            }`}
          >
            <motion.div
              className="flex flex-col items-center gap-5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="rounded-full bg-primary/10 p-5">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Drop your MRI scan here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or <span className="text-primary underline">click to browse</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  NIfTI, DICOM, or PNG formats · Max 500MB
                </p>
              </div>
            </motion.div>
          </div>

          {/* Browse Files button */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-95"
            >
              Browse Files
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload_Page;
