export function StatCard({ label, value, tone = 'default', small }) {
  const toneClasses = {
    default: 'text-slate-900 dark:text-slate-100',
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-rose-600 dark:text-rose-400',
  }

  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${small ? 'p-2' : 'p-3'}`}
    >
      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`truncate ${small ? 'text-[13px]' : 'text-xl'} font-bold ${toneClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  )
}
