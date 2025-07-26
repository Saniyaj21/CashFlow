'use client';
import { useMemo } from 'react';
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
    <div className="rounded-xl bg-white shadow-lg p-4 flex flex-col items-center w-full max-w-xl border border-gray-100">
      <h2 className="text-lg font-bold mb-2 text-gray-700 tracking-tight flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-1"></span> Income
        <span className="inline-block w-3 h-3 rounded-full bg-red-400 ml-4 mr-1"></span> Expense
      </h2>
      <div className="flex w-full justify-between mb-4">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-400">Total Income</span>
          <span className="text-green-600 font-bold text-lg">{totalIncome.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-400">Total Expense</span>
          <span className="text-red-500 font-bold text-lg">{totalExpense.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-400">Net Balance</span>
          <span className="text-blue-600 font-bold text-lg">{netBalance.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#bbf7d0" name="Income" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#fecaca" name="Expense" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {data.length < 1 && <div className="text-gray-400 text-sm mt-2">Add entries to see the chart.</div>}
    </div>
  );
}
