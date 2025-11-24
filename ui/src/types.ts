// src/types.ts

// 1. UPDATE: Define TableContent as an array of objects (Raw JSON from AI)
export type TableContent = Record<string, any>[];

// 2. KEEP: ImageContent stays the same
export interface ImageContent {
  url: string;
  alt: string;
}

// 3. UPDATE: AgentEvent to explicitly include TableContent
export type AgentEvent = {
  type: "text" | "progress" | "thought" | "tool" | "error" | "image" | "table";
  // Content can be string, the specific Table array, or the Image object
  content: string | TableContent | ImageContent | any;
};

// ... Rest of your file stays the same ...
export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
};

export type HistoryItem =
  | { role: "user"; content: string; files?: UploadedFile[] }
  | { role: "assistant"; events: AgentEvent[] };
