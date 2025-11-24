// src/components/Display/ImageDisplay.tsx
import React from "react";
import type { ImageContent } from "../../types";

interface ImageDisplayProps {
  content: ImageContent;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ content }) => {
  return (
    <div className="ai-image-container">
      <img src={content.url} alt={content.alt} className="ai-generated-image" />
      <div className="image-actions">
        <a href={content.url} download={content.alt || "ai_image.png"}>
          ⬇️ Download
        </a>
        <span>|</span>
        <button onClick={() => alert("Simulating regeneration...")}>
          🔄 Regenerate
        </button>
      </div>
    </div>
  );
};
