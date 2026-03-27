import { motion, AnimatePresence } from "framer-motion";

interface UrgencyScoreProps {
  visible?: boolean;
  onRescan?: () => void;
}

const UrgencyScore = ({ visible = false, onRescan }: UrgencyScoreProps) => {
  const score = 87;
  const severity = "HIGH";

  if (!visible) return null;

  return (
    <section className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Risk Assessment
          </p>
          <h2 className="mb-16 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Urgency <span className="text-gradient">Score</span>
          </h2>

          <div className="mx-auto flex max-w-md flex-col items-center gap-8">
            {/* Sonar ring */}
            <motion.div
              className="relative flex h-48 w-48 items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-primary/30 animate-sonar"
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
              ))}
              <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 glow-border">
                <motion.span
                  className="text-4xl font-bold text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {score}
                </motion.span>
                <motion.span
                  className="text-xs font-medium uppercase tracking-widest text-primary/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {severity}
                </motion.span>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
              className="grid w-full grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
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

            {/* Scan Another button */}
            {onRescan && (
              <motion.button
                onClick={onRescan}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary hover:scale-105 active:scale-95"
              >
                Scan Another Image
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UrgencyScore;
