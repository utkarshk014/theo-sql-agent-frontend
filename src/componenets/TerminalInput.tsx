// TerminalInput.tsx
import React, { useState, KeyboardEvent } from 'react';

interface TerminalInputProps {
  onSendMessage: (message: string) => void;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="terminal-input">
      <span className="text-cyan-400 mr-2">theo&gt;</span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your database..."
        className="flex-1"
        autoFocus
      />
    </div>
  );
};

export default TerminalInput;