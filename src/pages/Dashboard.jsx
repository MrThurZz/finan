import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QuickEntryForm } from '../components/QuickEntryForm'
import { StatCard } from '../components/StatCard'
import { TransactionItem } from '../components/TransactionItem'
import { useTransactions } from '../hooks/useTransactions'
import { useSelfLoans, useSelfLoanMutations } from '../hooks/useSelfLoans'
import { formatCurrency } from '../lib/format'

export function Dashboard() {
  const { data: transactions = [], isLoading } = useTransactions({ limit: 15 })
  const { data: allTransactions = [] } = useTransactions()
  const { data: selfLoans = [] } = useSelfLoans()
  const { markPaid } = useSelfLoanMutations()

  const { saldoTotal, mesEntradas, mesSaidas } = useMemo(() => {
    const now = new Date()
    const mesAtual = now.getMonth()
    const anoAtual = now.getFullYear()

    let saldoTotal = 0
    let mesEntradas = 0
    let mesSaidas = 0

    for (const t of allTransactions) {
      const valor = Number(t.valor)
      saldoTotal += t.tipo === 'entrada' ? valor : -valor

      const [y, m] = t.data.split('-').map(Number)
      if (m - 1 === mesAtual && y === anoAtual) {
        if (t.tipo === 'entrada') mesEntradas += valor
        else mesSaidas += valor
      }
    }

    return { saldoTotal, mesEntradas, mesSaidas }
  }, [allTransactions])

  const pendentes = selfLoans.filter((l) => l.status === 'pendente')
  const totalPendente = pendentes.reduce((acc, l) => acc + Number(l.valor), 0)

  return (
    <div className="space-y-5">
      <QuickEntryForm />

      <div>
        <StatCard
          label="Saldo projetado (inclui parcelas futuras)"
          value={formatCurrency(saldoTotal)}
          tone={saldoTotal >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Resumo do mês
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Entradas" value={formatCurrency(mesEntradas)} tone="positive" small />
          <StatCard label="Saídas" value={formatCurrency(mesSaidas)} tone="negative" small />
          <StatCard
            label="Saldo"
            value={formatCurrency(mesEntradas - mesSaidas)}
            tone={mesEntradas - mesSaidas >= 0 ? 'positive' : 'negative'}
            small
          />
        </div>
      </div>

      {(pendentes.length > 0 || totalPendente > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Devo a mim mesmo
            </h2>
            <Link
              to="/devo-a-mim"
              className="text-xs font-medium text-amber-700 underline dark:text-amber-400"
            >
              Ver tudo
            </Link>
          </div>
          <p className="mb-2 text-lg font-bold text-amber-800 dark:text-amber-300">
            {formatCurrency(totalPendente)}
          </p>
          <ul className="space-y-1.5">
            {pendentes.slice(0, 3).map((loan) => (
              <li
                key={loan.id}
                className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-slate-900/50"
              >
                <span className="truncate">{loan.descricao || 'Empréstimo pessoal'}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold">{formatCurrency(loan.valor)}</span>
                  <button
                    onClick={() => markPaid.mutate(loan.id)}
                    className="rounded-full bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-700"
                  >
                    Pagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Últimos lançamentos
        </h2>
        {isLoading && <p className="text-sm text-slate-400">Carregando...</p>}
        {!isLoading && transactions.length === 0 && (
          <p className="text-sm text-slate-400">Nenhum lançamento ainda.</p>
        )}
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} />
          ))}
        </div>
      </div>
    </div>
  )
}
