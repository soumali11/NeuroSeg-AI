import { useEffect, useState } from 'react';
import { api } from '@/api';
import { toast } from 'sonner'; // Using your app's built-in toast notifications!

const Upload = () => {
  const [patients, setPatients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState("");

  // Fetch the patients from the Python backend when the page loads
  useEffect(() => {
    async function loadPatients() {
      try {
        const patientList = await api.getPatients();
        setPatients(patientList);
      } catch (error) {
        console.error("Failed to connect to backend", error);
        toast.error("Could not connect to the AI backend.");
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  const handleAnalyze = () => {
    if (!selectedPatient) {
      toast.warning("Please select a patient first.");
      return;
    }
    toast.info(`Starting analysis for ${selectedPatient}...`);
    // We will wire up the actual analysis call next!
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-8 mt-10">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Select Scan</h1>
          <p className="text-muted-foreground">
            Choose a patient from your local BraTS database to run the 3D segmentation.
          </p>
        </div>

        {/* The Dropdown Menu Box */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Patient Directory
            </label>
            
            {loading ? (
              <div className="animate-pulse h-10 bg-muted rounded w-full"></div>
            ) : (
              <select 
                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">-- Select a patient --</option>
                {patients.map((patientId) => (
                  <option key={patientId} value={patientId}>
                    {patientId}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            disabled={loading || !selectedPatient}
          >
            {loading ? "Connecting to Backend..." : "Run AI Analysis"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Upload;