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
  const [paymentMethod, setPaymentMethod] = useState(editEntry?.paymentMethod || 'cash');
  const [categories, setCategories] = useState(['General']);
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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
      setPaymentMethod(editEntry.paymentMethod || 'cash');
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(amount) || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const entryData = {
        type,
        amount: parseFloat(amount),
        description,
        date,
        category,
        paymentMethod,
      };

      if (isEditing) {
        await onUpdate(editEntry.id, entryData);
      } else {
        await onAdd({
          ...entryData,
          id: Date.now(),
        });
        // Clear form only when adding (not editing)
        setAmount('');
        setDescription('');
        setCategory('General');
        setPaymentMethod('cash');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    // Clear form inputs
    setType('income');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategory('General');
    setPaymentMethod('cash');
    
    if (onCancelEdit) {
      onCancelEdit();
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const trimmed = customCat.trim();
    if (!trimmed || isAddingCategory) return;
    
    if (categories.includes(trimmed)) {
      toast.error('Category already exists');
      return;
    }

    setIsAddingCategory(true);
    
    try {
      await categoriesAPI.create({ name: trimmed });
      const updatedCategories = [...categories, trimmed];
      setCategories(updatedCategories);
      setCategory(trimmed);
      toast.success('Category added successfully!');
      setCustomCat('');
      setShowCustomCat(false);
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Failed to add category: ' + err.message);
    } finally {
      setIsAddingCategory(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-4 flex flex-col gap-3 w-full max-w-md items-stretch mx-auto mt-2 mb-4 animate-fade-in flex-1">
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-800 font-semibold tracking-wide uppercase">Type</span>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            aria-label="Add Income"
            onClick={() => setType('income')}
            className={`flex-1 px-3 py-2 font-semibold rounded-xl transition-all duration-200 ${type==='income' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-white/80 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'}`}
          >
            💰 Income
          </button>
          <button
            type="button"
            aria-label="Add Expense"
            onClick={() => setType('expense')}
            className={`flex-1 px-3 py-2 font-semibold rounded-xl transition-all duration-200 ${type==='expense' ? 'bg-rose-500 text-white shadow-md scale-105' : 'bg-white/80 text-gray-700 hover:bg-rose-50 hover:text-rose-700 border border-gray-200'}`}
          >
            💸 Expense
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-xs text-gray-800 font-semibold tracking-wide uppercase">Amount</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="INR"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              disabled={isSubmitting}
              className={`border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base min-w-0 w-full bg-white/90 text-gray-900 transition-all duration-200 pr-10 shadow-sm ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
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
          <span className="text-xs text-gray-800 font-semibold tracking-wide uppercase">Date</span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={isSubmitting}
            className={`border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-w-0 w-full bg-white/90 text-gray-900 transition-all duration-200 shadow-sm ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </div>
      
              <div className="flex flex-col gap-1 w-full">
          <span className="text-xs text-gray-800 font-semibold tracking-wide uppercase">Description</span>
          <input
            type="text"
            placeholder="e.g. Paisa jata kaha hai bhai?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isSubmitting}
            className={`border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-w-0 w-full bg-white/90 text-gray-900 transition-all duration-200 shadow-sm ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
        </div>

      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-800 font-semibold tracking-wide uppercase">Payment Method</span>
        <div className="flex gap-1 w-full bg-gray-50 rounded-xl p-1 border border-gray-100">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              paymentMethod === 'cash' 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            💵 Cash
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              paymentMethod === 'upi' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            📱 UPI
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-gray-800 font-semibold tracking-wide uppercase">Category</span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex gap-2 w-full items-center">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={isSubmitting}
              className={`border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-w-0 w-full bg-white/90 text-gray-900 transition-all duration-200 shadow-sm ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Add custom category"
              onClick={() => setShowCustomCat(v => !v)}
              className="px-3 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
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
              disabled={isAddingCategory}
              className={`border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 w-full bg-white/90 text-gray-900 transition-all duration-200 shadow-sm ${
                isAddingCategory ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              maxLength={20}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(e); } }}
            />
            <button 
              type="button" 
              onClick={handleAddCategory} 
              disabled={isAddingCategory}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2 ${
                isAddingCategory
                  ? 'bg-indigo-400 text-white cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105'
              }`}
            >
              {isAddingCategory ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                'Add'
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-2">
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-slate-500 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-600 transition-all duration-200 text-base tracking-wide hover:scale-105 shadow-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${isEditing ? 'flex-1' : 'w-full'} bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 text-base min-w-[120px] tracking-wide shadow-md flex items-center justify-center gap-2 ${
            isSubmitting 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:bg-indigo-700 hover:scale-105'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isEditing ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>{isEditing ? 'Update' : 'Save Transaction'}</>
          )}
        </button>
      </div>
    </form>
  );
}
