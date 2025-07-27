'use client';

import { FaTrash, FaArrowUp, FaArrowDown, FaTag, FaEdit } from 'react-icons/fa';
import { useState } from 'react';

// EntryList.js
// Modern card-based list of entries
export default function EntryList({ entries, onDelete, onEdit }) {
  const [deletingIds, setDeletingIds] = useState(new Set());

  const handleDelete = async (entryId) => {
    setDeletingIds(prev => new Set(prev).add(entryId));
    try {
      await onDelete(entryId);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(entryId);
        return newSet;
      });
    }
  };
  if (!entries.length) return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-4xl mb-3">💰</div>
      <p className="text-gray-600">No entries yet</p>
      <p className="text-gray-500 text-sm">Start by adding your first transaction</p>
    </div>
  );
  
  return (
    <div className="space-y-3">
      {entries.map(entry => (
                 <div key={entry.id} className="bg-white/80 rounded-2xl p-4 hover:bg-white/90 transition-all duration-200 hover:shadow-lg group">
          {/* Header with type indicator and amount */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.type==='income' ? 'bg-green-100' : 'bg-red-100'}`}>
                {entry.type === 'income' ? 
                  <FaArrowUp className="text-green-600" size={16} /> : 
                  <FaArrowDown className="text-red-600" size={16} />
                }
              </div>
              <div>
                <div className={`font-semibold text-lg ${entry.type==='income' ? 'text-green-700' : 'text-red-700'}`}>
                  {entry.type === 'income' ? 'Income' : 'Expense'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <FaTag className="text-gray-400" size={12} />
                  <span className="text-sm text-gray-600 font-medium">{entry.category}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    entry.paymentMethod === 'upi' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {entry.paymentMethod === 'upi' ? '📱 UPI' : '💵 Cash'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${entry.type==='income' ? 'text-green-600' : 'text-red-600'}`}>
                {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-1">{entry.date}</div>
            </div>
          </div>
          
          {/* Description */}
          {entry.description && (
            <div className="mb-3">
              <p className="text-gray-700 text-sm leading-relaxed">{entry.description}</p>
            </div>
          )}
          
                     {/* Footer with actions */}
           <div className="flex items-center justify-between pt-2 border-t border-gray-100">
             <div className="text-xs text-gray-500">
               {new Date(entry.date).toLocaleDateString('en-IN', { 
                 weekday: 'short', 
                 day: 'numeric', 
                 month: 'short' 
               })}
             </div>
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => onEdit(entry)} 
                 disabled={deletingIds.has(entry.id)}
                 className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                   deletingIds.has(entry.id)
                     ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                     : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                 }`}
               >
                 <FaEdit size={11} />
                 Edit
               </button>
               <button 
                 onClick={() => handleDelete(entry.id)} 
                 disabled={deletingIds.has(entry.id)}
                 className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                   deletingIds.has(entry.id)
                     ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                     : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                 }`}
               >
                 {deletingIds.has(entry.id) ? (
                   <>
                     <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                     Deleting...
                   </>
                 ) : (
                   <>
                     <FaTrash size={11} />
                     Delete
                   </>
                 )}
               </button>
             </div>
           </div>
        </div>
      ))}
    </div>
  );
}
