import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageError
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path The storage path (e.g., 'images/profile-pictures')
   * @param filename Optional custom filename, defaults to original filename
   */
  public async uploadFile(
    file: File,
    path: string,
    filename?: string
  ): Promise<string> {
    try {
      const storageRef = ref(
        storage,
        `${path}/${filename || file.name}`
      );
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param url The public URL of the file to delete
   */
  public async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      // Ignore 'object-not-found' errors
      if ((error as StorageError)?.code !== 'storage/object-not-found') {
        console.error('Error deleting file:', error);
        throw error;
      }
    }
  }

  /**
   * Get the download URL for a file
   * @param path The storage path to the file
   */
  public async getFileUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const storageService = StorageService.getInstance();
export default storageService;
