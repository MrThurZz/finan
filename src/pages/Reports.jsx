import { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency, monthLabel } from '../lib/format'

export function Reports() {
  const { data: transactions = [], isLoading } = useTransactions()
  const [monthOffset, setMonthOffset] = useState(0)

  const refDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - monthOffset)
    return d
  }, [monthOffset])

  const categoriaData = useMemo(() => {
    const y = refDate.getFullYear()
    const m = refDate.getMonth()
    const byCat = new Map()
    for (const t of transactions) {
      if (t.tipo !== 'saida') continue
      const [ty, tm] = t.data.split('-').map(Number)
      if (ty !== y || tm - 1 !== m) continue
      const nome = t.categories?.nome || 'Sem categoria'
      const cor = t.categories?.cor || '#64748b'
      const cur = byCat.get(nome) || { nome, valor: 0, cor }
      cur.valor += Number(t.valor)
      byCat.set(nome, cur)
    }
    return [...byCat.values()].sort((a, b) => b.valor - a.valor)
  }, [transactions, refDate])

  const totalMes = categoriaData.reduce((acc, c) => acc + c.valor, 0)

  const mensalData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, d })
    }
    const map = new Map(months.map((m) => [m.key, { mes: monthLabel(`${m.key}-01`), entradas: 0, saidas: 0 }]))
    for (const t of transactions) {
      const key = t.data.slice(0, 7)
      if (!map.has(key)) continue
      const entry = map.get(key)
      if (t.tipo === 'entrada') entry.entradas += Number(t.valor)
      else entry.saidas += Number(t.valor)
    }
    return [...map.values()]
  }, [transactions])

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">Relatórios</h1>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Gastos por categoria
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset((o) => o + 1)}
              className="rounded-full px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ‹
            </button>
            <span className="min-w-[80px] text-center text-sm font-medium capitalize">
              {refDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
              disabled={monthOffset === 0}
              className="rounded-full px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              ›
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          {isLoading && <p className="text-sm text-slate-400">Carregando...</p>}
          {!isLoading && categoriaData.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">Sem saídas neste mês.</p>
          )}
          {categoriaData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoriaData}
                    dataKey="valor"
                    nameKey="nome"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {categoriaData.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 space-y-1.5">
                {categoriaData.map((c) => (
                  <li key={c.nome} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.cor }} />
                      {c.nome}
                    </span>
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      {formatCurrency(c.valor)}
                      <span className="text-xs">
                        ({totalMes ? ((c.valor / totalMes) * 100).toFixed(0) : 0}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Entradas x Saídas (12 meses)
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mensalData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={48} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="entradas" fill="#10b981" radius={[4, 4, 0, 0]} name="Entradas" />
              <Bar dataKey="saidas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
