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
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 flex flex-col gap-4 w-full max-w-md items-stretch mx-auto mt-2 mb-6 animate-fade-in flex-1">
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-700 font-semibold tracking-wide uppercase">Type</span>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            aria-label="Add Income"
            onClick={() => setType('income')}
            className={`flex-1 px-3 py-2.5 font-semibold rounded-xl transition-all duration-200 ${type==='income' ? 'bg-green-500 text-white scale-105' : 'bg-white/60 text-gray-700 hover:bg-green-100 hover:text-green-700'}`}
          >
            💰 Income
          </button>
          <button
            type="button"
            aria-label="Add Expense"
            onClick={() => setType('expense')}
            className={`flex-1 px-3 py-2.5 font-semibold rounded-xl transition-all duration-200 ${type==='expense' ? 'bg-red-500 text-white scale-105' : 'bg-white/60 text-gray-700 hover:bg-red-100 hover:text-red-700'}`}
          >
            💸 Expense
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-xs text-gray-700 font-semibold tracking-wide uppercase">Amount</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="INR"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200 pr-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
              {amount && !isNaN(amount) ? (
                type === 'income' ? (
                  parseFloat(amount) === 0 ? '😐' :
                  parseFloat(amount) < 100 ? '🙂' :
                  parseFloat(amount) < 500 ? '😃' :
                  parseFloat(amount) < 1000 ? '😁' :
                  parseFloat(amount) < 5000 ? '🤑' :
                  parseFloat(amount) < 10000 ? '🎉' :
                  '🚀'
                ) : (
                  parseFloat(amount) === 0 ? '😐' :
                  parseFloat(amount) < 100 ? '😅' :
                  parseFloat(amount) < 500 ? '😬' :
                  parseFloat(amount) < 1000 ? '😟' :
                  parseFloat(amount) < 5000 ? '😱' :
                  parseFloat(amount) < 10000 ? '💸' :
                  '💀'
                )
              ) : '💰'}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-xs text-gray-700 font-semibold tracking-wide uppercase">Date</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-700 font-semibold tracking-wide uppercase">Description</span>
        <input
          type="text"
          placeholder="e.g. Paisa jata kaha hai bhai?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-700 font-semibold tracking-wide uppercase">Category</span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex gap-2 w-full items-center">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-0 w-full bg-white/80 text-gray-900 transition-all duration-200"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Add custom category"
              onClick={() => setShowCustomCat(v => !v)}
              className="px-3 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <FaPlus size={14} />
            </button>
          </div>
          <div className="text-xs text-gray-500 ml-1">
            Click + to add a custom category
          </div>
        </div>
        {showCustomCat && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={customCat}
              onChange={e => setCustomCat(e.target.value)}
              placeholder="New category"
              className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full bg-white/80 text-gray-900 transition-all duration-200"
              maxLength={20}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(e); } }}
            />
            <button type="button" onClick={handleAddCategory} className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-all duration-200 hover:scale-105 font-semibold text-sm">Add</button>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-2">
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200 text-base tracking-wide hover:scale-105"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 text-base min-w-[120px] tracking-wide hover:scale-105`}
        >
          {isEditing ? 'Update' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}
