// hooks/useFileUpload.ts
import { useState, useCallback } from "react";
import type { Attachment } from "@/types/calendar-events";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

interface UseFileUploadProps {
  onUploadComplete: (file: Attachment) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = ({
  onUploadComplete,
  onError,
}: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Файл слишком большой (максимум 50MB)");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Неподдерживаемый тип файла");
    }
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        validateFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        // Имитируем загрузку файла
        await new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

        const attachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size,
          timestamp: new Date().toISOString(),
        };

        onUploadComplete(attachment);
        setIsUploading(false);
        setUploadProgress(0);
      } catch (err) {
        setIsUploading(false);
        setUploadProgress(0);
        const error =
          err instanceof Error ? err : new Error("Ошибка загрузки файла");
        if (onError) onError(error);
      }
    },
    [onUploadComplete, onError, validateFile],
  );

  return {
    isUploading,
    uploadProgress,
    handleFileUpload,
  };
};
