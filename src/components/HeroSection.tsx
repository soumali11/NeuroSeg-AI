import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroBrain from "@/assets/hero-brain.png";
import StaggerText from "./StaggerText";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const brainY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const brainScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24"
    >
      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(180_100%_50%/0.06)_0%,transparent_70%)]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(180 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 mx-auto grid items-center gap-8 px-6 lg:grid-cols-2">
        {/* Text */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            AI-Powered Brain MRI Segmentation
          </motion.div>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            <StaggerText text="Precision" className="text-foreground" />
            <br />
            <StaggerText text="Brain Tumor" className="text-gradient" delay={0.15} />
            <br />
            <StaggerText text="Segmentation" className="text-foreground" delay={0.3} />
          </h1>

          <motion.p
            className="max-w-md text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Leverage deep learning to automatically segment and analyze brain
            MRI scans with clinical-grade accuracy.
          </motion.p>

          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={() => navigate("/upload")}
              className="group relative overflow-hidden rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_hsl(180_100%_50%/0.4)] hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Get Started</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("demo");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
            >
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Brain image with parallax */}
        <motion.div
          className="relative flex items-center justify-center"
          style={{ y: brainY, scale: brainScale }}
        >
          <div className="absolute h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <motion.img
            src={heroBrain}
            alt="AI Brain Visualization"
            width={1024}
            height={1024}
            className="relative z-10 w-full max-w-lg animate-float drop-shadow-[0_0_40px_hsl(180_100%_50%/0.3)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
