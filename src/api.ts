import axios from 'axios';

// Point this to your FastAPI server
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

export const api = {
    // 1. Fetch the list of patients for your dropdown
    getPatients: async (): Promise<string[]> => {
        try {
            const response = await apiClient.get('/patients');
            return response.data.patients; 
        } catch (error) {
            console.error("Error fetching patients:", error);
            throw error;
        }
    },

    // 2. Send MULTIPLE MRI files to the AI for analysis
    analyzeScan: async (patientName: string, files: File[]): Promise<any> => {
        const formData = new FormData();
        formData.append('patient_name', patientName);
        
        // Loop through the array and append every selected file
        files.forEach((file) => {
            // Note: We are appending them all under the key "files"
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