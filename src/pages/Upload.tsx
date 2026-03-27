import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import Lenis from "lenis";
import MinimalNav from "@/components/MinimalNav";

const Upload_Page = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
  // 1. New State to hold the Patient ID and all 4 required files
  const [patientId, setPatientId] = useState("");
  const [files, setFiles] = useState({
    flair: null as File | null,
    t1w: null as File | null,
    t1ce: null as File | null,
    t2w: null as File | null,
  });

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleFileChange = (type: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFiles(prev => ({ ...prev, [type]: selected }));
    }
  };

  // 2. THIS IS WHERE THE SUBMIT CODE GOES!
  const handleRunAnalysis = async () => {
    // Validation check
    if (!patientId || !files.flair || !files.t1w || !files.t1ce || !files.t2w) {
      alert("⚠️ Please provide a Patient ID and upload all 4 MRI modalities.");
      return;
    }

    setIsUploading(true);

    try {
      console.log("🚀 Packaging 3D files for the AI Engine...");
      const formData = new FormData();
      formData.append("patient_id", patientId);
      formData.append("flair_file", files.flair);
      formData.append("t1w_file", files.t1w);
      formData.append("t1ce_file", files.t1ce);
      formData.append("t2w_file", files.t2w);

      // Hit the FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ AI Analysis Complete:", result.data);

      // 3. Save the real AI data to sessionStorage so the Results page can read it!
      sessionStorage.setItem("aiResult", JSON.stringify(result.data));
      
      // Navigate to the results page
      navigate("/results");

    } catch (error) {
      console.error("❌ Pipeline Failed:", error);
      alert("Could not connect to the AI Backend. Is the Python server running?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MinimalNav />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Upload</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Analyze Your <span className="text-gradient">MRI Scan</span>
            </h1>
          </div>

          <div className="space-y-6 bg-card/50 p-8 rounded-2xl border border-border backdrop-blur-sm">
            
            {/* Patient ID Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Patient ID</label>
              <input 
                type="text" 
                placeholder="e.g. PT-1004"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* 4 File Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(files) as Array<keyof typeof files>).map((modality) => (
                <div key={modality} className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/40 transition-colors bg-background/50">
                  <Upload className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-semibold uppercase">{modality} Scan</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center truncate w-full px-4">
                    {files[modality] ? files[modality]?.name : "Click to select .nii.gz"}
                  </p>
                  <input
                    type="file"
                    accept=".nii,.nii.gz"
                    onChange={(e) => handleFileChange(modality, e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* Submit Button */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleRunAnalysis}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isUploading ? "Running AI Engine..." : "Run AI Analysis"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload_Page;