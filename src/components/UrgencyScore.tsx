import { motion } from "framer-motion";

const UrgencyScore = () => {
  const score = 87;
  const severity = "HIGH";

  return (
    <section className="relative py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
            <div className="relative flex h-48 w-48 items-center justify-center">
              {/* Sonar waves */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-primary/30 animate-sonar"
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
              ))}
              {/* Core circle */}
              <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 glow-border">
                <span className="text-4xl font-bold text-primary">{score}</span>
                <span className="text-xs font-medium uppercase tracking-widest text-primary/70">
                  {severity}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid w-full grid-cols-3 gap-4">
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UrgencyScore;
