'use client';
import { useMemo, useState, useRef } from 'react';
import { FaChartBar } from 'react-icons/fa';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';

export default function StatsGraph({ entries }) {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Drag scroll handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
    timelineRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    timelineRef.current.style.cursor = 'grab';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    timelineRef.current.style.cursor = 'grab';
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed for touch
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date to dd/mm (short format)
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Format numbers to k format (e.g., 1000 -> 1k)
  const formatToK = (value) => {
    const roundedValue = Math.round(value * 100) / 100; // Round to 2 decimal places
    if (roundedValue >= 1000) {
      return (roundedValue / 1000).toFixed(roundedValue % 1000 === 0 ? 0 : 1) + 'k';
    }
    return roundedValue.toString();
  };

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

  // Prepare cash flow trend data (running balance)
  const trendData = useMemo(() => {
    if (data.length === 0) return [];
    
    let runningBalance = 0;
    return data.map(item => {
      runningBalance += (item.income - item.expense);
      return {
        date: item.date,
        balance: runningBalance,
        income: item.income,
        expense: item.expense,
        netChange: item.income - item.expense
      };
    });
  }, [data]);

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

      {/* Horizontal Timeline */}
      {data.length > 0 && (
        <div className="w-full mt-6 mb-6">
          <h3 className="text-md font-semibold text-gray-800 text-center mb-4">
            📅 Daily Timeline
          </h3>
          
          <div className="text-xs text-gray-500 mb-4 text-center">
            Hold and drag to scroll through your daily timeline
          </div>

          {/* Scrollable Timeline Container */}
          <div 
            ref={timelineRef}
            className="w-full overflow-x-auto scrollbar-hide select-none" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              cursor: 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center min-w-max px-4 py-6">
              {data.map((item, index) => (
                <div key={item.date} className="flex flex-col items-center mx-4 min-w-[80px]">
                  {/* Date above */}
                  <div className="text-xs text-gray-600 font-medium mb-2 whitespace-nowrap">
                    {formatDateShort(item.date)} {/* DD/MM format */}
                  </div>
                  
                  {/* Timeline dot and line */}
                  <div className="relative flex items-center">
                    {/* Line before dot (except first) */}
                    {index > 0 && (
                      <div className="w-8 h-0.5 bg-gray-300 absolute -left-8"></div>
                    )}
                    
                    {/* Dot */}
                    <div className={`w-4 h-4 rounded-full border-2 z-10 ${
                      (item.income - item.expense) >= 0 
                        ? 'bg-green-500 border-green-600' 
                        : 'bg-red-500 border-red-600'
                    }`}></div>
                    
                    {/* Line after dot (except last) */}
                    {index < data.length - 1 && (
                      <div className="w-8 h-0.5 bg-gray-300 absolute -right-8"></div>
                    )}
                  </div>
                  
                  {/* Income and Expense below */}
                  <div className="mt-2 text-center">
                    {item.income > 0 && (
                      <div className="text-xs text-green-600 font-semibold">
                        +{formatToK(item.income)}
                      </div>
                    )}
                    {item.expense > 0 && (
                      <div className="text-xs text-red-500 font-semibold">
                        -{formatToK(item.expense)}
                      </div>
                    )}
                    {item.income === 0 && item.expense === 0 && (
                      <div className="text-xs text-gray-400">
                        No activity
                      </div>
                    )}
                  </div>
                  
                  {/* Net change indicator */}
                  <div className={`text-xs font-bold mt-1 ${
                    (item.income - item.expense) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-500'
                  }`}>
                    {(item.income - item.expense) >= 0 ? '↗' : '↘'} {formatToK(Math.abs(item.income - item.expense))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline legend */}
          <div className="flex justify-center mt-4 space-x-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Positive day</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Negative day</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Chart explanation note */}
      <div className="text-xs text-gray-500 mb-2 text-center">
        Note: 1k = 1,000
      </div>
      
            <div className="w-full h-64 flex justify-center mb-4">
        <div className="w-full md:max-w-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDateShort} />
              <YAxis tickFormatter={formatToK} />
              <Tooltip 
                formatter={(value, name) => [
                  `${formatToK(value)} (${value.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})})`,
                  name
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {data.length < 1 && <div className="text-gray-600 text-sm mt-2 mb-4">Add entries to see the chart.</div>}

      {/* Cash Flow Trend Chart */}
      {trendData.length > 0 && (
        <div className="w-full mt-8 mb-4">
          <h3 className="text-md font-semibold text-gray-800 text-center mb-4">
            💰 Cash Flow Trend
          </h3>
          
          <div className="text-xs text-gray-500 mb-4 text-center">
            Running balance over time - see if you&apos;re building wealth or burning cash
          </div>

          {/* Trend insights */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 max-w-md">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Current Balance</div>
                  <div className={`text-lg font-bold ${trendData[trendData.length - 1]?.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatToK(trendData[trendData.length - 1]?.balance || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Trend</div>
                  <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                    trendData.length > 1 && 
                    trendData[trendData.length - 1]?.balance > trendData[trendData.length - 2]?.balance 
                      ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {trendData.length > 1 && 
                     trendData[trendData.length - 1]?.balance > trendData[trendData.length - 2]?.balance 
                       ? '📈 Up' : '📉 Down'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line chart */}
          <div className="w-full h-64 flex justify-center">
            <div className="w-full md:max-w-lg">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDateShort} 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={formatToK} 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${formatToK(value)} (${value.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})})`,
                      name
                    ]}
                    labelFormatter={(date) => `Date: ${formatDate(date)}`}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                    name="Running Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-[200px]"></div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide:active {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  );
}
