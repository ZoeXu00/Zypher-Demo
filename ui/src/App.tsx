// src/App.tsx
import { useState } from "react";
import "./App.css";

import type { HistoryItem, AgentEvent, UploadedFile } from "./types";
import { ChatBubble } from "./components/Chat/ChatBubble";
import { ChatInput } from "./components/Input/ChatInput";

// The full SSE streaming logic remains here as it's state-heavy.
function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW STATE – files queued for next user message
  const [filesToUpload, setFilesToUpload] = useState<UploadedFile[]>([]);

  // Internal: hold streaming assistant events during SSE
  const [streamingEvents, setStreamingEvents] = useState<AgentEvent[]>([]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();
    if ((!trimmed && filesToUpload.length === 0) || loading) return;

    // Add user message to history (includes attached files)
    const newUserMessage: HistoryItem = {
      role: "user",
      content: trimmed,
      files: filesToUpload,
    };
    setHistory((prev) => [...prev, newUserMessage]);

    // Prepare for new assistant reply
    setInput("");
    setFilesToUpload([]);
    setLoading(true);
    setStreamingEvents([]);

    const newAssistantItem: HistoryItem = { role: "assistant", events: [] };
    setHistory((prev) => [...prev, newAssistantItem]);

    try {
      // Body will later include file upload (placeholder for now)
      const url = new URL("http://localhost:8000/chat");
      const bodyData = {
        message: trimmed,
        files: filesToUpload.map((f) => ({ name: f.name, size: f.size })),
      };

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.body) throw new Error("No response body received.");

      // SSE STREAM READING LOOP
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = "";

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          streamBuffer += decoder.decode(value, { stream: true });
          const events = streamBuffer.split("\n\n");
          streamBuffer = events.pop() || "";

          for (const sseEvent of events) {
            if (sseEvent.startsWith("data:")) {
              try {
                const jsonString = sseEvent.substring(5).trim();
                const event: AgentEvent = JSON.parse(jsonString);

                setStreamingEvents((prev) => {
                  const updatedEvents = [...prev, event];

                  // Update last assistant bubble in history
                  setHistory((historyPrev) => {
                    const lastIndex = historyPrev.length - 1;
                    if (
                      lastIndex >= 0 &&
                      historyPrev[lastIndex].role === "assistant"
                    ) {
                      const updatedAssistantItem: HistoryItem = {
                        role: "assistant",
                        events: updatedEvents,
                      };
                      return [
                        ...historyPrev.slice(0, lastIndex),
                        updatedAssistantItem,
                      ];
                    }
                    return historyPrev;
                  });

                  return updatedEvents;
                });
              } catch (e) {
                console.error("Error parsing SSE JSON:", e, sseEvent);
              }
            } else if (sseEvent.includes("event: end")) {
              return;
            }
          }
        }
      };

      await processStream();
    } catch (err: any) {
      console.error(err);

      const errorEvent: AgentEvent = {
        type: "error",
        content: "Error talking to backend. Check console.",
      };

      // Append error to last assistant message
      setHistory((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex >= 0 && prev[lastIndex].role === "assistant") {
          const updatedEvents = [
            ...(prev[lastIndex] as { events: AgentEvent[] }).events,
            errorEvent,
          ];
          const updatedAssistantItem: HistoryItem = {
            role: "assistant",
            events: updatedEvents,
          };
          return [...prev.slice(0, lastIndex), updatedAssistantItem];
        }
        return prev;
      });
    } finally {
      setStreamingEvents([]);
      setLoading(false);
    }
  };

  // RENDER
  return (
    <div className="layout">
      <div className="left-pane">{/* Optional sidebar */}</div>

      <div className="right-pane">
        <div className="chat-header">
          Zypher <span className="status-dot" />
          <span className="status-text">Connected to Zypher</span>
        </div>

        <div className="chat-messages">
          {history.map((m, idx) => (
            <ChatBubble key={idx} item={m} />
          ))}
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          loading={loading}
          onSendMessage={sendMessage}
          files={filesToUpload}
          setFiles={setFilesToUpload}
        />
      </div>
    </div>
  );
}

export default App;
