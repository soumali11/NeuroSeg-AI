import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

export const api = {
    // 1. Fetch the list of patients
    getPatients: async (): Promise<string[]> => {
        try {
            const response = await apiClient.get('/patients');
            return response.data.patients; 
        } catch (error) {
            console.error("Error fetching patients:", error);
            throw error;
        }
    },

    // 2. NEW: Fetch SPECIFIC results for one patient (The Fix)
    getPatientResults: async (patientName: string): Promise<any> => {
        try {
            // This tells the backend: "Give me the data ONLY for this name"
            const response = await apiClient.get(`/results/${patientName}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching specific results:", error);
            throw error;
        }
    },

    // 3. Send MRI files to the AI
    analyzeScan: async (patientName: string, files: File[]): Promise<any> => {
        const formData = new FormData();
        formData.append('patient_name', patientName);
        
        files.forEach((file) => {
            formData.append('files', file); 
        });

        try {
            const response = await apiClient.post('/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error analyzing scan:", error);
            throw error;
        }
    }
};