import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    } else if (mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        className={cn("relative", isRecording && "animate-pulse")}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2"
          >
            <Button variant="ghost" size="sm" onClick={togglePause}>
              {isPaused ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-sm font-medium">
                  {formatDuration(recordingDuration)}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioRecorder;
