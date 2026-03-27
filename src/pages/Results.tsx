import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import MinimalNav from "@/components/MinimalNav";

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

type Phase = "scanning" | "results";

const Results = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [scanProgress, setScanProgress] = useState(0);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const fileName = (() => {
    try {
      const data = sessionStorage.getItem("scanFile");
      return data ? JSON.parse(data).name : "scan.nii.gz";
    } catch { return "scan.nii.gz"; }
  })();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Reset and run scanning
  useEffect(() => {
    setPhase("scanning");
    setScanProgress(0);
    setShowSegmentation(false);
    setVisibleLogs(0);
  }, [runKey]);

  // Progress
  useEffect(() => {
    if (phase !== "scanning") return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1.2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, runKey]);

  // Segmentation at 60%
  useEffect(() => {
    if (scanProgress >= 60) setShowSegmentation(true);
  }, [scanProgress]);

  // Log progression
  useEffect(() => {
    if (phase !== "scanning") return;
    const timers = logs.map((_, i) =>
      setTimeout(() => setVisibleLogs(i + 1), i * 700 + 200)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, runKey]);

  // Transition to results
  useEffect(() => {
    if (scanProgress >= 100 && phase === "scanning") {
      const t = setTimeout(() => setPhase("results"), 800);
      return () => clearTimeout(t);
    }
  }, [scanProgress, phase]);

  const handleRescan = useCallback(() => {
    setRunKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleScanAnother = useCallback(() => {
    sessionStorage.removeItem("scanFile");
    navigate("/upload");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <MinimalNav />
      <div className="pt-20 pb-32">
        {/* Header */}
        <div className="container mx-auto px-6 mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            {phase === "scanning" ? "Processing" : "Results"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Scanning <span className="text-gradient">Theater</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Analyzing: <span className="text-primary font-mono">{fileName}</span>
          </p>
        </div>

        {/* Scanning Theater */}
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            {/* Brain scan visualizer */}
            <div className="bento-cell flex flex-col items-center justify-center overflow-hidden p-6" style={{ minHeight: 360 }}>
              <div className="relative flex h-full w-full items-center justify-center">
                <div
                  className={`absolute inset-0 ${phase === "scanning" ? "animate-grid-pulse" : "opacity-20"}`}
                  style={{
                    backgroundImage: "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    opacity: phase === "scanning" ? undefined : 0.1,
                  }}
                />

                {phase === "scanning" && (
                  <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}

                <div className="relative flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className={`h-44 w-36 rounded-[50%_50%_45%_45%] border bg-primary/5 transition-all duration-1000 ${
                      phase === "scanning" ? "border-primary/40 shadow-[inset_0_0_40px_hsl(var(--primary)/0.15)]" : "border-primary/20"
                    }`}>
                      <div className="absolute inset-4 flex flex-col items-center justify-center gap-2 opacity-40">
                        <div className="h-px w-3/4 bg-primary/40" />
                        <div className="h-px w-1/2 bg-primary/30" />
                        <div className="h-px w-2/3 bg-primary/40" />
                        <div className="h-px w-1/3 bg-primary/30" />
                        <div className="h-px w-3/4 bg-primary/40" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {showSegmentation && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8 }}
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
              </div>

              {phase === "scanning" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full max-w-xs">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-mono">Progress</span>
                    <span className="font-mono text-primary">{Math.min(100, Math.round(scanProgress))}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all duration-100" style={{ width: `${Math.min(100, scanProgress)}%` }} />
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
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary animate-pulse">RUNNING</span>
                )}
                {phase === "results" && (
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">COMPLETE</span>
                )}
              </div>
              <div className="space-y-1 rounded-lg bg-background/50 p-4 min-h-[240px]">
                {logs.slice(0, visibleLogs).map((log, i) => (
                  <motion.div
                    key={`${runKey}-${i}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-xs leading-loose text-primary/80"
                  >
                    <span className="text-muted-foreground">{">"}</span> {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {phase === "results" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="container mx-auto px-6 mt-16"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-10 text-center">
                  <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Risk Assessment</p>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Urgency <span className="text-gradient">Score</span>
                  </h2>
                </div>

                {/* Score + Metrics */}
                <div className="flex flex-col items-center gap-8">
                  {/* Sonar ring */}
                  <motion.div
                    className="relative flex h-48 w-48 items-center justify-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="absolute inset-0 rounded-full border-2 border-primary/30 animate-sonar" style={{ animationDelay: `${i * 0.6}s` }} />
                    ))}
                    <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 glow-border">
                      <motion.span className="text-4xl font-bold text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        87
                      </motion.span>
                      <motion.span className="text-xs font-medium uppercase tracking-widest text-primary/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                        HIGH
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Metric cards */}
                  <motion.div
                    className="grid w-full max-w-md grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {[
                      { label: "Tumor Volume", value: "12.4 cm³" },
                      { label: "Growth Rate", value: "+2.1%/mo" },
                      { label: "Confidence", value: "94.3%" },
                    ].map((m) => (
                      <div key={m.label} className="bento-cell text-center">
                        <p className="text-xl font-bold text-foreground">{m.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <button
                      onClick={handleRescan}
                      className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary hover:scale-105 active:scale-95"
                    >
                      Rescan
                    </button>
                    <button
                      onClick={handleScanAnother}
                      className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-95"
                    >
                      Scan Another Image
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Results;
