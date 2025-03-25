// SQLResult.tsx
import React from "react";

interface SQLResultProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

const SQLResult: React.FC<SQLResultProps> = ({ columns, rows }) => {
  if (!rows || rows.length === 0) {
    return <div className="mt-2 text-yellow-400">No results returned</div>;
  }

  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="text-left border border-gray-700 px-2 py-1 bg-gray-900"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-900/30" : ""}>
              {columns.map((col, j) => (
                <td key={j} className="border border-gray-700 px-2 py-1">
                  {typeof row[col] === "object"
                    ? JSON.stringify(row[col])
                    : row[col]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1 text-xs text-gray-500">
        {rows.length} rows returned
      </div>
    </div>
  );
};

export default SQLResult;