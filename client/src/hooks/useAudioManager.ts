// hooks/useAudioManager.ts
import { useState } from "react";
import type { AudioRecording } from "@/types/calendar-events";

export const useAudioManager = (
  initialRecordings: AudioRecording[],
  onUpdate: (recordings: AudioRecording[]) => void,
) => {
  const [recordings, setRecordings] = useState(initialRecordings);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // Логика записи
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      // Логика остановки записи и сохранения
      const newRecording: AudioRecording = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        url: "#",
        duration: 30, // Mock duration
      };
      const updatedRecordings = [...recordings, newRecording];
      setRecordings(updatedRecordings);
      onUpdate(updatedRecordings);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  };

  const deleteRecording = (id: string) => {
    const updatedRecordings = recordings.filter((r) => r.id !== id);
    setRecordings(updatedRecordings);
    onUpdate(updatedRecordings);
  };

  return {
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    deleteRecording,
  };
};
