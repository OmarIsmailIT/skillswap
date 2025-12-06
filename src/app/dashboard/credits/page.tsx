'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Transaction {
  _id: string;
  amountCredits: number;
  performedAt: string;
  fromUser?: { _id: string; name: string };
  toUser?: { _id: string; name: string };
  booking?: { skillOffer?: { title: string } };
}

interface CreditData {
  current: number;
  reserved: number;
  income: number;
  outcome: number;
}

export default function MyCreditsPage() {
  const [credits, setCredits] = useState<CreditData>({ current: 0, reserved: 0, income: 0, outcome: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'outcome'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/credits/me');
        if (!res.ok) throw new Error('Failed to fetch credits data');
        const data = await res.json();



        setCredits(data.credits);
        setUserId(data.userId);
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    trend
  }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: any;
    gradient: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div className="relative">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold text-gray-900">
            {loading ? (
              <div className="animate-pulse h-10 w-20 bg-gray-200 rounded"></div>
            ) : (
              value
            )}
          </h3>
          {trend && !loading && (
            <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );

  // ✅ FIX: Filter transactions based on userId comparison
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;

    // Convert both IDs to string for comparison
    const toUserId = transaction.toUser?._id?.toString();
    const isIncome = toUserId === userId;

    return filter === 'income' ? isIncome : !isIncome;
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Credits</h1>
          <p className="text-gray-600">Track your earning and spending activity</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Current Balance"
          value={credits.current}
          subtitle={`${credits.reserved} reserved`}
          icon={Wallet}
          gradient="from-purple-500 to-purple-700"
          trend="neutral"
        />

        <MetricCard
          title="Total Income"
          value={credits.income}
          subtitle="Credits earned"
          icon={TrendingUp}
          gradient="from-green-500 to-green-700"
          trend="up"
        />

        <MetricCard
          title="Total Outcome"
          value={credits.outcome}
          subtitle="Credits spent"
          icon={TrendingDown}
          gradient="from-pink-500 to-pink-700"
          trend="down"
        />
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-500 mt-1">Your complete credit activity</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg w-fit">
              <span className="text-xs font-medium text-gray-600">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'income'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilter('outcome')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'outcome'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Outcome
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {filter === 'income'
                ? "You haven't received any credits yet."
                : filter === 'outcome'
                  ? "You haven't spent any credits yet."
                  : "Start earning credits by offering your skills or spend them to learn from others!"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Offer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredTransactions.map((transaction) => {
                    const toUserIdStr = transaction.toUser?._id?.toString();
                    const isIncome = toUserIdStr === userId;
                    const amount = transaction.amountCredits;
                    const offerTitle = transaction.booking?.skillOffer?.title || 'Credit Transaction';
                    const date = new Date(transaction.performedAt);

                    return (
                      <tr
                        key={transaction._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isIncome
                            ? 'bg-green-100 text-green-700'
                            : 'bg-pink-100 text-pink-700'
                            }`}>
                            {isIncome ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                            <span className="text-xs font-semibold">
                              {isIncome ? 'Income' : 'Outcome'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {offerTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {transaction.fromUser?.name || 'System'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {transaction.toUser?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-pink-600'
                            }`}>
                            {isIncome ? '+' : '-'}{amount}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4 max-h-[500px] overflow-y-auto">
              {filteredTransactions.map((transaction) => {
                const toUserIdStr = transaction.toUser?._id?.toString();
                const isIncome = toUserIdStr === userId;
                const amount = transaction.amountCredits;
                const offerTitle = transaction.booking?.skillOffer?.title || 'Credit Transaction';
                const date = new Date(transaction.performedAt);

                return (
                  <div key={transaction._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isIncome
                        ? 'bg-green-100 text-green-700'
                        : 'bg-pink-100 text-pink-700'
                        }`}>
                        {isIncome ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-semibold">
                          {isIncome ? 'Income' : 'Outcome'}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-pink-600'}`}>
                        {isIncome ? '+' : '-'}{amount}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {offerTitle}
                    </h3>

                    <div className="flex justify-between items-end text-sm text-gray-500">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs uppercase tracking-wide text-gray-400">From:</span>
                          <span>{transaction.fromUser?.name || 'System'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs uppercase tracking-wide text-gray-400">To:</span>
                          <span>{transaction.toUser?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="text-xs text-gray-400">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
