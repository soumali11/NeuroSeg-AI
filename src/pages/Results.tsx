import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import MinimalNav from "@/components/MinimalNav";
import { api } from "../api"; // Import the API fix we made

type Phase = "scanning" | "results";

const Results = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [scanProgress, setScanProgress] = useState(0);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [runKey, setRunKey] = useState(0);
  
  // NEW STATE: To hold the unique patient data
  const [patientData, setPatientData] = useState<any>(null);
  const [dynamicLogs, setDynamicLogs] = useState<string[]>([]);

  // 1. GET PATIENT NAME FROM URL
  const params = new URLSearchParams(window.location.search);
  const patientName = params.get('name') || "Unknown Patient";

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // 2. FETCH UNIQUE DATA WHEN COMPONENT LOADS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getPatientResults(patientName);
        setPatientData(data);
        // Set unique logs based on the results
        setDynamicLogs([
          `Initializing NeuroSeg AI for ${patientName}...`,
          "Loading U-Net backbone weights...",
          `Analyzing sequence: ${data.scanType || 'FLAIR'}`,
          "Normalizing voxel intensities...",
          `Detecting boundaries: ${data.status || 'Processing'}`,
          `Computing Dice similarity: ${data.confidence || '0.94'}`,
          "Analysis complete.",
        ]);
      } catch (err) {
        console.error("Failed to fetch unique patient data");
      }
    };
    fetchData();
  }, [patientName, runKey]);

  // Reset and run scanning
  useEffect(() => {
    setPhase("scanning");
    setScanProgress(0);
    setShowSegmentation(false);
    setVisibleLogs(0);
  }, [runKey]);

  // Progress logic
  useEffect(() => {
    if (phase !== "scanning") return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1.5; // Slightly faster for demo
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, runKey]);

  useEffect(() => {
    if (scanProgress >= 60) setShowSegmentation(true);
  }, [scanProgress]);

  // Log progression using dynamic logs
  useEffect(() => {
    if (phase !== "scanning" || dynamicLogs.length === 0) return;
    const timers = dynamicLogs.map((_, i) =>
      setTimeout(() => setVisibleLogs(i + 1), i * 600 + 200)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, runKey, dynamicLogs]);

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
    navigate("/upload");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <MinimalNav />
      <div className="pt-20 pb-32">
        <div className="container mx-auto px-6 mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            {phase === "scanning" ? "Processing" : "Results"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Scanning <span className="text-gradient">Theater</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Analyzing: <span className="text-primary font-mono">{patientName}</span>
          </p>
        </div>

        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            <div className="bento-cell flex flex-col items-center justify-center overflow-hidden p-6" style={{ minHeight: 360 }}>
              <div className="relative flex h-full w-full items-center justify-center">
                <div className={`absolute inset-0 ${phase === "scanning" ? "animate-grid-pulse" : "opacity-20"}`}
                  style={{ backgroundImage: "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                {phase === "scanning" && <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />}
                
                <div className="relative flex flex-col items-center gap-2">
                   {/* Brain visualizer stays the same, but the "TUMOR" badge can be conditional */}
                   <div className={`h-44 w-36 rounded-[50%_50%_45%_45%] border bg-primary/5 transition-all duration-1000 ${phase === "scanning" ? "border-primary/40 shadow-[inset_0_0_40px_hsl(var(--primary)/0.15)]" : "border-primary/20"}`}>
                      <div className="absolute inset-4 flex flex-col items-center justify-center gap-2 opacity-40">
                         {[...Array(5)].map((_, i) => <div key={i} className="h-px w-3/4 bg-primary/40" />)}
                      </div>
                   </div>
                   <AnimatePresence>
                      {showSegmentation && patientData?.hasTumor !== false && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
                          <div className="h-12 w-14 rounded-[40%_60%_55%_45%] border-2 border-destructive/60 bg-destructive/20 shadow-[0_0_20px_hsl(var(--destructive)/0.3)]" />
                          <div className="absolute -top-2 -right-2 rounded-full border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[8px] font-mono font-bold text-destructive">TUMOR</div>
                        </motion.div>
                      )}
                   </AnimatePresence>
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

            <div className="bento-cell overflow-hidden p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" /><div className="h-3 w-3 rounded-full bg-accent/60" /><div className="h-3 w-3 rounded-full bg-primary/60" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">neuroseg-terminal</span>
              </div>
              <div className="space-y-1 rounded-lg bg-background/50 p-4 min-h-[240px]">
                {dynamicLogs.slice(0, visibleLogs).map((log, i) => (
                  <motion.div key={`${runKey}-${i}`} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-xs leading-loose text-primary/80">
                    <span className="text-muted-foreground">{">"}</span> {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {phase === "results" && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-6 mt-16">
              <div className="mx-auto max-w-3xl">
                <div className="mb-10 text-center">
                  <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Risk Assessment</p>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Urgency <span className="text-gradient">Score</span>
                  </h2>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <motion.div className="relative flex h-48 w-48 items-center justify-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="absolute inset-0 rounded-full border-2 border-primary/30 animate-sonar" style={{ animationDelay: `${i * 0.6}s` }} />
                    ))}
                    <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 glow-border">
                      <span className="text-4xl font-bold text-primary">
                        {patientData ? patientData.urgency_score : "—"}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-widest text-primary/70">
                        {patientData ? "urgency" : "loading"}
                      </span>
                    </div>
                  </motion.div>

                  <div className="grid w-full max-w-md grid-cols-3 gap-4">
                    {[
                      { label: "Tumor Volume", value: patientData ? `${patientData.whole_tumor_volume} cm³` : "—" },
                      { label: "Core Volume",  value: patientData ? `${patientData.tumor_core_volume} cm³` : "—" },
                      { label: "Enhancing",    value: patientData ? `${patientData.enhancing_tumor_volume} cm³` : "—" },
                    ].map((m) => (
                      <div key={m.label} className="bento-cell text-center p-2">
                        <p className="text-sm font-bold text-foreground">{m.value}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground uppercase">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleRescan} className="rounded-full border border-border px-8 py-3 font-semibold text-foreground">Rescan</button>
                    <button onClick={handleScanAnother} className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground">Scan Another</button>
                  </div>
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