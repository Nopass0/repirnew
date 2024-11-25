import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File as FileType } from "@/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  File,
  Upload,
  Link as LinkIcon,
  Trash2,
  Download,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  FileQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  files?: FileType[];
  onNewFile?: (file: FileType) => void;
  onDeleteFile?: (id: string) => void;
  className?: string;
  maxSize?: number; // в байтах
  acceptedTypes?: string[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files = [],
  onNewFile,
  onDeleteFile,
  className,
  maxSize = 50 * 1024 * 1024, // 50MB по умолчанию
  acceptedTypes = ["*"],
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkName, setLinkName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    if (type.startsWith("audio/")) return <Music className="w-4 h-4" />;
    if (type.includes("zip") || type.includes("rar"))
      return <Archive className="w-4 h-4" />;
    if (type.includes("pdf")) return <FileText className="w-4 h-4" />;
    if (type.includes("code") || type.includes("text"))
      return <Code className="w-4 h-4" />;
    return <FileQuestion className="w-4 h-4" />;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.size > maxSize) {
        setError(
          `Файл ${file.name} превышает максимальный размер ${formatFileSize(maxSize)}`,
        );
        return;
      }

      if (
        !acceptedTypes.includes("*") &&
        !acceptedTypes.some((type) =>
          file.type.startsWith(type.replace("/*", "")),
        )
      ) {
        setError(`Файл ${file.name} имеет неподдерживаемый формат`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileType = {
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: "file",
          size: file.size,
          createdAt: new Date(),
        };
        onNewFile?.(newFile);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddLink = () => {
    if (!linkUrl) return;

    try {
      new URL(linkUrl);
      const newFile: FileType = {
        id: crypto.randomUUID(),
        name: linkName || new URL(linkUrl).hostname,
        url: linkUrl,
        type: "link",
        createdAt: new Date(),
      };
      onNewFile?.(newFile);
      setLinkUrl("");
      setLinkName("");
      setShowLinkDialog(false);
    } catch {
      setError("Некорректная ссылка");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <File className="w-4 h-4 mr-2" />
            Файлы и ссылки ({files.length})
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Файлы и ссылки</SheetTitle>
            <SheetDescription>
              Загружайте файлы или добавляйте ссылки
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Загрузить файл
              </Button>

              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Добавить ссылку
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить ссылку</DialogTitle>
                    <DialogDescription>
                      Вставьте URL и укажите название (опционально)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Название</Label>
                      <Input
                        id="name"
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        placeholder="Опционально"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowLinkDialog(false)}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleAddLink}>Добавить</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 transition-colors text-center",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/25",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                multiple
                accept={acceptedTypes.join(",")}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Перетащите файлы сюда или{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  выберите на компьютере
                </button>
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary mb-2"
                  >
                    <div className="flex items-center gap-3">
                      {file.type === "link" ? (
                        <LinkIcon className="w-4 h-4" />
                      ) : (
                        getFileIcon(file.type)
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.size ? formatFileSize(file.size) : "Ссылка"} •{" "}
                          {format(file.createdAt, "dd.MM.yyyy HH:mm", {
                            locale: ru,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {file.type === "link" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = file.url;
                            a.download = file.name;
                            a.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteFile?.(file.id)}
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FileUploader;
