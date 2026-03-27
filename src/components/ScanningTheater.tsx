import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const logs = [
  "Initializing NeuroSeg AI v3.2.1...",
  "Loading U-Net backbone weights...",
  "Preprocessing FLAIR sequence...",
  "Normalizing voxel intensities...",
  "Running inference on slice 1/155...",
  "Analyzing T1-weighted contrast...",
  "Extrapolating volumetric data...",
  "Detecting tumor boundaries...",
  "Computing Dice similarity: 0.943",
  "Generating segmentation mask...",
  "Analysis complete. Urgency: HIGH",
];

const TypewriterLog = ({
  text,
  delay,
  onComplete,
}: {
  text: string;
  delay: number;
  onComplete?: () => void;
}) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        setDisplay(text.slice(0, idx + 1));
        idx++;
        if (idx >= text.length) {
          clearInterval(interval);
          onComplete?.();
        }
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay, onComplete]);

  return (
    <div className="font-mono text-xs leading-loose text-primary/80">
      <span className="text-muted-foreground">{">"}</span> {display}
      {display.length < text.length && (
        <span className="animate-pulse text-primary">▌</span>
      )}
    </div>
  );
};

interface ScanningTheaterProps {
  isScanning?: boolean;
  fileName?: string;
  onScanComplete?: () => void;
}

const ScanningTheater = ({
  isScanning = false,
  fileName,
  onScanComplete,
}: ScanningTheaterProps) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [completedLogs, setCompletedLogs] = useState(0);
  const [showSegmentation, setShowSegmentation] = useState(false);

  // Reset state when scanning starts
  useEffect(() => {
    if (isScanning) {
      setScanProgress(0);
      setCompletedLogs(0);
      setShowSegmentation(false);
    }
  }, [isScanning]);

  // Progress bar animation
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Show segmentation overlay at 60%
  useEffect(() => {
    if (scanProgress >= 60) {
      setShowSegmentation(true);
    }
  }, [scanProgress]);

  const handleLogComplete = useCallback(
    (index: number) => {
      setCompletedLogs(index + 1);
      if (index === logs.length - 1) {
        // Last log finished → signal scan complete after a short delay
        setTimeout(() => {
          onScanComplete?.();
        }, 800);
      }
    },
    [onScanComplete]
  );

  return (
    <section id="demo" className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            {isScanning ? "Processing" : "Live Demo"}
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Scanning <span className="text-gradient">Theater</span>
          </h2>
          {fileName && isScanning && (
            <p className="mt-3 text-sm text-muted-foreground">
              Analyzing: <span className="text-primary font-mono">{fileName}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Brain scan visualizer */}
          <div
            className="bento-cell flex flex-col items-center justify-center overflow-hidden p-6"
            style={{ minHeight: 360 }}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Grid background */}
              <div
                className={`absolute inset-0 ${isScanning ? "animate-grid-pulse" : "opacity-20"}`}
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(180 100% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50% / 0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: isScanning ? undefined : 0.1,
                }}
              />

              {/* Scan line - only when scanning */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}

              {/* Brain silhouette */}
              <div className="relative flex flex-col items-center gap-2">
                {/* Brain shape */}
                <div className="relative">
                  <div
                    className={`h-44 w-36 rounded-[50%_50%_45%_45%] border bg-primary/5 transition-all duration-1000 ${
                      isScanning
                        ? "border-primary/40 shadow-[inset_0_0_40px_hsl(180_100%_50%/0.15)]"
                        : "border-primary/20 shadow-[inset_0_0_20px_hsl(180_100%_50%/0.05)]"
                    }`}
                  >
                    {/* Internal brain structure lines */}
                    <div className="absolute inset-4 flex flex-col items-center justify-center gap-2 opacity-40">
                      <div className="h-px w-3/4 bg-primary/40" />
                      <div className="h-px w-1/2 bg-primary/30" />
                      <div className="h-px w-2/3 bg-primary/40" />
                      <div className="h-px w-1/3 bg-primary/30" />
                      <div className="h-px w-3/4 bg-primary/40" />
                    </div>
                  </div>

                  {/* Segmentation overlay */}
                  <AnimatePresence>
                    {showSegmentation && isScanning && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="h-12 w-14 rounded-[40%_60%_55%_45%] border-2 border-destructive/60 bg-destructive/20 shadow-[0_0_20px_hsl(0_84%_60%/0.3)]" />
                        <div className="absolute -top-2 -right-2 rounded-full border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[8px] font-mono font-bold text-destructive">
                          TUMOR
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Brain stem */}
                <div
                  className={`h-5 w-8 rounded-b-lg border border-t-0 bg-primary/5 transition-all duration-500 ${
                    isScanning ? "border-primary/40" : "border-primary/20"
                  }`}
                />
              </div>
            </div>

            {/* Progress bar */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-full max-w-xs"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-mono">Progress</span>
                  <span className="font-mono text-primary">{scanProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Idle state message */}
            {!isScanning && (
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground/60 font-mono">
                  Awaiting scan input...
                </p>
              </div>
            )}
          </div>

          {/* Terminal logs */}
          <div className="bento-cell overflow-hidden p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-accent/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                neuroseg-terminal
              </span>
              {isScanning && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary animate-pulse">
                  RUNNING
                </span>
              )}
            </div>
            <div className="space-y-1 rounded-lg bg-background/50 p-4 min-h-[240px]">
              {isScanning ? (
                logs.map((log, i) => (
                  <TypewriterLog
                    key={`${i}-${isScanning}`}
                    text={log}
                    delay={i * 800}
                    onComplete={() => handleLogComplete(i)}
                  />
                ))
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center">
                  <p className="font-mono text-xs text-muted-foreground/40">
                    {">"} Waiting for scan to begin...
                    <span className="animate-pulse text-primary">▌</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScanningTheater;
