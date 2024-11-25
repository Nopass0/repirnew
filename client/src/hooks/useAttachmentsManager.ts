// hooks/useAttachmentsManager.ts
import { useState } from "react";
import type { Attachment } from "@/types/calendar-events";

export const useAttachmentsManager = (
  initialAttachments: Attachment[],
  onUpdate: (attachments: Attachment[]) => void,
) => {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      // Имитация загрузки
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
        timestamp: new Date().toISOString(),
      };

      const updatedAttachments = [...attachments, newAttachment];
      setAttachments(updatedAttachments);
      onUpdate(updatedAttachments);
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const addLink = (url: string) => {
    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      name: url,
      type: "link",
      url,
      size: 0,
      timestamp: new Date().toISOString(),
    };

    const updatedAttachments = [...attachments, newAttachment];
    setAttachments(updatedAttachments);
    onUpdate(updatedAttachments);
  };

  const deleteAttachment = (id: string) => {
    const updatedAttachments = attachments.filter((a) => a.id !== id);
    setAttachments(updatedAttachments);
    onUpdate(updatedAttachments);
  };

  return {
    attachments,
    isUploading,
    uploadFile,
    addLink,
    deleteAttachment,
  };
};
