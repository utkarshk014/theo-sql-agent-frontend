// TerminalBody.tsx
import React, { useRef, useEffect } from "react";
import Message from "./Message";
import SQLResult from "./SQLResult";

// Message format used by the Terminal component
interface MessageData {
  id: number;
  text: string;
  type: "user" | "system";
  timestamp: string;
  sql?: string;
  result?: {
    columns: string[];
    rows: Record<string, unknown>[];
  };
}

interface TerminalBodyProps {
  messages: MessageData[];
  isLoading: boolean;
}

const TerminalBody: React.FC<TerminalBodyProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="terminal-body p-4 overflow-y-auto">
      <div className="mb-4 text-green-400">
        <p>Welcome to THEO SQL Agent Terminal v1.0.0</p>
        <p>Type your database questions in natural language below.</p>
        <p>Type help for available commands.</p>
      </div>

      {isLoading ? (
        <div>Loading conversations...</div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <Message
              text={msg.text}
              type={msg.type}
              sql={msg.sql}
              timestamp={msg.timestamp}
            />
            {msg.result && (
              <SQLResult columns={msg.result.columns} rows={msg.result.rows} />
            )}
          </div>
        ))
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default TerminalBody;
