import { motion, useScroll, useTransform } from "framer-motion";
import { Brain } from "lucide-react";

const Navbar = () => {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 200], [8, 20]);
  const padding = useTransform(scrollY, [0, 200], [24, 12]);
  const opacity = useTransform(scrollY, [0, 200], [0.4, 0.8]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30"
      style={{
        backdropFilter: useTransform(blur, (v) => `blur(${v}px)`),
        backgroundColor: useTransform(opacity, (v) => `hsl(0 0% 4% / ${v})`),
        paddingTop: padding,
        paddingBottom: padding,
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
            <div className="absolute inset-0 animate-sonar rounded-full border border-primary/30" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Neuro<span className="text-gradient">Seg</span> AI
          </span>
        </motion.div>

        <motion.div
          className="hidden items-center gap-8 md:flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {["About", "Features", "Upload", "Demo"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-primary"
            >
              {item}
            </a>
          ))}
          <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_hsl(180_100%_50%/0.4)]">
            Try Now
          </button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
