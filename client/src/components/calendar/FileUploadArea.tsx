// components/calendar/FileUploadArea.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadAreaProps {
  files: Attachment[];
  onFileAdd: (file: File) => void;
  onLinkAdd: (url: string) => void;
  onDelete: (id: string) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  files,
  onFileAdd,
  onLinkAdd,
  onDelete,
}) => {
  const [isAddingLink, setIsAddingLink] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileAdd(e.target.files[0]);
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      onLinkAdd(linkUrl);
      setLinkUrl("");
      setIsAddingLink(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Загрузить файл
        </Button>
        <Button variant="outline" onClick={() => setIsAddingLink(true)}>
          <LinkIcon className="w-4 h-4 mr-2" />
          Добавить ссылку
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <AnimatePresence>
        {isAddingLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
            />
            <Button onClick={handleLinkSubmit}>Добавить</Button>
            <Button variant="ghost" onClick={() => setIsAddingLink(false)}>
              Отмена
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea className="h-[200px] rounded-md border p-4">
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-2 bg-secondary rounded-lg"
            >
              <div className="flex items-center gap-2">
                {file.type.startsWith("link") ? (
                  <LinkIcon className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
              <div className="flex gap-2">
                {file.type.startsWith("link") ? (
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                ) : (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={file.url} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(file.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
