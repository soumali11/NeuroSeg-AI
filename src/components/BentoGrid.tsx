import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Brain, Layers, Zap, Shield, BarChart3, Clock } from "lucide-react";
import { useRef, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

interface BentoCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  index: number;
}

const BentoCard = ({ icon, title, description, className = "", index }: BentoCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouse = (e: ReactMouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`bento-cell cursor-default ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Deep Learning Segmentation",
    description: "U-Net architecture trained on 10,000+ annotated MRI scans for sub-voxel precision.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Multi-Modal Support",
    description: "Analyze T1, T2, FLAIR, and contrast-enhanced sequences simultaneously.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-Time Processing",
    description: "GPU-accelerated inference delivers results in under 30 seconds per scan.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "HIPAA Compliant",
    description: "End-to-end encryption with zero data retention policy for patient privacy.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Volumetric Analysis",
    description: "Automated tumor volume calculation and growth trend reporting.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Urgency Scoring",
    description: "AI-driven severity classification with immediate flagging of critical findings.",
  },
];

const BentoGrid = () => {
  return (
    <section id="features" className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Capabilities
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Built for <span className="text-gradient">Clinical Precision</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <BentoCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              index={i}
              className={i === 0 ? "lg:col-span-2" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
