export function StatCard({ label, value, tone = 'default', small }) {
  const toneClasses = {
    default: 'text-slate-900 dark:text-slate-100',
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-rose-600 dark:text-rose-400',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`${small ? 'text-lg' : 'text-xl'} font-bold ${toneClasses[tone]}`}>{value}</p>
    </div>
  )
}
