import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, getErrorMsg } from '../utils/formatters';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';

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

export default function Analytics() {
  const [trends, setTrends]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [period, setPeriod]         = useState('monthly');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardService.getTrends(period),
      dashboardService.getCategorySummary(),
    ])
      .then(([t, c]) => {
        const rawTrends = t.data?.trends || t.data?.data || t.data || [];
        setTrends(pivotTrends(Array.isArray(rawTrends) ? rawTrends : []));
        const rawCats = c.data?.categories || c.data?.data || c.data || [];
        setCategories(Array.isArray(rawCats) ? rawCats : []);
      })
      .catch((err) => toast.error(getErrorMsg(err)))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-surface-50)' }}>
            Analytics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-surface-400)' }}>
            Deep dive into your financial data
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)' }}>
          {['weekly','monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-surface-100)' }}>
            Income vs Expenses — {period} view
          </h3>
          {trends.length === 0 ? (
            <div className="flex items-center justify-center h-48"
              style={{ color: 'var(--color-surface-500)' }}>
              <p className="text-sm">No data for this period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5}
                  fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5}
                  fill="url(#expenseGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-surface-100)' }}>
            Spend by Category
          </h3>
          {categories.length === 0 ? (
            <div className="flex items-center justify-center h-48"
              style={{ color: 'var(--color-surface-500)' }}>
              <p className="text-sm">No category data.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categories} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={90} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-surface-100)' }}>
            Net Balance Over Time
          </h3>
          {trends.length === 0 ? (
            <div className="flex items-center justify-center h-48"
              style={{ color: 'var(--color-surface-500)' }}>
              <p className="text-sm">No data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends.map(t => ({
                ...t,
                net: (t.income || 0) - (t.expense || 0),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 4 }} activeDot={{ r: 6 }} name="Net Balance" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
