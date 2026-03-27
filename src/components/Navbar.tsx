import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 200], [8, 20]);
  const padding = useTransform(scrollY, [0, 200], [24, 12]);
  const opacity = useTransform(scrollY, [0, 200], [0.4, 0.8]);

  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [isDark]);

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Home", action: () => scrollToTop() },
    { label: "Features", action: () => scrollToSection("features") },
    { label: "Demo", action: () => scrollToSection("demo") },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30"
      style={{
        backdropFilter: useTransform(blur, (v) => `blur(${v}px)`),
        backgroundColor: useTransform(opacity, (v) => `hsl(var(--background) / ${v})`),
        paddingTop: padding,
        paddingBottom: padding,
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={scrollToTop}
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
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-primary bg-transparent border-none cursor-pointer"
            >
              {item.label}
            </button>
          ))}

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-full p-2 text-muted-foreground transition-colors duration-300 hover:text-primary bg-transparent border-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Get Started button */}
          <button
            onClick={() => navigate("/upload")}
            className="rounded-full bg-primary px-6 py-2.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-95"
          >
            Get Started
          </button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
