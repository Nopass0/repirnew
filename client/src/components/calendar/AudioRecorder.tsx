// components/calendar/AudioRecorder.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import type { AudioRecording } from "@/types/calendar-events";

interface AudioRecorderProps {
  onRecordingComplete: (recording: AudioRecording) => void;
  onDelete: (id: string) => void;
  recordings: AudioRecording[];
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onDelete,
  recordings,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  const { startRecording, stopRecording } = useAudioRecording({
    onRecordingComplete,
    onError: (error) => {
      console.error("Recording error:", error);
    },
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!isRecording ? (
          <Button size="icon" onClick={handleStartRecording}>
            <Mic className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="destructive"
            onClick={handleStopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="flex items-center gap-2 p-2 bg-secondary rounded-md"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm flex-grow">
              {new Date(recording.timestamp).toLocaleString()}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(recording.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
