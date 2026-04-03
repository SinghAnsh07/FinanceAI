export function StatCard({ label, value, icon: Icon, trend, trendLabel, color = '#6366f1' }) {
  const trendPositive = trend > 0;

  return (
    <div className="stat-card">
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-surface-400)' }}>
            {label}
          </p>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-surface-50)' }}>
            {value}
          </p>
          {trendLabel && (
            <p
              className="text-xs mt-1.5 font-medium"
              style={{ color: trendPositive ? 'var(--color-success)' : 'var(--color-danger)' }}
            >
              {trendPositive ? '▲' : '▼'} {trendLabel}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}22`, color }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Card({ title, children, action, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-surface-100)' }}>
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
