// Message.tsx
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MessageProps {
  text: string;
  type: "user" | "system";
  sql?: string;
  timestamp?: string;
}

const Message: React.FC<MessageProps> = ({ text, type, sql, timestamp }) => {
  return (
    <div
      className={`message ${
        type === "user" ? "user-message" : "system-message"
      }`}
    >
      <div className="flex items-center mb-1">
        <span className="font-bold mr-2">{type === "user" ? ">" : "THEO"}</span>
        {timestamp && (
          <span className="text-gray-500 text-xs">{timestamp}</span>
        )}
      </div>
      <div>{text}</div>
      {sql && (
        <div className="code-block mt-2">
          <SyntaxHighlighter language="sql" style={dracula}>
            {sql}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
};

export default Message;
