// TerminalHeader.tsx
import React from 'react';

const TerminalHeader: React.FC = () => {
  return (
    <div className="terminal-header">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full" title="Close"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Minimize"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full" title="Maximize"></div>
      </div>
      <div className="flex-1 text-center text-black text-xs font-semibold">
        THEO - SQL AI Agent Terminal
      </div>
    </div>
  );
};

export default TerminalHeader;
