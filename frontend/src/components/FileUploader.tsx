interface FileUploaderProps {
    file: File | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUpload: () => void;
    uploading: boolean;
    uploadSuccess: boolean;
    error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({
    file,
    handleFileChange,
    handleUpload,
    uploading,
    uploadSuccess,
    error
}) => {
    return (
        <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
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

export default FileUploader;