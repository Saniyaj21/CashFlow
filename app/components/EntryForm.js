'use client';
// EntryForm.js
// Form for adding income or expense entries
import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';

const CATEGORIES = [
  'General',
  'Salary',
  'Groceries',
  'Food',
  'Shopping',
  'Bills',
  'Transport',
  'Health',
  'Entertainment',
  'Other',
];

export default function EntryForm({ onAdd }) {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('General');
  const [categories, setCategories] = useState([...CATEGORIES]);
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState('');

  useEffect(() => {
    // Load categories from localStorage on mount (client only)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('categories') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    onAdd({
      id: Date.now(),
      type,
      amount: parseFloat(amount),
      description,
      date,
      category,
    });
    setAmount('');
    setDescription('');
    setCategory('General');
  }

  function handleAddCategory(e) {
    e.preventDefault();
    const trimmed = customCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setCategory(trimmed);
    }
    setCustomCat('');
    setShowCustomCat(false);
  }

  return (
    <form onSubmit={handleSubmit} className="shadow-2xl rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 p-6 flex flex-col gap-6 w-full max-w-md border border-gray-100 items-stretch mx-auto mt-6 mb-8 animate-fade-in flex-1 justify-center">
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-600 font-semibold mb-1 tracking-wide uppercase">Type</span>
        <div className="flex gap-0 w-full rounded-lg overflow-hidden border border-gray-200">
          <button
            type="button"
            aria-label="Add Income"
            onClick={() => setType('income')}
            className={`w-1/2 px-4 py-2 font-semibold transition-colors duration-150 ${type==='income' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 hover:bg-green-50'}`}
          >
            Income
          </button>
          <button
            type="button"
            aria-label="Add Expense"
            onClick={() => setType('expense')}
            className={`w-1/2 px-4 py-2 font-semibold transition-colors duration-150 ${type==='expense' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 hover:bg-red-50'}`}
          >
            Expense
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full min-w-[160px]">
        <span className="text-xs text-gray-600 font-semibold mb-1 tracking-wide uppercase">Amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="INR"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-200 text-lg min-w-0 w-full bg-white shadow-sm"
        />
      </div>
      <div className="flex flex-col gap-1 w-full min-w-[180px]">
        <span className="text-xs text-gray-600 font-semibold mb-1 tracking-wide uppercase">Description</span>
        <input
          type="text"
          placeholder="e.g. Salary, Groceries"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 w-full bg-white shadow-sm"
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-600 font-semibold mb-1 tracking-wide uppercase">Date</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 min-w-0 w-full bg-white shadow-sm"
        />
      </div>
      <div className="flex flex-col gap-1 w-full min-w-[140px]">
        <span className="text-xs text-gray-600 font-semibold mb-1 tracking-wide uppercase">Category</span>
        <div className="flex gap-2 w-full items-center">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 w-full bg-white shadow-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Add custom category"
            onClick={() => setShowCustomCat(v => !v)}
            className="ml-1 px-3 py-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200 flex items-center justify-center shadow-sm"
          >
            <FaPlus />
          </button>
        </div>
        {showCustomCat && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={customCat}
              onChange={e => setCustomCat(e.target.value)}
              placeholder="New category"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full bg-white shadow-sm"
              maxLength={20}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(e); } }}
            />
            <button type="button" onClick={handleAddCategory} className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 shadow-sm">Add</button>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-150 text-lg min-w-[120px] tracking-wide mt-2"
      >
        Add Entry
      </button>
    </form>
  );
}
