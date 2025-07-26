'use client';
import { useMemo } from 'react';
import { FaChartBar } from 'react-icons/fa';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function StatsGraph({ entries }) {
  // Prepare data for area chart
  const data = useMemo(() => {
    const stats = {};
    entries.forEach(e => {
      if (!stats[e.date]) stats[e.date] = { date: e.date, income: 0, expense: 0 };
      stats[e.date][e.type] += e.amount;
    });
    // Sort by date
    return Object.values(stats).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const totalIncome = data.reduce((a, b) => a + b.income, 0);
  const totalExpense = data.reduce((a, b) => a + b.expense, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="rounded-2xl p-4 flex flex-col items-center w-full max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4 text-gray-800 tracking-tight text-center flex items-center justify-center gap-2">
        <FaChartBar className="text-blue-600" />
        Financial Overview
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6 w-full justify-items-center">
        <div className="flex flex-col items-center bg-green-50/60 rounded-2xl p-3 w-full max-w-[120px]">
          <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-white text-sm font-bold">↗</span>
          </div>
          <span className="text-xs text-gray-700 font-medium uppercase tracking-wide">Income</span>
          <div className="text-green-600 font-bold text-lg text-center">{totalIncome.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
        </div>
        <div className="flex flex-col items-center bg-red-50/60 rounded-2xl p-3 w-full max-w-[120px]">
          <div className="w-8 h-8 bg-red-500 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-white text-sm font-bold">↙</span>
          </div>
          <span className="text-xs text-gray-700 font-medium uppercase tracking-wide">Expense</span>
          <div className="text-red-500 font-bold text-lg text-center">{totalExpense.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
        </div>
        <div className={`flex flex-col items-center ${netBalance >= 0 ? 'bg-blue-50/60' : 'bg-orange-50/60'} rounded-2xl p-3 w-full max-w-[120px]`}>
          <div className={`w-8 h-8 ${netBalance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-lg mb-2 flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">=</span>
          </div>
          <span className="text-xs text-gray-700 font-medium uppercase tracking-wide">Balance</span>
          <div className={`font-bold text-lg text-center ${netBalance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{netBalance.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
        </div>
      </div>
            <div className="w-full h-64 flex justify-center mb-[200px]">
        <div className="w-full max-w-lg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#bbf7d0" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#fecaca" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {data.length < 1 && <div className="text-gray-600 text-sm mt-2 mb-[200px]">Add entries to see the chart.</div>}
    </div>
  );
}
