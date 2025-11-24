// src/components/Input/ChatInput.tsx
import React, { useRef } from "react";
import type { UploadedFile } from "../../types";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  files: UploadedFile[];
  setFiles: (files: UploadedFile[]) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  loading,
  onSendMessage,
  files,
  setFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles: UploadedFile[] = Array.from(selectedFiles).map(
        (file) => ({
          id: Date.now().toString() + file.name,
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
        })
      );
      setFiles([...files, ...newFiles]);
    }
    // Clear the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  return (
    <form onSubmit={onSendMessage} className="chat-input">
      {/* File Upload Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden-file-input"
        disabled={loading}
      />

      {/* Attachment Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="attachment-button"
        aria-label="Attach File"
      >
        📎
      </button>

      {/* Attached Files Preview */}
      {files.length > 0 && (
        <div className="attached-files-preview">
          {files.map((file) => (
            <div key={file.id} className="file-tag">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="remove-file-button"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <input
        type="text"
        placeholder="Ask Zypher AI anything about your task..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading} className="send-button">
        {loading ? "..." : "SEND"}
      </button>
    </form>
  );
};
