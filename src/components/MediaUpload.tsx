import React, { useState } from 'react';
import { Button } from './ui/button';
import { X, Upload } from 'lucide-react';

export interface MediaUploadProps {
  onClose: () => void;
  onUpload?: (file: File) => Promise<void>;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;

    try {
      setUploading(true);
      await onUpload(selectedFile);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-[#1e1e1e]/90 border border-white/10 rounded-lg backdrop-blur-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white/90">Upload Media</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/60 hover:text-white/90"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            className={`flex flex-col items-center justify-center w-full h-32 
                     border-2 border-dashed rounded-lg cursor-pointer
                     ${selectedFile 
                       ? 'border-blue-500/50 bg-blue-500/10' 
                       : 'border-white/10 hover:border-white/20 bg-white/5'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`h-8 w-8 mb-2 ${selectedFile ? 'text-blue-400' : 'text-white/40'}`} />
              <p className="text-sm text-white/60">
                {selectedFile 
                  ? selectedFile.name 
                  : 'Click to upload or drag and drop'}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/60 hover:text-white/90"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};
