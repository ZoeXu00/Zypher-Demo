// src/components/Chat/AssistantMessageRenderer.tsx
import React, { useMemo } from "react";
import type { AgentEvent, ImageContent, TableContent } from "../../types";
import { ImageDisplay } from "../Display/ImageDisplay";
import { TableDisplay } from "../Display/TableDisplay";

interface AssistantMessageRendererProps {
  events: AgentEvent[];
}

// Safely parse JSON/object content
const parseContent = <T extends object>(content: string | object): T | null => {
  if (typeof content === "object") return content as T;
  try {
    return JSON.parse(content as string) as T;
  } catch {
    return null;
  }
};

export const AssistantMessageRenderer: React.FC<
  AssistantMessageRendererProps
> = ({ events }) => {
  const renderedElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    let currentText = "";

    const flushText = (key: string | number) => {
      if (currentText) {
        elements.push(
          <div
            key={`text-${key}`}
            className="final-reply"
            dangerouslySetInnerHTML={{ __html: currentText }}
          />
        );
        currentText = "";
      }
    };

    events.forEach((event, eventIdx) => {
      const key = eventIdx;

      switch (event.type) {
        case "text":
          currentText += event.content as string;
          break;

        case "image":
          flushText(key);
          const imageData = parseContent<ImageContent>(event.content);
          if (imageData) {
            elements.push(<ImageDisplay key={key} content={imageData} />);
          }
          break;

        case "table":
          flushText(key);
          const tableData = parseContent<TableContent>(event.content);
          if (tableData) {
            elements.push(<TableDisplay key={key} content={tableData} />);
          }
          break;

        case "progress":
        case "thought":
        case "tool":
        case "error":
          flushText(key);

          if (event.type === "progress") {
            elements.push(
              <p key={key} className="progress-text">
                <strong>{event.content as string}</strong>
              </p>
            );
          } else if (event.type === "thought") {
            elements.push(
              <details key={key} className="thought-box">
                <summary>Agent Thought</summary>
                <pre>{event.content as string}</pre>
              </details>
            );
          }
          // Other types "tool" and "error" can be added later
          break;

        default:
          break;
      }
    });

    flushText("final");
    return elements;
  }, [events]);

  return <>{renderedElements}</>;
};
