import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { AudioRecording } from "@/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Mic,
  StopCircle,
  Play,
  Pause,
  ChevronDown,
  Trash2,
  Download,
  Clock,
  Waveform,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  recordings: AudioRecording[];
  onRecordingComplete: (recording: AudioRecording) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  recordings,
  onRecordingComplete,
  onDelete,
  className,
}) => {
  const {
    isRecording,
    audioBlob,
    recordingTime,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [showRecordingDialog, setShowRecordingDialog] = React.useState(false);

  const handleStartRecording = async () => {
    await startRecording();
    setShowRecordingDialog(true);
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      const recording: AudioRecording = {
        id: crypto.randomUUID(),
        url: URL.createObjectURL(blob),
        name: `Запись ${format(new Date(), "dd.MM.yyyy HH:mm", { locale: ru })}`,
        date: new Date(),
        duration: recordingTime,
      };
      onRecordingComplete(recording);
    }
    setShowRecordingDialog(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (recordingId: string, url: string) => {
    if (isPlaying === recordingId) {
      audioRef.current?.pause();
      setIsPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(recordingId);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(null);
    setCurrentTime(0);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartRecording}
          disabled={isRecording}
        >
          <Mic className="w-4 h-4 mr-2" />
          Записать аудио
        </Button>

        {recordings.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                История записей
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Аудиозаписи</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recordings.map((recording) => (
                <DropdownMenuItem
                  key={recording.id}
                  className="flex-col items-stretch p-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {recording.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          handlePlayPause(recording.id, recording.url)
                        }
                      >
                        {isPlaying === recording.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => onDelete(recording.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {isPlaying === recording.id && (
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[currentTime]}
                        max={recording.duration}
                        step={0.1}
                        onValueChange={([value]) => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = value;
                          }
                        }}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {formatTime(currentTime)}
                      </span>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={showRecordingDialog} onOpenChange={setShowRecordingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Запись аудио</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              animate={{
                scale: isRecording ? [1, 1.2, 1] : 1,
                transition: {
                  repeat: isRecording ? Infinity : 0,
                  duration: 1.5,
                },
              }}
            >
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                {isRecording ? (
                  <Waveform className="w-12 h-12 text-red-500" />
                ) : (
                  <Mic className="w-12 h-12 text-red-500" />
                )}
              </div>
            </motion.div>

            <div className="text-2xl font-bold">
              {formatTime(recordingTime)}
            </div>

            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Остановить запись
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Начать запись
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        hidden
      />
    </div>
  );
};

export default AudioRecorder;
