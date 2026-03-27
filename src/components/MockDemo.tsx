import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const logs = [
  "Initializing NeuroSeg AI v3.2.1...",
  "Loading U-Net backbone weights...",
  "Preprocessing FLAIR sequence...",
  "Normalizing voxel intensities...",
  "Running inference on slice 1/155...",
  "Detecting tumor boundaries...",
  "Computing Dice similarity: 0.943",
  "Generating segmentation mask...",
  "Analysis complete. Urgency: HIGH",
];

type Phase = "scanning" | "results" | "idle";

const MockDemo = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  // Start loop on mount and repeat
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setPhase("scanning");
    }, 800);
    return () => clearTimeout(startDelay);
  }, [loopKey]);

  // Progress bar during scanning
  useEffect(() => {
    if (phase !== "scanning") return;
    setScanProgress(0);
    setShowSegmentation(false);
    setVisibleLogs(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, loopKey]);

  // Show segmentation at 55%
  useEffect(() => {
    if (scanProgress >= 55) setShowSegmentation(true);
  }, [scanProgress]);

  // Typewriter log progression
  useEffect(() => {
    if (phase !== "scanning") return;
    const timers = logs.map((_, i) =>
      setTimeout(() => setVisibleLogs(i + 1), i * 700 + 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, loopKey]);

  // Transition to results when scan finishes
  useEffect(() => {
    if (scanProgress >= 100 && phase === "scanning") {
      const t = setTimeout(() => setPhase("results"), 600);
      return () => clearTimeout(t);
    }
  }, [scanProgress, phase]);

  // Loop: after results shown for 4s, restart
  useEffect(() => {
    if (phase !== "results") return;
    const t = setTimeout(() => {
      setPhase("idle");
      setScanProgress(0);
      setShowSegmentation(false);
      setVisibleLogs(0);
      setLoopKey((k) => k + 1);
    }, 4500);
    return () => clearTimeout(t);
  }, [phase]);

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
            Live Demo
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            See It In <span className="text-gradient">Action</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            Watch how NeuroSeg AI processes an MRI scan in real-time — fully automated preview.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Brain scan visualizer */}
          <div className="bento-cell flex flex-col items-center justify-center overflow-hidden p-6" style={{ minHeight: 360 }}>
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Grid background */}
              <div
                className={`absolute inset-0 ${phase === "scanning" ? "animate-grid-pulse" : "opacity-20"}`}
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: phase === "scanning" ? undefined : 0.1,
                }}
              />

              {/* Scan line */}
              {phase === "scanning" && (
                <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}

              {/* Brain silhouette */}
              <div className="relative flex flex-col items-center gap-2">
                <div className="relative">
                  <div
                    className={`h-44 w-36 rounded-[50%_50%_45%_45%] border bg-primary/5 transition-all duration-1000 ${
                      phase === "scanning"
                        ? "border-primary/40 shadow-[inset_0_0_40px_hsl(var(--primary)/0.15)]"
                        : "border-primary/20 shadow-[inset_0_0_20px_hsl(var(--primary)/0.05)]"
                    }`}
                  >
                    <div className="absolute inset-4 flex flex-col items-center justify-center gap-2 opacity-40">
                      <div className="h-px w-3/4 bg-primary/40" />
                      <div className="h-px w-1/2 bg-primary/30" />
                      <div className="h-px w-2/3 bg-primary/40" />
                      <div className="h-px w-1/3 bg-primary/30" />
                      <div className="h-px w-3/4 bg-primary/40" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {showSegmentation && (phase === "scanning" || phase === "results") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="h-12 w-14 rounded-[40%_60%_55%_45%] border-2 border-destructive/60 bg-destructive/20 shadow-[0_0_20px_hsl(var(--destructive)/0.3)]" />
                        <div className="absolute -top-2 -right-2 rounded-full border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[8px] font-mono font-bold text-destructive">
                          TUMOR
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className={`h-5 w-8 rounded-b-lg border border-t-0 bg-primary/5 transition-all duration-500 ${
                  phase === "scanning" ? "border-primary/40" : "border-primary/20"
                }`} />
              </div>

              {/* Mock results overlay */}
              <AnimatePresence>
                {phase === "results" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6 }}
                    className="absolute bottom-4 left-4 right-4"
                  >
                    <div className="flex items-center justify-between rounded-xl bg-card/80 backdrop-blur-lg border border-border/50 p-4">
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-primary">87</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Urgency</p>
                      </div>
                      <div className="h-8 w-px bg-border/50" />
                      <div className="text-center flex-1">
                        <p className="text-sm font-bold text-foreground">12.4 cm³</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Volume</p>
                      </div>
                      <div className="h-8 w-px bg-border/50" />
                      <div className="text-center flex-1">
                        <p className="text-sm font-bold text-destructive">HIGH</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Severity</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            {phase === "scanning" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-w-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-mono">Progress</span>
                  <span className="font-mono text-primary">{Math.min(100, Math.round(scanProgress))}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, scanProgress)}%` }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Terminal logs */}
          <div className="bento-cell overflow-hidden p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-accent/60" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">neuroseg-terminal</span>
              {phase === "scanning" && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary animate-pulse">
                  RUNNING
                </span>
              )}
              {phase === "results" && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">
                  COMPLETE
                </span>
              )}
            </div>
            <div className="space-y-1 rounded-lg bg-background/50 p-4 min-h-[240px]">
              {phase === "idle" ? (
                <div className="flex h-full min-h-[220px] items-center justify-center">
                  <p className="font-mono text-xs text-muted-foreground/40">
                    {">"} Initializing demo...
                    <span className="animate-pulse text-primary">▌</span>
                  </p>
                </div>
              ) : (
                logs.slice(0, visibleLogs).map((log, i) => (
                  <motion.div
                    key={`${loopKey}-${i}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-xs leading-loose text-primary/80"
                  >
                    <span className="text-muted-foreground">{">"}</span> {log}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MockDemo;
