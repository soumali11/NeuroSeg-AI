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
  
  // Initialize with a fallback
  const [patientName, setPatientName] = useState<string>("Guest Patient");

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

  // This function is triggered by the UploadZone
  const handleStartAnalysis = useCallback((file: File, nameFromInput?: string) => {
    setCurrentFile(file);
    
    // Logic: Use the name from the text input if it exists, 
    // otherwise strip the extension from the file name (e.g., "MRI_Scan_01.jpg" -> "MRI_Scan_01")
    const finalName = nameFromInput && nameFromInput.trim() !== "" 
      ? nameFromInput 
      : file.name.replace(/\.[^/.]+$/, ""); 

    setPatientName(finalName);
    setState("scanning");
    
    // Auto-scroll to theater
    setTimeout(() => {
      document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleScanComplete = useCallback(() => {
    setState("results");
    // Scroll to the results component
    setTimeout(() => {
      const el = document.getElementById("results-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  const handleRescan = useCallback(() => {
    setState("upload");
    setCurrentFile(null);
    setPatientName("Guest Patient");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        
        {/* Step 1: Upload */}
        {state === "upload" && (
          <UploadZone onStartAnalysis={handleStartAnalysis} />
        )}

        {/* Step 2: Scanning (Shared with results to keep theater visible) */}
        {(state === "scanning" || state === "results") && (
          <ScanningTheater
            isScanning={state === "scanning"}
            fileName={currentFile?.name}
            patientName={patientName} 
            onScanComplete={handleScanComplete}
          />
        )}

        {/* Step 3: Result Analysis */}
        <div id="results-section">
          <UrgencyScore
            visible={state === "results"}
            patientName={patientName} 
            onRescan={handleRescan}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;