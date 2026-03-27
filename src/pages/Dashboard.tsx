import { useEffect, useState, useCallback } from "react";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import ScanningTheater from "@/components/ScanningTheater";
import UrgencyScore from "@/components/UrgencyScore";
import Footer from "@/components/Footer";

type DashboardState = "upload" | "scanning" | "results";

const Dashboard = () => {
  const [state, setState] = useState<DashboardState>("upload");
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  const handleStartAnalysis = useCallback((file: File) => {
    setCurrentFile(file);
    setState("scanning");
    // Scroll to scanning theater
    setTimeout(() => {
      document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleScanComplete = useCallback(() => {
    setState("results");
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  const handleRescan = useCallback(() => {
    setState("upload");
    setCurrentFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        {state === "upload" && (
          <UploadZone onStartAnalysis={handleStartAnalysis} />
        )}

        {(state === "scanning" || state === "results") && (
          <ScanningTheater
            isScanning={state === "scanning"}
            fileName={currentFile?.name}
            onScanComplete={handleScanComplete}
          />
        )}

        <div id="results">
          <UrgencyScore
            visible={state === "results"}
            onRescan={handleRescan}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
