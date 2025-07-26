'use client';
// EntryForm.js
// Form for adding income or expense entries
import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { categoriesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function EntryForm({ onAdd, onUpdate, editEntry, onCancelEdit }) {
  const isEditing = !!editEntry;
  
  const [type, setType] = useState(editEntry?.type || 'income');
  const [amount, setAmount] = useState(editEntry?.amount?.toString() || '');
  const [description, setDescription] = useState(editEntry?.description || '');
  const [date, setDate] = useState(editEntry?.date || new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(editEntry?.category || 'General');
  const [categories, setCategories] = useState(['General']);
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  // Reset form when editEntry changes
  useEffect(() => {
    if (editEntry) {
      setType(editEntry.type);
      setAmount(editEntry.amount.toString());
      setDescription(editEntry.description);
      setDate(editEntry.date);
      setCategory(editEntry.category);
    }
  }, [editEntry]);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await categoriesAPI.getAll();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Fallback to default categories
      const defaultCategories = [
        'General', 'Salary', 'Groceries', 'Food', 'Shopping',
        'Bills', 'Transport', 'Health', 'Entertainment', 'Other'
      ];
      setCategories(defaultCategories);
    } finally {
      setLoadingCategories(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    
    const entryData = {
      type,
      amount: parseFloat(amount),
      description,
      date,
      category,
    };

    if (isEditing) {
      onUpdate(editEntry.id, entryData);
    } else {
      onAdd({
        ...entryData,
        id: Date.now(),
      });
      // Clear form only when adding (not editing)
      setAmount('');
      setDescription('');
      setCategory('General');
    }
  }

  function handleCancel() {
    // Clear form inputs
    setType('income');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategory('General');
    
    if (onCancelEdit) {
      onCancelEdit();
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const trimmed = customCat.trim();
    if (!trimmed) return;
    
    if (categories.includes(trimmed)) {
      toast.error('Category already exists');
      return;
    }

    try {
      await categoriesAPI.create({ name: trimmed });
      const updatedCategories = [...categories, trimmed];
      setCategories(updatedCategories);
      setCategory(trimmed);
      toast.success('Category added successfully!');
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Failed to add category: ' + err.message);
    }
    
    setCustomCat('');
    setShowCustomCat(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-8 flex flex-col gap-6 w-full max-w-md items-stretch mx-auto mt-6 mb-8 animate-fade-in flex-1 justify-center">
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-700 font-semibold mb-1 tracking-wide uppercase">Type</span>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            aria-label="Add Income"
            onClick={() => setType('income')}
            className={`flex-1 px-4 py-3 font-semibold rounded-2xl transition-all duration-200 ${type==='income' ? 'bg-green-500 text-white scale-105' : 'bg-white/60 text-gray-700 hover:bg-green-100 hover:text-green-700'}`}
          >
            💰 Income
          </button>
          <button
            type="button"
            aria-label="Add Expense"
            onClick={() => setType('expense')}
            className={`flex-1 px-4 py-3 font-semibold rounded-2xl transition-all duration-200 ${type==='expense' ? 'bg-red-500 text-white scale-105' : 'bg-white/60 text-gray-700 hover:bg-red-100 hover:text-red-700'}`}
          >
            💸 Expense
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full min-w-[160px]">
        <span className="text-xs text-gray-700 font-semibold mb-1 tracking-wide uppercase">Amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="INR"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className="border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col gap-1 w-full min-w-[180px]">
        <span className="text-xs text-gray-700 font-semibold mb-1 tracking-wide uppercase">Description</span>
                  <input
            type="text"
            placeholder="e.g. Salary, Groceries"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
          />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-700 font-semibold mb-1 tracking-wide uppercase">Date</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col gap-1 w-full min-w-[140px]">
        <span className="text-xs text-gray-700 font-semibold mb-1 tracking-wide uppercase">Category</span>
        <div className="flex gap-2 w-full items-center">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Add custom category"
            onClick={() => setShowCustomCat(v => !v)}
            className="ml-1 px-3 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-105"
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
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full bg-white/80 text-gray-900 transition-all duration-200"
              maxLength={20}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(e); } }}
            />
            <button type="button" onClick={handleAddCategory} className="bg-blue-500 text-white px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all duration-200 hover:scale-105 font-semibold">Add</button>
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-4">
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-500 text-white font-bold py-4 px-8 rounded-2xl hover:bg-gray-600 transition-all duration-200 text-lg tracking-wide hover:scale-105"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-700 transition-all duration-200 text-lg min-w-[120px] tracking-wide hover:scale-105`}
        >
          {isEditing ? 'Update Entry' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
}
