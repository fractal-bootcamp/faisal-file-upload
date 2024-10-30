import { useState } from 'react'
import axios from 'axios'
import FileUploader from './components/FileUploader'
import { SignedIn } from '@clerk/clerk-react'

const SERVER_URL = 'http://localhost:3001/api'

const App: React.FC = () => {
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
    <SignedIn>
      <FileUploader
        file={file}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        error={error}
      />
    </SignedIn>
  )
}

export default App
