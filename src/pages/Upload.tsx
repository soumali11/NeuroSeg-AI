import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { toast } from 'sonner';

const Upload = () => {
  // Dropdown state
  const [patients, setPatients] = useState<string[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState("");
  
  // File upload state - CHANGED TO AN ARRAY
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load patients from backend on load
  useEffect(() => {
    async function loadPatients() {
      try {
        const patientList = await api.getPatients();
        setPatients(patientList);
      } catch (error) {
        console.error("Failed to connect to backend", error);
        toast.error("Could not connect to the AI backend.");
      } finally {
        setLoadingPatients(false);
      }
    }
    loadPatients();
  }, []);

  // Handle MULTIPLE file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert the FileList object to a standard array
      const filesArray = Array.from(e.target.files);
      
      // Filter out any non-NIfTI files just to be safe
      const validFiles = filesArray.filter(file => 
        file.name.endsWith('.nii') || file.name.endsWith('.nii.gz')
      );

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        toast.success(`Attached ${validFiles.length} MRI files`);
      } else {
        toast.error("Please upload valid .nii or .nii.gz files.");
      }
    }
  };

  // Trigger the AI Pipeline
  const handleAnalyze = async () => {
    if (!selectedPatient) {
      toast.warning("Please select a patient ID first.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.warning("Please upload the .nii or .nii.gz MRI files.");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Uploading scans and running AI inference... This may take a minute.");

    try {
      // Passing the ARRAY of files to your API
      await api.analyzeScan(selectedPatient, selectedFiles);
      toast.success("Analysis complete!");
      navigate('/results'); 
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("The AI encountered an error. Check the backend terminal.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-8 mt-10">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Analyze New Scan</h1>
          <p className="text-muted-foreground">
            Select the patient and upload the raw MRI volume to run the 3D segmentation.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
          
          {/* Step 1: Patient Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              1. Patient ID
            </label>
            {loadingPatients ? (
              <div className="animate-pulse h-10 bg-muted rounded w-full"></div>
            ) : (
              <select 
                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">-- Choose a patient --</option>
                {patients.map((patientId) => (
                  <option key={patientId} value={patientId}>
                    {patientId}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Manual File Upload Zone */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              2. Upload Scans (Select all 4 modalities)
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                selectedFiles.length > 0 ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".nii,.nii.gz"
                multiple // <--- THIS IS THE MAGIC WORD THAT ALLOWS MULTIPLE FILES
                onChange={handleFileChange}
              />
              
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    {selectedFiles.length} files selected
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {/* List out the names of the files they selected */}
                    {selectedFiles.map((file, index) => (
                      <p key={index}>{file.name}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-muted-foreground">
                  <p className="text-sm font-medium">Click to browse or drop files here</p>
                  <p className="text-xs">Supports BraTS standard NIfTI formats</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Action Button */}
          <button 
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            disabled={isAnalyzing || !selectedPatient || selectedFiles.length === 0}
          >
            {isAnalyzing ? "🧠 AI Processing... Please wait" : "Run Inference"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Upload;