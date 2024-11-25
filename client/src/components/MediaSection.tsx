import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Mic,
  File,
  Link2,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useStudent } from "@/hooks/useStudent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Media } from "@/types";

const AudioRecorder = ({ onSave }: { onSave: (blob: Blob) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onSave(blob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isRecording ? stopRecording : startRecording}
      className={`relative ${isRecording ? "bg-red-50 hover:bg-red-100" : ""}`}
    >
      <Mic className={`h-4 w-4 mr-2 ${isRecording ? "text-red-500" : ""}`} />
      {isRecording ? "Остановить запись" : "Записать аудио"}
      {isRecording && (
        <motion.div
          className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </Button>
  );
};

const AudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={togglePlay}>
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

const MediaItem = ({
  item,
  onDelete,
}: {
  item: Media;
  onDelete: (id: string) => void;
}) => {
  const getIcon = () => {
    switch (item.type) {
      case "audio":
        return <Mic className="h-4 w-4 text-blue-500" />;
      case "file":
        return <File className="h-4 w-4 text-green-500" />;
      case "link":
        return <Link2 className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group"
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="font-medium truncate max-w-[200px]">{item.name}</span>
        {item.size && (
          <span className="text-sm text-muted-foreground">
            ({Math.round(item.size / 1024)}KB)
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.type === "audio" && <AudioPlayer url={item.url} />}

        {item.type === "file" && (
          <Button variant="ghost" size="icon" asChild>
            <a href={item.url} download={item.name}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}

        {item.type === "link" && (
          <Button variant="ghost" size="icon" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </motion.div>
  );
};

export const MediaSection = () => {
  const { student, addMedia, removeMedia } = useStudent();
  const [filterType, setFilterType] = useState<"all" | Media["type"]>("all");
  const [linkInput, setLinkInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia =
    student?.media.filter(
      (item) => filterType === "all" || item.type === filterType,
    ) || [];

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const isAudio = file.type.startsWith("audio/");
      const newMedia: Media = {
        id: Math.random().toString(36).substr(2, 9),
        type: isAudio ? "audio" : "file",
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
      };
      addMedia(newMedia);
    });
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      const newMedia: Media = {
        id: Math.random().toString(36).substr(2, 9),
        type: "link",
        name: linkInput,
        url: linkInput.startsWith("http") ? linkInput : `https://${linkInput}`,
      };
      addMedia(newMedia);
      setLinkInput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Файлы и ссылки</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {filterType === "all"
                ? "Все"
                : filterType === "audio"
                  ? "Аудио"
                  : filterType === "file"
                    ? "Файлы"
                    : "Ссылки"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={filterType}
              onValueChange={setFilterType as any}
            >
              <DropdownMenuRadioItem value="all">Все</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="audio">Аудио</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="file">Файлы</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="link">Ссылки</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Загрузить файлы
        </Button>
        <AudioRecorder
          onSave={(blob) => {
            const newMedia: Media = {
              id: Math.random().toString(36).substr(2, 9),
              type: "audio",
              name: `Запись ${new Date().toLocaleString()}`,
              url: URL.createObjectURL(blob),
              size: blob.size,
              mimeType: blob.type,
            };
            addMedia(newMedia);
          }}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Input
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          placeholder="Добавить ссылку"
          onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
        />
        <Button onClick={handleAddLink}>Добавить</Button>
      </div>

      <AnimatePresence>
        {filteredMedia.map((item) => (
          <MediaItem key={item.id} item={item} onDelete={removeMedia} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MediaSection;
