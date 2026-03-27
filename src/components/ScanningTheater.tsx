import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

const TypewriterLog = ({ text, delay }: { text: string; delay: number }) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        setDisplay(text.slice(0, idx + 1));
        idx++;
        if (idx >= text.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <div className="font-mono text-xs leading-loose text-primary/80">
      <span className="text-muted-foreground">{">"}</span> {display}
      {display.length < text.length && <span className="animate-pulse text-primary">▌</span>}
    </div>
  );
};

const ScanningTheater = () => {
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
            Scanning <span className="text-gradient">Theater</span>
          </h2>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Brain scan visualizer */}
          <div className="bento-cell flex items-center justify-center overflow-hidden p-0" style={{ minHeight: 320 }}>
            <div className="relative h-full w-full flex items-center justify-center">
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-20 animate-grid-pulse"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(180 100% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50% / 0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Scan line */}
              <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent" />
              {/* Brain silhouette */}
              <div className="relative flex flex-col items-center gap-4">
                <div className="h-40 w-32 rounded-[50%_50%_45%_45%] border border-primary/30 bg-primary/5 shadow-[inset_0_0_30px_hsl(180_100%_50%/0.1)]" />
                <div className="h-4 w-8 rounded-b-lg border border-t-0 border-primary/30 bg-primary/5" />
              </div>
            </div>
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
            </div>
            <div className="space-y-1 rounded-lg bg-background/50 p-4">
              {logs.map((log, i) => (
                <TypewriterLog key={i} text={log} delay={i * 800} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScanningTheater;
