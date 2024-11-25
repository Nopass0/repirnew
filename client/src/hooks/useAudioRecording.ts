// hooks/useAudioRecording.ts
import { useState, useCallback, useRef, useEffect } from "react";
import type { AudioRecording } from "@/types/calendar-events";

interface UseAudioRecordingProps {
  onRecordingComplete: (recording: AudioRecording) => void;
  onError?: (error: Error) => void;
}

export const useAudioRecording = ({
  onRecordingComplete,
  onError,
}: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);
  const durationInterval = useRef<number>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);

        onRecordingComplete({
          id: crypto.randomUUID(),
          url,
          duration,
          timestamp: new Date().toISOString(),
        });

        // Очищаем ресурсы
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      startTime.current = Date.now();
      setIsRecording(true);

      // Обновляем длительность каждую секунду
      durationInterval.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to start recording");
      setError(error);
      if (onError) onError(error);
    }
  }, [onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setDuration(0);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.stop();
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    duration,
    error,
    startRecording,
    stopRecording,
  };
};
