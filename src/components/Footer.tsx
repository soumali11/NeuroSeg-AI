import { Brain } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/30 py-12">
    <div className="container mx-auto flex flex-col items-center gap-4 px-6 text-center">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">
          Neuro<span className="text-gradient">Seg</span> AI
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Precision brain tumor segmentation powered by deep learning.
      </p>
      <p className="text-xs text-muted-foreground/50">
        © 2026 NeuroSeg AI · For Research Purposes Only
      </p>
    </div>
  </footer>
);

export default Footer;
