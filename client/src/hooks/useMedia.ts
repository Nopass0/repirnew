import { useState, useCallback } from "react";
import { type StorageItem } from "@/types/student";

interface UseMediaReturn {
  files: StorageItem[];
  addFile: (file: File) => Promise<void>;
  addLink: (url: string) => void;
  addAudio: (audioBlob: Blob) => Promise<void>;
  removeItem: (id: string) => void;
  sortBy: "name" | "type";
  setSortBy: (sort: "name" | "type") => void;
}

export const useMedia = (initialFiles: StorageItem[] = []): UseMediaReturn => {
  const [files, setFiles] = useState<StorageItem[]>(initialFiles);
  const [sortBy, setSortBy] = useState<"name" | "type">("name");

  const addFile = useCallback(async (file: File) => {
    const reader = new FileReader();

    try {
      const result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const newFile: StorageItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: "file",
        mimeType: file.type,
        size: file.size,
        url: result,
        createdAt: new Date().toISOString(),
      };

      setFiles((prev) => [...prev, newFile]);
    } catch (error) {
      console.error("Error adding file:", error);
      throw error;
    }
  }, []);

  const addLink = useCallback((url: string) => {
    try {
      const newLink: StorageItem = {
        id: crypto.randomUUID(),
        name: new URL(url).hostname,
        type: "link",
        url: url,
        createdAt: new Date().toISOString(),
      };
      setFiles((prev) => [...prev, newLink]);
    } catch (error) {
      console.error("Error adding link:", error);
      throw error;
    }
  }, []);

  const addAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(audioBlob);
      });

      const newAudio: StorageItem = {
        id: crypto.randomUUID(),
        name: `Запись ${new Date().toLocaleString()}`,
        type: "audio",
        mimeType: audioBlob.type,
        size: audioBlob.size,
        url: result,
        createdAt: new Date().toISOString(),
      };

      setFiles((prev) => [...prev, newAudio]);
    } catch (error) {
      console.error("Error adding audio:", error);
      throw error;
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  return {
    files,
    addFile,
    addLink,
    addAudio,
    removeItem,
    sortBy,
    setSortBy,
  };
};

export default useMedia;
