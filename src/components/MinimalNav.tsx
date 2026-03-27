import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MinimalNav = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="fixed top-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card/60 backdrop-blur-xl text-muted-foreground transition-all duration-300 hover:text-primary hover:border-primary/40 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)] active:scale-95"
      aria-label="Go home"
    >
      <Home className="h-4 w-4" />
    </button>
  );
};

export default MinimalNav;
