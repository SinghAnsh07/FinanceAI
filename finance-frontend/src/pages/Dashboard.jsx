import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, getErrorMsg } from '../utils/formatters';
import { StatCard } from '../components/ui/Cards';
import { SkeletonCard } from '../components/ui/Skeleton';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function pivotTrends(rawTrends) {
  const map = {};
  rawTrends.forEach(({ year, month, week, type, total }) => {
    const key = week != null ? `W${week} ${year}` : `${MONTH_NAMES[(month ?? 1) - 1]} ${year}`;
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
    if (type === 'income') map[key].income = total;
    else if (type === 'expense') map[key].expense = total;
  });
  return Object.values(map);
}


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass px-4 py-3 text-sm shadow-xl">
      <p className="font-medium mb-1" style={{ color: 'var(--color-surface-200)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};


export default function Dashboard() {
  const [summary, setSummary]   = useState(null);
  const [trends, setTrends]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getSummary(),
      dashboardService.getTrends('monthly'),
      dashboardService.getCategorySummary(),
    ])
      .then(([s, t, c]) => {
        const summaryData = s.data?.summary || s.data?.data || s.data;
        setSummary(summaryData);

        const rawTrends = t.data?.trends || t.data?.data || t.data || [];
        const pivoted = pivotTrends(Array.isArray(rawTrends) ? rawTrends : []);
        setTrends(pivoted);

        const rawCats = c.data?.categories || c.data?.data || c.data || [];
        setCategories(Array.isArray(rawCats) ? rawCats : []);
      })
      .catch((err) => toast.error(getErrorMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton h-8 w-48 mb-1" />
          <div className="skeleton h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const income  = summary?.totalIncome  ?? 0;
  const expense = summary?.totalExpense ?? summary?.totalExpenses ?? 0;
  const balance = summary?.netBalance   ?? (income - expense);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-surface-50)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-surface-400)' }}>
          Your financial overview at a glance
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(income)}
          icon={TrendingUp}
          color="#10b981"
          trendLabel="this period"
          trend={1}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(expense)}
          icon={TrendingDown}
          color="#ef4444"
          trendLabel="this period"
          trend={-1}
        />
        <StatCard
          label="Net Balance"
          value={formatCurrency(balance)}
          icon={balance >= 0 ? Wallet : DollarSign}
          color={balance >= 0 ? '#6366f1' : '#f59e0b'}
          trendLabel={balance >= 0 ? 'positive' : 'deficit'}
          trend={balance >= 0 ? 1 : -1}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-surface-100)' }}>
            Monthly Trends
          </h3>
          {trends.length === 0 ? (
            <div className="flex items-center justify-center h-48"
              style={{ color: 'var(--color-surface-500)' }}>
              <p className="text-sm">No trend data yet. Add some records!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-surface-100)' }}>
            Category Breakdown
          </h3>
          {categories.length === 0 ? (
            <div className="flex items-center justify-center h-48"
              style={{ color: 'var(--color-surface-500)' }}>
              <p className="text-sm">No categories yet.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {categories.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ color: 'var(--color-surface-300)' }}>{c.category}</span>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--color-surface-200)' }}>
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
