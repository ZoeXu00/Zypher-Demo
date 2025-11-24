// src/components/Chat/ChatBubble.tsx
import React from "react";
import type { HistoryItem } from "../../types";
import { AssistantMessageRenderer } from "./AssistantMessageRenderer";

interface ChatBubbleProps {
  item: HistoryItem;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ item }) => {
  const isUser = item.role === "user";
  const className = `chat-bubble ${item.role}`;

  return (
    <div className={className}>
      {isUser ? (
        <>
          <div className="user-text">{item.content}</div>
          {item.files && item.files.length > 0 && (
            <div className="attached-files">
              {item.files.map((file) => (
                <span key={file.id} className="file-tag">
                  📎 {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <AssistantMessageRenderer events={item.events} />
      )}
    </div>
  );
};
