// src/components/Display/TableDisplay.tsx
import React, { useMemo } from "react";

interface TableDisplayProps {
  tableText: string; // raw table text (markdown or csv)
}

export const TableDisplay: React.FC<TableDisplayProps> = ({ tableText }) => {
  const { headers, rows } = useMemo(() => {
    if (!tableText) return { headers: [], rows: [] };

    const lines = tableText
      .trim()
      .split("\n")
      .map((l) => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Detect MARKDOWN TABLE format (| col | col | col |)
    const isMarkdown = lines[0].includes("|");
    if (isMarkdown) {
      const strip = (line: string) =>
        line
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);

      // Remove separator row: ----|-----|----
      const filtered = lines.filter((l) => !/^[-| ]+$/.test(l));

      const headers = strip(filtered[0]);
      const rows = filtered.slice(1).map(strip);
      return { headers, rows };
    }

    // Fallback: CSV
    const parseCsv = (line: string) =>
      line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());

    const headers = parseCsv(lines[0]);
    const rows = lines.slice(1).map(parseCsv);
    return { headers, rows };
  }, [tableText]);

  if (headers.length === 0) return null;

  // Copy
  const handleCopy = () => {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    navigator.clipboard.writeText(csv);
    alert("Copied to clipboard!");
  };

  // Download
  const handleDownload = () => {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_table.csv";
    a.click();
  };

  return (
    <div className="ai-table-container">
      <div className="table-actions-top">
        <span className="table-badge">Generated Table</span>
        <div className="action-buttons">
          <button onClick={handleCopy}>📋 Copy</button>
          <button onClick={handleDownload}>⬇️ Download</button>
        </div>
      </div>

      <div className="table-scroll-wrapper">
        <table className="ai-generated-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
