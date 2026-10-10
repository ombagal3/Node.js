import React from 'react';

const DashboardStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'indigo',
}) => {
  const schemeClasses = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      glow: 'from-indigo-600/10 to-indigo-900/0',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'from-emerald-600/10 to-emerald-900/0',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'from-amber-600/10 to-amber-900/0',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'from-rose-600/10 to-rose-900/0',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'from-cyan-600/10 to-cyan-900/0',
    },
  };

  const scheme = schemeClasses[colorScheme] || schemeClasses.indigo;

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl glass-card transition-all duration-300 hover:scale-[1.01]`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.glow} rounded-bl-full pointer-events-none`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.bg} ${scheme.border} ${scheme.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStatCard;
