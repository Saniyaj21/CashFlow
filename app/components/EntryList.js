'use client';

import { FaPlus, FaMinus } from 'react-icons/fa';

// EntryList.js
// List of entries with color coding
export default function EntryList({ entries, onDelete }) {
  if (!entries.length) return <p className="text-gray-400 text-center py-8">No entries yet.</p>;
  return (
    <ul className="space-y-4">
      {entries.map(entry => (
        <li key={entry.id} className={`flex flex-col gap-1 p-4 rounded-lg shadow border-l-8 ${entry.type==='income' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${entry.type==='income' ? 'text-green-700' : 'text-red-700'}`}>{entry.type === 'income' ? 'Income' : 'Expense'}</span>
              {entry.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{entry.category}</span>}
            </div>
            <span className="font-semibold text-xl flex items-center gap-1">
              {/* Show + or - icon for income/expense */}
              {entry.type === 'income' ? <FaPlus className="inline text-green-500" size={14} style={{fontWeight: 400, marginBottom: 1}} /> : <FaMinus className="inline text-red-500" size={14} style={{fontWeight: 400, marginBottom: 1}} />}
              <span className="align-middle">{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm">
            <span className="break-words max-w-full whitespace-pre-line">{entry.description}</span>
            <span className="ml-auto text-xs text-gray-400">{entry.date}</span>
            <button onClick={()=>onDelete(entry.id)} className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
