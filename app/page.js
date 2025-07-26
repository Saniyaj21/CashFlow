'use client';

import EntryForm from "./components/EntryForm";
import EntryList from "./components/EntryList";
import StatsGraph from "./components/StatsGraph";
import { useEffect, useState } from "react";
import { FaHome, FaListUl, FaChartLine, FaPlusCircle, FaUserCircle } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("entries");
    const demoEntries = [
      { id: 1, type: 'income', amount: 50000, description: 'Salary', date: '2025-07-01', category: 'Salary' },
      { id: 2, type: 'expense', amount: 1200, description: 'Groceries', date: '2025-07-02', category: 'Groceries' },
      { id: 3, type: 'expense', amount: 800, description: 'Transport', date: '2025-07-03', category: 'Transport' },
      { id: 4, type: 'income', amount: 2000, description: 'Freelance', date: '2025-07-04', category: 'Other' },
      { id: 5, type: 'expense', amount: 3000, description: 'Shopping', date: '2025-07-05', category: 'Shopping' },
      { id: 6, type: 'expense', amount: 1500, description: 'Food', date: '2025-07-06', category: 'Food' },
      { id: 7, type: 'income', amount: 1000, description: 'Gift', date: '2025-07-07', category: 'Other' },
      { id: 8, type: 'expense', amount: 2500, description: 'Bills', date: '2025-07-08', category: 'Bills' },
      { id: 9, type: 'expense', amount: 900, description: 'Entertainment', date: '2025-07-09', category: 'Entertainment' },
      { id: 10, type: 'income', amount: 500, description: 'Interest', date: '2025-07-10', category: 'Other' },
    ];
    if (saved) {
      const existing = JSON.parse(saved);
      // Only add demo entries if not already present (by id)
      const existingIds = new Set(existing.map(e => e.id));
      const merged = [...existing, ...demoEntries.filter(e => !existingIds.has(e.id))];
      setEntries(merged);
    } else {
      setEntries(demoEntries);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  function addEntry(entry) {
    setEntries([entry, ...entries]);
    setActiveTab('list'); // Redirect to list after adding
    toast.success('Entry added!');
  }
  function deleteEntry(id) {
    setEntries(entries.filter(e => e.id !== id));
  }

  // Filtered entries for stats by date range
  const filteredEntries = entries.filter(e => {
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    return true;
  });

  // Mobile app-like main content switching
  let mainContent;
  if (activeTab === 'home') {
    mainContent = <EntryForm onAdd={addEntry} />;
  } else if (activeTab === 'list') {
    mainContent = (
      <div className="w-full max-w-xl flex-1 flex flex-col items-center" style={{height: 'calc(100dvh - 120px)'}}>
        <div className="flex-1 w-full overflow-y-auto rounded-2xl shadow-lg bg-white/90 p-2 border border-gray-100 min-h-0 h-full">
          <EntryList entries={entries} onDelete={deleteEntry} />
        </div>
      </div>
    );
  } else if (activeTab === 'stats') {
    mainContent = (
      <div className="w-full flex flex-col items-center" style={{height: 'calc(100dvh - 120px)'}}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 shadow border border-gray-100 w-full max-w-xl justify-center animate-fade-in items-stretch">
          <div className="flex flex-col items-center mx-2 flex-1 min-w-[120px]">
            <span className="text-xs font-semibold text-gray-600 mb-1 tracking-wide uppercase">From</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white shadow-sm text-sm w-full" />
          </div>
          <span className="hidden sm:inline text-gray-400 font-bold text-lg mx-2">→</span>
          <div className="flex flex-col items-center mx-2 flex-1 min-w-[120px]">
            <span className="text-xs font-semibold text-gray-600 mb-1 tracking-wide uppercase">To</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white shadow-sm text-sm w-full" />
          </div>
          <button
            type="button"
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="sm:ml-4 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 font-semibold text-xs shadow-sm mt-3 sm:mt-5 h-10 w-full sm:w-auto"
          >
            Reset
          </button>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          <StatsGraph entries={filteredEntries} />
        </div>
      </div>
    );
  } else if (activeTab === 'profile') {
    mainContent = (
      <div className="w-full max-w-md flex flex-col items-center justify-center py-8">
        <FaUserCircle size={64} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Profile</h2>
        <p className="text-gray-500 text-sm">Profile features coming soon.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-20">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="w-full sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200 shadow-sm py-4 px-4 flex justify-center">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">💸 Expense Tracker</h1>
      </header>
      {/* Main content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-3xl flex flex-col items-center gap-6 min-h-[calc(100dvh-120px)]">
          {mainContent}
        </div>
      </main>
      {/* Bottom Navigation for all devices */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 border-t border-gray-200 shadow-lg flex justify-around items-center h-16">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-xs ${activeTab==='home' ? 'text-blue-600' : 'text-gray-400'}`}> <FaPlusCircle size={24} /> Add </button>
        <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center text-xs ${activeTab==='list' ? 'text-blue-600' : 'text-gray-400'}`}> <FaListUl size={24} /> List </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center text-xs ${activeTab==='stats' ? 'text-blue-600' : 'text-gray-400'}`}> <FaChartLine size={24} /> Stats </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-xs ${activeTab==='profile' ? 'text-blue-600' : 'text-gray-400'}`}> <FaUserCircle size={24} /> Profile </button>
      </nav>
      {/* Footer for desktop */}
      {/* <footer className="hidden md:block w-full text-center text-xs text-gray-400 py-4 mt-8">© {new Date().getFullYear()} Cashflow. All rights reserved.</footer> */}
    </div>
  );
}
