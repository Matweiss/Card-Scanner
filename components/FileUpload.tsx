import React, { useRef, useState, useEffect } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { PdfIcon } from './icons/PdfIcon';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    file: File | null;
    filePreviewUrl: string | null;
    isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onFileSelect, 
    file, 
    filePreviewUrl, 
    isLoading, 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleOpenCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setStream(mediaStream);
                setIsCameraOpen(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please ensure permission is granted and your device has a camera.");
            }
        } else {
            alert("Your browser does not support camera access.");
        }
    };

    const handleCloseCamera = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsCameraOpen(false);
    };

    const handleSnapPhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "business_card.png", { type: "image/png" });
                        onFileSelect(file);
                        handleCloseCamera();
                    }
                }, 'image/png');
            }
        }
    };

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="space-y-6">
            {isCameraOpen ? (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Live Camera
                    </label>
                    <div className="space-y-4">
                        <div className="relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg border-2 border-gray-300" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex justify-center items-center gap-4">
                            <button
                                type="button"
                                onClick={handleSnapPhoto}
                                className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Snap Photo
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseCamera}
                                className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <label htmlFor="card-image" className="block text-sm font-medium text-gray-700">
                        Business Card File
                    </label>
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-indigo-500' : 'border-gray-300'} border-dashed rounded-md h-64 bg-gray-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
                    >
                        {filePreviewUrl ? (
                             file && file.type.startsWith('image/') ? (
                                <img src={filePreviewUrl} alt="Business card preview" className="max-h-full max-w-full object-contain" />
                            ) : (
                                 <div className="space-y-1 text-center">
                                    <PdfIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm font-medium text-gray-900">{file?.name}</p>
                                    <p className="text-xs text-gray-500">PDF Document</p>
                                </div>
                            )
                        ) : (
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                    >
                                        Upload a file
                                    </button>
                                    <input id="card-image" name="card-image" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" disabled={isLoading} />
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            </div>
                        )}
                    </div>
                     <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">OR</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            aria-label="Use camera to take a photo"
                            disabled={isLoading}
                        >
                            <CameraIcon className="w-5 h-5 mr-2" />
                            Use Camera
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};