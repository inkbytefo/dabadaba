import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface MediaUploadProps {
  onUpload: (files: {
    url: string;
    type: string;
    fileName: string;
    fileSize: number;
    metadata?: {
      width?: number;
      height?: number;
      duration?: number;
    };
  }[]) => void;
  onCancel: () => void;
}

export const MediaUpload = ({ onUpload, onCancel }: MediaUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    // Generate previews for images and videos
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    
    setPreviews(newPreviews);
  };

  const getMediaDimensions = async (file: File): Promise<{ width?: number; height?: number; duration?: number }> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          });
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve({});
      }
    });
  };

  const uploadFile = async (file: File) => {
    const fileId = uuidv4();
    const fileExt = file.name.split('.').pop();
    const storageRef = ref(storage, `media/${fileId}.${fileExt}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const uploadResults = await Promise.all(
          selectedFiles.map(async (file) => {
            const url = await uploadFile(file);
            const dimensions = await getMediaDimensions(file);
            
            return {
              url,
              type: file.type,
              fileName: file.name,
              fileSize: file.size,
              metadata: dimensions
            };
          })
        );

        onUpload(uploadResults);
        clearSelection();
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  return (
    <div className="space-y-4 p-6 border border-white/10 rounded-3xl">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFiles.length > 0 ? (
        <>
          <Carousel className="w-full max-w-md mx-auto">
            <CarouselContent>
              {previews.map((preview, index) => (
                <CarouselItem key={index} className="h-48">
                  {selectedFiles[index].type.startsWith('image/') ? (
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <video
                      src={preview}
                      className="object-cover rounded-xl"
                      controls
                    />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="flex items-center gap-2">
            <Progress value={uploadProgress} className="flex-1 rounded-full" />
            <span className="text-sm text-gray-400">{Math.round(uploadProgress)}%</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              size="default"
              onClick={clearSelection}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="default"
              onClick={handleUpload}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </>
      ) : (
        <Button
          variant="default"
          className="w-full h-24 border-dashed rounded-xl"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 mr-2" />
          Click to upload media
        </Button>
      )}
    </div>
  );
};