import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploaderProps {
  onUpload: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({
  onUpload,
  accept = "*/*",
  multiple = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="relative flex-1">
      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? "rgb(34, 197, 94)" : "rgb(226, 232, 240)",
        }}
        className={`
          relative
          rounded-md
          border-2
          border-dashed
          transition-colors
          ${isDragging ? "bg-green-50" : "bg-transparent"}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />

        <Button variant="outline" className="w-full" onClick={handleClick}>
          <Upload className="h-4 w-4 mr-2" />
          {isDragging ? "Отпустите файлы здесь" : "Загрузить файлы"}
        </Button>
      </motion.div>
    </div>
  );
};
