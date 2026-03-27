import { useEffect } from "react";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import ScanningTheater from "@/components/ScanningTheater";
import UrgencyScore from "@/components/UrgencyScore";
import Footer from "@/components/Footer";

const Dashboard = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <UploadZone />
        <ScanningTheater />
        <UrgencyScore />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
