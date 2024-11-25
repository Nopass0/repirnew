// components/calendar/MediaSection.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Upload,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Trash2,
  Search,
  Plus,
  XIcon,
} from "lucide-react";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useFileUpload } from "@/hooks/useFileUpload";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import type { AudioRecording, Attachment } from "@/types/calendar-events";
import { formatDuration } from "date-fns";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { File } from "lucide-react"; // Ensure you import File

interface MediaSectionProps {
  audioRecordings: AudioRecording[];
  attachments: Attachment[];
  onAudioAdd: (recording: AudioRecording) => void;
  onAudioDelete: (id: string) => void;
  onFileAdd: (file: Attachment) => void;
  onFileDelete: (id: string) => void;
  onLinkAdd: (url: string) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  audioRecordings,
  attachments,
  onAudioAdd,
  onAudioDelete,
  onFileAdd,
  onFileDelete,
  onLinkAdd,
}) => {
  const { isRecording, duration, startRecording, stopRecording } =
    useAudioRecording({
      onRecordingComplete: onAudioAdd,
      onError: (error) => {
        toast({
          title: "Ошибка записи",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const { isUploading, uploadProgress, handleFileUpload } = useFileUpload({
    onUploadComplete: onFileAdd,
    onError: (error) => {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleLinkSubmit = () => {
    if (linkUrl) {
      onLinkAdd(linkUrl);
      setLinkUrl("");
      setIsAddingLink(false);
    }
  };

  const filteredAttachments = attachments.filter((attachment) =>
    attachment.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 w-full">
      {/* Секция аудиозаписей */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2 w-full">
          <h3 className="text-sm font-medium">Аудиозаписи</h3>
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRecording
              ? `Запись ${formatDuration({ seconds: Math.floor(duration / 1000) })}`
              : "Записать"}
          </Button>
        </div>

        <AnimatePresence>
          {audioRecordings.map((recording) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 w-full"
            >
              <AudioPlayer
                recording={recording}
                onDelete={() => onAudioDelete(recording.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Секция файлов и ссылок */}
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? `Загрузка ${uploadProgress}%` : "Загрузить файл"}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setIsAddingLink(true)}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Добавить ссылку
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          />
        </div>

        <AnimatePresence>
          {/* Форма добавления ссылки */}
          {isAddingLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 w-full"
            >
              <div className="flex gap-2 w-full">
                <Input
                  placeholder="https://"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleLinkSubmit}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setIsAddingLink(false)}>
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Список файлов и ссылок */}
          {filteredAttachments.map((attachment) => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-2 bg-secondary rounded-lg mb-2 w-full"
            >
              <div className="flex items-center gap-2">
                {attachment.type.startsWith("link") ? (
                  <LinkIcon className="h-4 w-4" />
                ) : (
                  <File className="h-4 w-4" />
                )}
                <span className="text-sm truncate flex-grow">
                  {attachment.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {attachment.type.startsWith("link") ? (
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={attachment.url} download={attachment.name}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onFileDelete(attachment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
