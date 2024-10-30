import { useState } from 'react'
import axios from 'axios'

const SERVER_URL = 'http://localhost:3001/api'

// Main App component for file upload functionality
const App = () => {
  // State to track selected file and upload status
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate file size
  const validateFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return false;
    }
    setError(null);
    return true;
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setUploadSuccess(false);
        setError(null);
      } else {
        e.target.value = ''; // Reset input
        setFile(null);
      }
    }
  }

  // Handle file upload using axios
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${SERVER_URL}/upload`, formData, {
        headers: {
          // Allow common image file types
          //'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
      });

      if (response.status === 200) {
        // Set upload success and clear after 3 seconds
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
        setFile(null);
      }
    } catch (error: unknown) {
      // Handle Axios errors with type checking
      // Handle any error that occurs during upload
      if (error instanceof Error) {
        // Try to extract message from error response if available
        const message = (error as any).response?.data?.message;
        setError(message || error.message || 'Upload failed. Please try again.');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Image File Uploader
        </h1>

        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-500">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                  Max file size: 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${!file || uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>

          {uploadSuccess && (
            <p className="text-green-600 text-center">
              File uploaded successfully!
            </p>
          )}
          {error && (
            <p className="text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
