// components/media/AudioPlayer.tsx
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Trash2 } from "lucide-react";
import type { AudioRecording } from "@/types/calendar-events";
import { formatDuration } from "date-fns";

interface AudioPlayerProps {
  recording: AudioRecording;
  onDelete?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  recording,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSliderChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-2 bg-secondary rounded-lg">
      <audio
        ref={audioRef}
        src={recording.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <Button size="icon" variant="ghost" onClick={handlePlayPause}>
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-grow">
        <Slider
          value={[currentTime]}
          max={recording.duration}
          step={0.1}
          onValueChange={([value]) => handleSliderChange(value)}
        />
      </div>

      <span className="text-sm text-muted-foreground min-w-[4ch]">
        {formatDuration(Math.floor(currentTime))}
      </span>

      <Button size="icon" variant="ghost" onClick={handleReset}>
        <RotateCcw className="h-4 w-4" />
      </Button>

      {onDelete && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
