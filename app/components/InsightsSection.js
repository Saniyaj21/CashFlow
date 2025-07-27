'use client';

import { useState, useEffect } from 'react';
import { FaBrain, FaChartLine, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaRedo, FaStar, FaArrowUp, FaArrowDown, FaShieldAlt, FaBullseye, FaPiggyBank, FaChartPie, FaCoins, FaRocket } from 'react-icons/fa';
import { insightsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function InsightsSection() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await insightsAPI.getInsights();
      setInsights(response.insights);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights');
      toast.error('Failed to load financial insights');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    try {
      setRefreshing(true);
      const response = await insightsAPI.refreshInsights();
      setInsights(response.insights);
      toast.success('Insights refreshed!');
    } catch (err) {
      console.error('Error refreshing insights:', err);
      toast.error('Failed to refresh insights');
    } finally {
      setRefreshing(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthScoreEmoji = (score) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  const getHealthScoreMessage = (score) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good';
    return 'Needs attention';
  };

  // Use structured data from API instead of extracting from text
  const getStructuredData = (insights) => {
    return {
      totalIncome: insights.totalIncome || 0,
      totalExpense: insights.totalExpense || 0,
      netBalance: insights.netBalance || 0,
      savingsRate: insights.savingsRate || 0,
      topSpendingCategories: insights.topSpendingCategories || [],
      paymentMethodBreakdown: insights.paymentMethodBreakdown || { upi: 0, cash: 0 }
    };
  };

  // Generate investment suggestions based on savings
  const generateInvestmentSuggestions = (netBalance) => {
    const suggestions = [];
    
    if (netBalance < 0) {
      // Negative balance - focus on debt management
      suggestions.push({
        type: 'Emergency Fund',
        amount: '₹5,000',
        return: '4-6%',
        duration: 'Immediate',
        risk: 'Very Low',
        color: 'orange',
        priority: 'High'
      });
      suggestions.push({
        type: 'Debt Repayment',
        amount: '₹2,000/month',
        return: '15-20%',
        duration: 'Until debt free',
        risk: 'Very Low',
        color: 'red',
        priority: 'Critical'
      });
    } else if (netBalance >= 50000) {
      suggestions.push({
        type: 'Mutual Funds',
        amount: '₹25,000',
        return: '12-15%',
        duration: '5+ years',
        risk: 'Medium',
        color: 'blue',
        priority: 'Medium'
      });
      suggestions.push({
        type: 'Fixed Deposit',
        amount: '₹15,000',
        return: '7-8%',
        duration: '1-3 years',
        risk: 'Low',
        color: 'green',
        priority: 'Low'
      });
    } else if (netBalance >= 25000) {
      suggestions.push({
        type: 'SIP (Mutual Funds)',
        amount: '₹5,000/month',
        return: '12-15%',
        duration: '3+ years',
        risk: 'Medium',
        color: 'purple',
        priority: 'Medium'
      });
      suggestions.push({
        type: 'PPF',
        amount: '₹1,500/month',
        return: '7.1%',
        duration: '15 years',
        risk: 'Very Low',
        color: 'green',
        priority: 'Low'
      });
    } else {
      suggestions.push({
        type: 'Emergency Fund',
        amount: '₹10,000',
        return: '4-6%',
        duration: 'Immediate',
        risk: 'Very Low',
        color: 'orange',
        priority: 'High'
      });
      suggestions.push({
        type: 'RD (Recurring Deposit)',
        amount: '₹2,000/month',
        return: '6-7%',
        duration: '1-5 years',
        risk: 'Low',
        color: 'blue',
        priority: 'Medium'
      });
    }
    
    return suggestions;
  };

  // Generate savings opportunities based on structured spending data
  const generateSavingsOpportunities = (topSpendingCategories) => {
    const opportunities = [];
    
    topSpendingCategories.forEach(category => {
      if (category.amount > 1000) { // Only suggest savings for significant expenses
        const suggested = Math.round(category.amount * 0.6); // Suggest 40% reduction
        const savings = category.amount - suggested;
        
        opportunities.push({
          category: category.category,
          current: `₹${category.amount.toLocaleString()}`,
          suggested: `₹${suggested.toLocaleString()}`,
          savings: `₹${savings.toLocaleString()}`,
          tip: `Reduce ${category.category.toLowerCase()} spending`,
          percentage: category.percentage
        });
      }
    });
    
    return opportunities;
  };

  if (loading) {
    return (
      <div className="w-full max-w-xl flex flex-col items-center py-8">
        <div className="animate-pulse space-y-6 w-full">
          {/* Health Score Skeleton */}
          <div className="bg-white/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>

          {/* Insights Cards Skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 rounded-2xl p-6 shadow-sm">
              <div className="h-5 bg-gray-300 rounded w-24 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-xl flex flex-col items-center py-8">
        <div className="bg-red-50/80 rounded-2xl p-6 w-full text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Unable to Load Insights</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadInsights}
            className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="w-full max-w-xl flex flex-col items-center py-8">
        <div className="bg-blue-50/80 rounded-2xl p-6 w-full text-center">
          <div className="text-blue-600 text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">No Insights Available</h3>
          <p className="text-blue-600">Add some financial data to get personalized insights</p>
        </div>
      </div>
    );
  }

  // Get structured data from API
  const data = getStructuredData(insights);
  const investmentSuggestions = generateInvestmentSuggestions(data.netBalance);
  const savingsOpportunities = generateSavingsOpportunities(data.topSpendingCategories);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Refresh Button */}
      <div className="w-full flex justify-end mb-3">
        <button
          onClick={refreshInsights}
          disabled={refreshing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium ${
            refreshing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
          }`}
        >
          {refreshing ? (
            <>
              <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            <>
              <FaRedo size={12} />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Financial Health Score */}
      <div className="w-full bg-white/60 rounded-xl p-4 shadow-sm mb-3 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
            <FaStar className="text-yellow-500" size={14} />
            Financial Health
          </h3>
          <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getHealthScoreColor(insights.healthScore)}`}>
            {insights.healthScore}/100
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{getHealthScoreEmoji(insights.healthScore)}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${insights.healthScore}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 font-medium">
          {getHealthScoreMessage(insights.healthScore)} • {insights.healthScore >= 80 ? 'Keep it up!' :
           insights.healthScore >= 60 ? 'Room for improvement' :
           'Focus on recommendations below'}
        </p>
      </div>

      {/* Dynamic Quick Stats */}
      <div className="w-full grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/60 rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FaPiggyBank className={data.savingsRate >= 0 ? "text-green-500" : "text-red-500"} size={14} />
            <span className="text-xs font-semibold text-gray-700">Savings Rate</span>
          </div>
          <div className={`text-lg font-bold ${data.savingsRate >= 0 ? "text-green-600" : "text-red-600"}`}>
            {data.savingsRate >= 0 ? "+" : ""}{data.savingsRate}%
          </div>
          <div className="text-xs text-gray-500">
            {data.savingsRate >= 0 ? "of income saved" : "negative savings"}
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FaCoins className={data.netBalance >= 0 ? "text-blue-500" : "text-red-500"} size={14} />
            <span className="text-xs font-semibold text-gray-700">Net Balance</span>
          </div>
          <div className={`text-lg font-bold ${data.netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
            ₹{data.netBalance >= 0 ? "+" : ""}{data.netBalance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {data.netBalance >= 0 ? "available to invest" : "needs attention"}
          </div>
        </div>
      </div>

      {/* Investment Opportunities */}
      <div className="w-full bg-white/60 rounded-xl p-4 shadow-sm mb-3 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
          <FaRocket className={data.netBalance >= 0 ? "text-purple-500" : "text-red-500"} size={14} />
          {data.netBalance >= 0 ? "Investment Opportunities" : "Financial Priorities"}
        </h3>
        <div className="space-y-2">
          {investmentSuggestions.map((suggestion, index) => (
            <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg border ${
              suggestion.priority === 'Critical' ? 'bg-red-50 border-red-200' :
              suggestion.priority === 'High' ? 'bg-orange-50 border-orange-200' :
              'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 bg-${suggestion.color}-500 rounded-md flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{suggestion.type}</div>
                  <div className="text-xs text-gray-600">{suggestion.amount} • {suggestion.return} return</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-800">{suggestion.return}</div>
                <div className="text-xs text-gray-500">{suggestion.risk} risk</div>
                {suggestion.priority && (
                  <div className={`text-xs font-medium ${
                    suggestion.priority === 'Critical' ? 'text-red-600' :
                    suggestion.priority === 'High' ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {suggestion.priority}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Opportunities */}
      {savingsOpportunities.length > 0 && (
        <div className="w-full bg-white/60 rounded-xl p-4 shadow-sm mb-3 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
            <FaChartPie className="text-green-500" size={14} />
            Save More Money
          </h3>
          <div className="space-y-2">
            {savingsOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 bg-green-50/60 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">₹</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{opportunity.category}</div>
                    <div className="text-xs text-gray-600">{opportunity.tip}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-green-600">Save ₹{opportunity.savings}</div>
                  <div className="text-xs text-gray-500">{opportunity.current} → {opportunity.suggested}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Tips - Dynamic */}
      <div className="w-full bg-white/60 rounded-xl p-4 shadow-sm mb-3 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
          <FaLightbulb className="text-yellow-500" size={14} />
          Smart Tips
        </h3>
        <div className="space-y-2">
          {insights.smartTips.slice(0, 2).map((tip, index) => (
            <div key={index} className="flex items-start gap-2 p-2.5 bg-yellow-50/60 rounded-lg border border-yellow-100">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed">
                {tip.replace(/^Tip \d+: /, '')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Actions - Dynamic */}
      <div className="w-full bg-white/60 rounded-xl p-4 shadow-sm mb-3 border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
          <FaBullseye className="text-green-500" size={14} />
          Priority Actions
        </h3>
        <div className="space-y-2">
          {insights.priorityActions.slice(0, 2).map((action, index) => (
            <div key={index} className="flex items-start gap-2 p-2.5 bg-green-50/60 rounded-lg border border-green-100">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed">
                {action.replace(/^Action \d+: /, '')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight - Dynamic */}
      <div className="w-full bg-white/60 rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
          <FaChartLine className="text-purple-500" size={14} />
          Key Insight
        </h3>
        <div className="bg-purple-50/60 rounded-lg p-3 border border-purple-100">
          <p className="text-gray-700 text-xs leading-relaxed">
            {data.netBalance >= 0 
              ? `You have a net balance of ₹${data.netBalance.toLocaleString()} with a ${data.savingsRate}% savings rate. Consider exploring investment options like FDs or mutual funds.`
              : `Your net balance is ₹${data.netBalance.toLocaleString()} (negative). Focus on reducing expenses and building an emergency fund first.`
            }
          </p>
        </div>
      </div>
    </div>
  );
} 