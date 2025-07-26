'use client';

import EntryForm from "./components/EntryForm";
import EntryList from "./components/EntryList";
import StatsGraph from "./components/StatsGraph";
import ProfileSection from "./components/ProfileSection";
import { useEffect, useState, useCallback } from "react";
import { FaHome, FaListUl, FaChartLine, FaPlusCircle, FaUserCircle } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { entriesAPI } from '../lib/api';
import { useUser, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  const { user, isLoaded } = useUser();
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('this-month'); // Filter for list page

  // Fix: Define createOrUpdateUser before useEffect
  const createOrUpdateUser = useCallback(async () => {
    try {
      if (!user) return;
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to create/update user');
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
    }
  }, [user]);

  // Load entries from database and handle user creation
  useEffect(() => {
    if (user && isLoaded) {
      loadEntries();
      // Create/update user in database
      createOrUpdateUser();
    }
  }, [user, isLoaded, createOrUpdateUser]);

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const fetchedEntries = await entriesAPI.getAll();
      setEntries(fetchedEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError(err.message);
      toast.error('Failed to load entries');
      
      // Fallback to demo data if API fails
      const demoEntries = [
        { id: 'demo1', type: 'income', amount: 50000, description: 'Salary', date: '2025-01-01', category: 'Salary' },
        { id: 'demo2', type: 'expense', amount: 1200, description: 'Groceries', date: '2025-01-02', category: 'Groceries' },
        { id: 'demo3', type: 'expense', amount: 800, description: 'Transport', date: '2025-01-03', category: 'Transport' },
      ];
      setEntries(demoEntries);
    } finally {
      setLoading(false);
    }
  }

  async function addEntry(entryData) {
    try {
      const newEntry = await entriesAPI.create(entryData);
      setEntries([newEntry, ...entries]);
      setActiveTab('list'); // Redirect to list after adding
      toast.success('Entry added successfully!');
    } catch (err) {
      console.error('Error adding entry:', err);
      toast.error('Failed to add entry: ' + err.message);
    }
  }

  async function updateEntry(id, entryData) {
    try {
      const updatedEntry = await entriesAPI.update(id, entryData);
      setEntries(entries.map(e => e.id === id ? updatedEntry : e));
      setEditingEntry(null);
      setActiveTab('list'); // Redirect to list after updating
      toast.success('Entry updated successfully!');
    } catch (err) {
      console.error('Error updating entry:', err);
      toast.error('Failed to update entry: ' + err.message);
    }
  }

  async function deleteEntry(id) {
    try {
      await entriesAPI.delete(id);
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry deleted successfully!');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry: ' + err.message);
    }
  }

  function handleEditEntry(entry) {
    setEditingEntry(entry);
    setActiveTab('home'); // Switch to form tab for editing
  }

  function handleCancelEdit() {
    setEditingEntry(null);
  }

  // Get filtered entries based on period
  const getFilteredEntries = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'this-month':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return entries.filter(e => new Date(e.date) >= thisMonthStart);
      case '30-days':
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entries.filter(e => new Date(e.date) >= thirtyDaysAgo);
      case '60-days':
        const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
        return entries.filter(e => new Date(e.date) >= sixtyDaysAgo);
      case '90-days':
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        return entries.filter(e => new Date(e.date) >= ninetyDaysAgo);
      case '6-months':
        const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
        return entries.filter(e => new Date(e.date) >= sixMonthsAgo);
      case '1-year':
        const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return entries.filter(e => new Date(e.date) >= oneYearAgo);
      case 'all':
      default:
        return entries;
    }
  };

  // Filtered entries for stats by date range
  const filteredEntries = entries.filter(e => {
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    return true;
  });

  // Get current filtered entries for list
  const currentFilteredEntries = getFilteredEntries(filterPeriod);

  // Mobile app-like main content switching
  let mainContent;
  if (activeTab === 'home') {
    mainContent = (
      <EntryForm 
        onAdd={addEntry} 
        onUpdate={updateEntry}
        editEntry={editingEntry}
        onCancelEdit={handleCancelEdit}
      />
    );
  } else if (activeTab === 'list') {
    // Calculate totals for the list header
    const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpense;

    mainContent = (
      <div className="w-full max-w-xl flex-1 flex flex-col items-center" style={{height: 'calc(100dvh - 120px)'}}>
        {loading ? (
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="text-gray-700">Loading entries...</div>
          </div>
        ) : (
          <>
            {/* Filter Pills */}
            <div className="w-full mb-4">
              <div className="relative">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    { value: 'this-month', label: 'This Month', active: 'bg-blue-500 text-white ring-2 ring-blue-300', inactive: 'bg-white/80 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-gray-200' },
                    { value: '30-days', label: '30 Days', active: 'bg-green-500 text-white ring-2 ring-green-300', inactive: 'bg-white/80 text-green-700 hover:bg-green-100 hover:text-green-800 border border-gray-200' },
                    { value: '60-days', label: '60 Days', active: 'bg-yellow-500 text-white ring-2 ring-yellow-300', inactive: 'bg-white/80 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 border border-gray-200' },
                    { value: '90-days', label: '90 Days', active: 'bg-orange-500 text-white ring-2 ring-orange-300', inactive: 'bg-white/80 text-orange-700 hover:bg-orange-100 hover:text-orange-800 border border-gray-200' },
                    { value: '6-months', label: '6 Months', active: 'bg-red-500 text-white ring-2 ring-red-300', inactive: 'bg-white/80 text-red-700 hover:bg-red-100 hover:text-red-800 border border-gray-200' },
                    { value: '1-year', label: '1 Year', active: 'bg-pink-500 text-white ring-2 ring-pink-300', inactive: 'bg-white/80 text-pink-700 hover:bg-pink-100 hover:text-pink-800 border border-gray-200' },
                    { value: 'all', label: 'All Time', active: 'bg-purple-500 text-white ring-2 ring-purple-300', inactive: 'bg-white/80 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-gray-200' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterPeriod(option.value)}
                      className={`relative px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        filterPeriod === option.value ? option.active : option.inactive
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary Header */}
            <div className="w-full rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center group">
                  <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-white text-sm font-bold">↗</span>
                  </div>
                  <div className="text-xs text-gray-700 font-medium uppercase tracking-wide">Income</div>
                  <div className="text-green-600 font-bold text-lg">{currentFilteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div className="text-center group">
                  <div className="w-8 h-8 bg-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-white text-sm font-bold">↙</span>
                  </div>
                  <div className="text-xs text-gray-700 font-medium uppercase tracking-wide">Expense</div>
                  <div className="text-red-500 font-bold text-lg">{currentFilteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div className="text-center group">
                  <div className={`w-8 h-8 ${(currentFilteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) - currentFilteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)) >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <span className="text-white text-sm font-bold">=</span>
                  </div>
                  <div className="text-xs text-gray-700 font-medium uppercase tracking-wide">Balance</div>
                  <div className={`font-bold text-lg ${(currentFilteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) - currentFilteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{(currentFilteredEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) - currentFilteredEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
              </div>
            </div>
            {/* Entries List */}
            <div className="flex-1 w-full overflow-y-auto rounded-2xl p-4 min-h-0 h-full">
              <EntryList entries={currentFilteredEntries} onDelete={deleteEntry} onEdit={handleEditEntry} />
            </div>
          </>
        )}
      </div>
    );
  } else if (activeTab === 'stats') {
    mainContent = (
      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap rounded-2xl p-6 w-full max-w-xl justify-center animate-fade-in items-stretch">
          <div className="flex flex-col items-center mx-2 flex-1 min-w-[120px]">
            <span className="text-xs font-semibold text-gray-700 mb-1 tracking-wide uppercase">From</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 text-sm w-full text-gray-900 transition-all duration-200" />
          </div>
          <span className="hidden sm:inline text-gray-400 font-bold text-lg mx-2">→</span>
          <div className="flex flex-col items-center mx-2 flex-1 min-w-[120px]">
            <span className="text-xs font-semibold text-gray-700 mb-1 tracking-wide uppercase">To</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 text-sm w-full text-gray-900 transition-all duration-200" />
          </div>
          <button
            type="button"
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="sm:ml-4 px-6 py-2 rounded-2xl bg-gray-600 text-white hover:bg-gray-700 font-semibold text-xs mt-3 sm:mt-5 h-10 w-full sm:w-auto transition-all duration-200 hover:scale-105"
          >
            Reset
          </button>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full rounded-2xl">
            <StatsGraph entries={filteredEntries} />
          </div>
        </div>
      </div>
    );
  } else if (activeTab === 'profile') {
    mainContent = <ProfileSection />;
  }

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex flex-col items-center pb-20">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm border-b border-blue-200/30 py-3 px-4 flex justify-around items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CashFlow</h1>
        </div>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl",
                userButtonPopoverCard: "rounded-2xl shadow-2xl",
                userButtonPopoverActionButton: "rounded-xl"
              }
            }}
          />
        </SignedIn>
      </header>
      
      {/* Main content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-3xl flex flex-col items-center gap-6 min-h-[calc(100dvh-120px)]">
          <SignedIn>
            {mainContent}
          </SignedIn>
          <SignedOut>
            <div className="w-full max-w-md flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                <FaUserCircle size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to CashFlow</h2>
              <p className="text-gray-600 text-center mb-6">Sign in to start tracking your finances</p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <SignInButton mode="modal">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 bg-white/70 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-white/90 transition-all duration-200 border border-gray-200">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>
        </div>
      </main>
      
      {/* Bottom Navigation - only show when signed in */}
      <SignedIn>
        <nav className="fixed bottom-4 left-4 right-4 z-20 bg-white/70 backdrop-blur-md rounded-3xl flex justify-around items-center h-16 mx-auto max-w-md">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-xs p-3 transition-all duration-200 ${activeTab==='home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}> <FaPlusCircle size={20} /> <span className="mt-1">Add</span> </button>
          <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center text-xs p-3 transition-all duration-200 ${activeTab==='list' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}> <FaListUl size={20} /> <span className="mt-1">List</span> </button>
          <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center text-xs p-3 transition-all duration-200 ${activeTab==='stats' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}> <FaChartLine size={20} /> <span className="mt-1">Stats</span> </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-xs p-3 transition-all duration-200 ${activeTab==='profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}> <FaUserCircle size={20} /> <span className="mt-1">Profile</span> </button>
        </nav>
      </SignedIn>
    </div>
  );
}
