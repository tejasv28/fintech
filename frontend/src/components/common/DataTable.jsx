import React from 'react';
import { Inbox } from 'lucide-react';

const DataTable = ({ columns, data, keyField = 'id', onRowClick, emptyMessage = "No data found." }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-card rounded-card shadow-card border border-border p-12 flex flex-col items-center justify-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-300 mb-4">
          <Inbox className="h-5 w-5" />
        </span>
        <p className="font-display text-sm font-semibold text-ink-900">{emptyMessage}</p>
        <p className="mt-1 text-[13px] text-ink-500">Records will appear here once available.</p>
      </div>
    );
  }
  return (
    <div className="bg-surface-card rounded-card shadow-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-[1.5px] border-ink-900">
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-3 text-left text-[11px] font-semibold text-ink-300 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row[keyField]} onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-border last:border-0 h-14 transition-colors duration-150 ${onRowClick ? 'cursor-pointer hover:bg-surface' : ''}`}>
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 whitespace-nowrap text-sm text-ink-900 ${idx === 0 ? 'font-medium' : ''} ${col.numeric ? 'text-right font-mono' : ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
